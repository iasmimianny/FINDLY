"""Serviço de notificações do Findly.

Dispara alertas por **e-mail**, **push** e notificações internas quando:

1. Há *match* entre um item perdido e um achado (nos dois sentidos: ao cadastrar
   o achado ou ao abrir o alerta de perda).
2. Um item muda de custódia (o autor do achado é avisado do novo ponto).
3. Um claim é aprovado e o item fica aguardando retirada.
4. A retirada é confirmada e a entrega é finalizada.

Boas práticas adotadas:

- O envio é agendado com ``transaction.on_commit``: se a transação de negócio
  falhar, nenhuma notificação, e-mail ou push é disparado.
- Falhas de entrega são registradas no log e **não** interrompem a operação.
- O canal de push é opcional (``NOTIFICATIONS_PUSH_ENABLED``); sem provedor
  configurado ele apenas registra a mensagem no log.
- As notificações internas são armazenadas no banco de dados e podem ser
  consultadas pelo usuário autenticado.
"""

from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone

from apps.items.models import FoundItem, ItemStatus, LostReport, LostReportStatus

logger = logging.getLogger(__name__)

# Termos ignorados na comparação de similaridade (evitam matches falsos).
STOPWORDS: frozenset[str] = frozenset(
    {
        "achado",
        "achada",
        "achei",
        "alguem",
        "com",
        "como",
        "contem",
        "cor",
        "compre",
        "de",
        "do",
        "dos",
        "ela",
        "ele",
        "em",
        "encontrado",
        "encontrada",
        "encontrei",
        "era",
        "essa",
        "esse",
        "esta",
        "este",
        "foi",
        "item",
        "muito",
        "nao",
        "nas",
        "no",
        "nos",
        "object",
        "objeto",
        "os",
        "para",
        "perdi",
        "perdido",
        "perdida",
        "por",
        "que",
        "sem",
        "sobre",
        "tem",
        "uma",
        "um",
        "uns",
        "umas",
    }
)

# Só palavras com este tamanho mínimo entram na comparação.
MIN_KEYWORD_LENGTH = 4

TERMINAL_STATUSES = frozenset(
    {ItemStatus.DEVOLVIDO, ItemStatus.EXPIRADO, ItemStatus.ENCAMINHADO}
)


@dataclass(frozen=True)
class NotificationMessage:
    """Mensagem pronta para entrega (independente do canal)."""

    kind: str
    recipients: tuple[str, ...]
    subject: str
    body: str


# ---------------------------------------------------------------------------
# Matching
# ---------------------------------------------------------------------------
def _normalize(value: str) -> str:
    """Remove acentos e converte para minúsculas."""
    decomposed = unicodedata.normalize("NFKD", value or "")
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch)).lower()


def keywords(value: str) -> set[str]:
    """Palavras significativas de um texto (sem acentos/stopwords)."""
    tokens = re.findall(r"[a-z0-9]+", _normalize(value))
    return {
        token
        for token in tokens
        if len(token) >= MIN_KEYWORD_LENGTH and token not in STOPWORDS
    }


def _match_window() -> timedelta:
    return timedelta(days=settings.MATCH_WINDOW_DAYS)


def _related_keywords(title: str, description: str) -> set[str]:
    return keywords(f"{title} {description}")


def find_matching_lost_reports(found_item: FoundItem) -> list[LostReport]:
    """Alertas abertos que podem corresponder a um achado.

    Critérios: mesma categoria, alerta aberto antes do achado (janela de
    ``MATCH_WINDOW_DAYS``) e ao menos uma palavra significativa em comum.
    """
    found_keywords = _related_keywords(found_item.title, found_item.description)
    if not found_keywords:
        return []

    candidates = (
        LostReport.objects.filter(
            status=LostReportStatus.ABERTO,
            category=found_item.category,
            lost_at__lte=found_item.found_at,
            lost_at__gte=found_item.found_at - _match_window(),
        )
        .select_related("owner")
        .order_by("lost_at")
    )

    matches = [
        report
        for report in candidates
        if found_keywords & _related_keywords(report.title, report.description)
    ]
    return matches[: settings.MATCH_NOTIFICATION_LIMIT]


def find_matching_found_items(lost_report: LostReport) -> list[FoundItem]:
    """Achados ativos que podem corresponder a um alerta de perda."""
    lost_keywords = _related_keywords(lost_report.title, lost_report.description)
    if not lost_keywords:
        return []

    candidates = (
        FoundItem.objects.filter(
            category=lost_report.category,
            found_at__gte=lost_report.lost_at,
            found_at__lte=lost_report.lost_at + _match_window(),
        )
        .exclude(status__in=TERMINAL_STATUSES)
        .select_related("reported_by")
        .order_by("found_at")
    )

    matches = [
        item
        for item in candidates
        if lost_keywords & _related_keywords(item.title, item.description)
    ]
    return matches[: settings.MATCH_NOTIFICATION_LIMIT]


# ---------------------------------------------------------------------------
# Entrega
# ---------------------------------------------------------------------------
def _format_datetime(value) -> str:
    if not value:
        return "não informado"
    return timezone.localtime(value).strftime("%d/%m/%Y às %H:%M")


def _format_point(point) -> str:
    if point is None:
        return "o ponto de coleta responsável"
    if point.opening_hours:
        return f"{point.name} ({point.address}) — {point.opening_hours}"
    return f"{point.name} ({point.address})"


def _deliver_email(message: NotificationMessage) -> None:
    if not message.recipients:
        return
    send_mail(
        message.subject,
        message.body,
        settings.DEFAULT_FROM_EMAIL,
        list(message.recipients),
        fail_silently=False,
    )


def _deliver_push(message: NotificationMessage) -> None:
    """Entrega Web Push às inscrições ativas dos destinatários.

    Sem ``NOTIFICATIONS_PUSH_ENABLED`` ou sem o par VAPID, apenas registra no
    log. Inscrições expiradas (HTTP 404/410) são desativadas automaticamente.
    """
    if not settings.NOTIFICATIONS_PUSH_ENABLED:
        logger.debug(
            "Push desabilitado; notificação %s para %s não enviada.",
            message.kind,
            ", ".join(message.recipients),
        )
        return

    # Imports tardios evitam ciclo (o app de notificações depende do serviço).
    from apps.notifications.models import PushSubscription

    from . import push_service

    subscriptions = list(
        PushSubscription.objects.filter(
            user__email__in=message.recipients,
            is_active=True,
        ).select_related("user")
    )
    if not subscriptions:
        logger.debug(
            "Nenhuma inscrição de push ativa para %s.",
            ", ".join(message.recipients),
        )
        return

    payload = {
        "kind": message.kind,
        "title": message.subject,
        "body": message.body,
    }
    delivered = 0
    for subscription in subscriptions:
        result = push_service.send(subscription.as_subscription_info(), payload)
        if result == push_service.SENT:
            subscription.mark_used()
            delivered += 1
        elif result == push_service.EXPIRED:
            PushSubscription.objects.filter(pk=subscription.pk).update(
                is_active=False
            )

    logger.info(
        "Push %s: %s/%s inscrição(ões) entregues.",
        message.kind,
        delivered,
        len(subscriptions),
    )


def deliver(message: NotificationMessage) -> None:
    """Entrega pelos canais disponíveis, isolando falhas de cada canal."""
    try:
        _deliver_email(message)
    except Exception:  # noqa: BLE001 - notificação nunca derruba o negócio
        logger.exception(
            "Falha ao enviar e-mail %s para %s.",
            message.kind,
            ", ".join(message.recipients),
        )
    try:
        _deliver_push(message)
    except Exception:  # noqa: BLE001
        logger.exception("Falha ao enviar push %s.", message.kind)


# ---------------------------------------------------------------------------
# Notificações internas
# ---------------------------------------------------------------------------
def create_internal_notifications(
    message: NotificationMessage,
) -> None:
    """Registra notificações internas dos destinatários.

    As notificações são armazenadas no banco de dados independentemente
    da disponibilidade dos canais de e-mail e Web Push.
    """
    from apps.notifications.models import Notification
    from apps.users.models import User

    if not message.recipients:
        return

    recipients = User.objects.filter(
        email__in=message.recipients,
        is_active=True,
    )

    # Evita armazenar tokens de retirada ou outras informações
    # sensíveis presentes nos templates de e-mail.
    internal_messages = {
        "match": (
            "Encontramos possíveis correspondências "
            "para um objeto que você perdeu."
        ),
        "custody": (
            "A custódia de um objeto que você registrou "
            "foi atualizada."
        ),
        "awaiting_pickup": (
            "Sua solicitação foi aprovada. "
            "Consulte os detalhes da retirada."
        ),
        "withdrawal_confirmed": (
            "A devolução do objeto foi concluída."
        ),
        "claim_rejected": (
            "Sua solicitação de retirada não foi aprovada."
        ),
    }

    body = internal_messages.get(
        message.kind,
        "Você possui uma nova atualização no Findly.",
    )

    notifications = [
        Notification(
            user=user,
            kind=message.kind,
            title=message.subject[:255],
            message=body,
        )
        for user in recipients
    ]

    if notifications:
        Notification.objects.bulk_create(notifications)

        logger.info(
            "Notificação interna %s registrada para %s destinatário(s).",
            message.kind,
            len(notifications),
        )


def notify_internal(
    *,
    users,
    kind: str,
    title: str,
    message: str,
) -> None:
    """Agenda notificações exclusivamente internas.

    Permite notificar usuários e funcionários sem disparar
    e-mails ou mensagens de Web Push.

    Os destinatários devem ser definidos pelo serviço responsável
    pela operação.
    """
    user_ids = {
        user.pk
        for user in users
        if user is not None and user.pk is not None
    }

    if not user_ids:
        return

    def _save() -> None:
        from apps.notifications.models import Notification
        from apps.users.models import User

        try:
            recipients = User.objects.filter(
                pk__in=user_ids,
                is_active=True,
            )

            notifications = [
                Notification(
                    user=user,
                    kind=kind,
                    title=title[:255],
                    message=message,
                )
                for user in recipients
            ]

            if notifications:
                Notification.objects.bulk_create(notifications)

        except Exception:  # noqa: BLE001
            logger.exception(
                "Falha ao registrar notificações internas do tipo %s.",
                kind,
            )

    transaction.on_commit(_save)


def dispatch(message: NotificationMessage) -> NotificationMessage:
    """Agenda a entrega para depois do commit da transação atual.

    As notificações internas são registradas no banco de dados antes
    do envio pelos demais canais.

    Com ``NOTIFICATIONS_ASYNC_ENABLED`` a entrega vai para a fila do Celery;
    se o broker estiver indisponível, cai para o envio síncrono sem quebrar a
    operação de negócio.
    """

    def _send() -> None:
        # Registra as notificações internas apenas uma vez,
        # antes do envio para a fila do Celery.
        try:
            create_internal_notifications(message)

        except Exception:  # noqa: BLE001
            logger.exception(
                "Falha ao registrar notificação interna %s.",
                message.kind,
            )

        if settings.NOTIFICATIONS_ASYNC_ENABLED:
            try:
                from apps.notifications.tasks import send_notification

                send_notification.delay(
                    {
                        "kind": message.kind,
                        "recipients": list(message.recipients),
                        "subject": message.subject,
                        "body": message.body,
                    }
                )
                return
            except Exception:  # noqa: BLE001 - broker fora não pode derrubar o fluxo
                logger.exception(
                    "Fila indisponível; enviando notificação %s de forma síncrona.",
                    message.kind,
                )
        deliver(message)

    transaction.on_commit(_send)
    return message


def _recipients(*emails: str | None) -> tuple[str, ...]:
    """Normaliza, remove vazios e duplicados preservando a ordem."""
    return tuple(dict.fromkeys(email for email in emails if email))


# ---------------------------------------------------------------------------
# Notificações de match
# ---------------------------------------------------------------------------
def notify_found_item_matches(
    found_item: FoundItem,
) -> list[LostReport]:
    """Avisa os donos de alertas compatíveis com um achado recém-cadastrado."""
    matches = find_matching_lost_reports(found_item)
    for report in matches:
        body = render_to_string(
            "items/notifications/match.txt",
            {
                "found_item": found_item,
                "lost_report": report,
                "frontend_url": settings.FRONTEND_URL,
            },
        )
        dispatch(
            NotificationMessage(
                kind="match",
                recipients=_recipients(report.owner.email),
                subject=(f"Possível match para {report.title} — Findly"),
                body=body,
            )
        )
    return matches


def notify_lost_report_matches(lost_report: LostReport) -> list[FoundItem]:
    """Avisa o dono do alerta quando já existem achados compatíveis."""
    matches = find_matching_found_items(lost_report)
    if not matches:
        return []

    body = render_to_string(
        "items/notifications/lost_report_matches.txt",
        {
            "lost_report": lost_report,
            "found_items": matches,
            "count": len(matches),
            "frontend_url": settings.FRONTEND_URL,
        },
    )
    dispatch(
        NotificationMessage(
            kind="match",
            recipients=_recipients(lost_report.owner.email),
            subject=f"Encontramos itens parecidos com {lost_report.title} — Findly",
            body=body,
        )
    )
    return matches


# ---------------------------------------------------------------------------
# Notificações de operações
# ---------------------------------------------------------------------------
def notify_custody_changed(item: FoundItem, point, actor=None) -> None:
    """Avisa o autor do achado sobre a nova custódia em um ponto de coleta."""
    body = render_to_string(
        "operations/notifications/custody.txt",
        {
            "item": item,
            "point": point,
            "actor": actor,
            "frontend_url": settings.FRONTEND_URL,
        },
    )
    dispatch(
        NotificationMessage(
            kind="custody",
            recipients=_recipients(item.reported_by.email),
            subject=f"Seu achado {item.public_code} chegou a {point.name} — Findly",
            body=body,
        )
    )


def notify_awaiting_pickup(claim, withdrawal, *, point=None) -> None:
    """Avisa o reivindicante aprovado que o item está pronto para retirada."""
    body = render_to_string(
        "operations/notifications/awaiting_pickup.txt",
        {
            "claim": claim,
            "item": claim.item,
            "withdrawal": withdrawal,
            "point": point,
            "point_line": _format_point(point),
            "expires_at": _format_datetime(withdrawal.expires_at),
            "frontend_url": settings.FRONTEND_URL,
        },
    )
    dispatch(
        NotificationMessage(
            kind="awaiting_pickup",
            recipients=_recipients(claim.claimant.email),
            subject=f"Retirada liberada: {claim.item.title} — Findly",
            body=body,
        )
    )


def notify_withdrawal_confirmed(claim, withdrawal, *, point=None) -> None:
    """Avisa reivindicante e autor do achado que a entrega foi concluída."""
    item = claim.item
    body = render_to_string(
        "operations/notifications/withdrawal_confirmed.txt",
        {
            "claim": claim,
            "item": item,
            "withdrawal": withdrawal,
            "point": point,
            "confirmed_at": _format_datetime(withdrawal.used_at),
            "frontend_url": settings.FRONTEND_URL,
        },
    )
    dispatch(
        NotificationMessage(
            kind="withdrawal_confirmed",
            recipients=_recipients(claim.claimant.email, item.reported_by.email),
            subject=f"Entrega concluída: {item.title} — Findly",
            body=body,
        )
    )


# ---------------------------------------------------------------------------
# Notificações de novas reivindicações
# ---------------------------------------------------------------------------
def notify_new_claim(claim, *, point=None) -> None:
    """Avisa os funcionários responsáveis pelo ponto de coleta.

    A notificação é exclusivamente interna e não é enviada
    para funcionários de outros pontos de coleta.
    """
    if point is None:
        return

    operators = point.operators.filter(is_active=True)

    notify_internal(
        users=operators,
        kind="new_claim",
        title="Nova solicitação de retirada",
        message=(
            f"Uma nova solicitação foi registrada para o objeto "
            f'"{claim.item.title}". Acesse as solicitações para analisá-la.'
        ),
    )


def notify_claim_rejected(claim) -> None:
    """Avisa o usuário que sua reivindicação não foi aprovada."""
    notify_internal(
        users=[claim.claimant],
        kind="claim_rejected",
        title="Solicitação não aprovada",
        message=(
            f'Sua solicitação referente ao objeto "{claim.item.title}" '
            "não foi aprovada. Consulte os detalhes da solicitação."
        ),
    )


def notify_staff_custody_changed(
    item: FoundItem,
    point,
    *,
    actor=None,
) -> None:
    """Avisa os funcionários responsáveis sobre a chegada de um objeto."""
    if point is None:
        return

    operators = point.operators.filter(is_active=True)

    # Evita notificar o próprio funcionário que realizou a operação.
    if actor is not None:
        operators = operators.exclude(pk=actor.pk)

    notify_internal(
        users=operators,
        kind="staff_custody",
        title="Novo objeto no ponto de coleta",
        message=(
            f'O objeto "{item.title}" está sob custódia '
            f"do ponto de coleta {point.name}."
        ),
    )

# ---------------------------------------------------------------------------
# Notificação de novo objeto encontrado
# ---------------------------------------------------------------------------
def notify_staff_found_item_created(item: FoundItem) -> None:
    """Avisa os funcionários sobre um novo objeto encontrado."""

    from apps.users.models import User

    operators = User.objects.filter(
        role="operator",
        is_active=True,
    ).exclude(pk=item.reported_by_id)

    notify_internal(
        users=operators,
        kind="staff_found_item_created",
        title="Novo objeto encontrado cadastrado",
        message=(
            f'O objeto "{item.title}" foi registrado como encontrado. '
            f"Código: {item.public_code}. "
            "Acesse os itens encontrados para consultar os detalhes."
        ),
    )

__all__ = [
    "NotificationMessage",
    "deliver",
    "dispatch",
    "create_internal_notifications",
    "notify_internal",
    "find_matching_found_items",
    "find_matching_lost_reports",
    "keywords",
    "notify_awaiting_pickup",
    "notify_custody_changed",
    "notify_found_item_matches",
    "notify_lost_report_matches",
    "notify_withdrawal_confirmed",
    "notify_new_claim",
    "notify_claim_rejected",
    "notify_staff_custody_changed",
    "notify_staff_found_item_created",
]