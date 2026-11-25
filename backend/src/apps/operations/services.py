"""Regras de negócio de operações.

Toda troca de custódia, decisão de claim e retirada roda em ``transaction.atomic``
e grava auditoria no mesmo bloco. As views apenas validam dados e chamam estes
serviços.

Fluxo resumido:

.. code-block:: text

    REPORTADO --(transferência para ponto)--> EM_CUSTODIA
    EM_CUSTODIA --(claim aprovado)--> AGUARDANDO_RETIRADA
    AGUARDANDO_RETIRADA --(QR confirmado)--> DEVOLVIDO
"""

from __future__ import annotations

from typing import Any

from django.core.exceptions import PermissionDenied
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.audit.models import AuditAction
from apps.audit.services import record_event
from apps.items.models import FoundItem, ItemStatus, LostReport, LostReportStatus
from apps.items.services import transition_found_item
from apps.users.models import User
from services import notification_service
from services.qrcode_service import extract_withdrawal_token

from .models import (
    WITHDRAWAL_TTL,
    Claim,
    ClaimStatus,
    CollectionPoint,
    CustodyRecord,
    WithdrawalAuthority,
    generate_withdrawal_token,
)


class OperationError(ValueError):
    """Erro de regra de negócio do app de operações."""


class InvalidCustody(OperationError):
    """Transferência de custódia inválida."""


class InvalidClaim(OperationError):
    """Reivindicação inválida ou em estado incompatível."""


class InvalidWithdrawal(OperationError):
    """QR Code de retirada inválido, expirado ou já utilizado."""


# ---------------------------------------------------------------------------
# Custódia
# ---------------------------------------------------------------------------
def active_custody(item: FoundItem) -> CustodyRecord | None:
    """Registro de custódia aberto do item (se houver)."""
    return (
        CustodyRecord.objects.select_related("collection_point", "held_by_user")
        .filter(item=item, ended_at__isnull=True)
        .first()
    )


def current_collection_point(item: FoundItem) -> CollectionPoint | None:
    """Ponto de coleta que detém o item neste momento, se aplicável."""
    record = active_custody(item)
    return record.collection_point if record else None


def require_point_responsibility(item: FoundItem, user: User) -> None:
    """Operações físicas/decisões pertencem ao operador do ponto atual."""
    if user.is_admin:
        return
    point = current_collection_point(item)
    if (
        not user.is_operator
        or point is None
        or not point.operators.filter(pk=user.pk).exists()
    ):
        raise PermissionDenied(
            "Você não é responsável pelo ponto de coleta deste item."
        )


@transaction.atomic
def open_initial_custody(item: FoundItem, user: User, note: str = "") -> CustodyRecord:
    """Abre a custódia inicial com quem cadastrou o item.

    Não grava evento próprio: a criação já é registrada como ``CREATED``.
    """
    existing = (
        CustodyRecord.objects.select_for_update()
        .filter(item=item, ended_at__isnull=True)
        .first()
    )
    if existing:
        return existing
    return CustodyRecord.objects.create(
        item=item,
        held_by_user=user,
        note=note or "Cadastro do item",
    )


def _close_active_custody(item: FoundItem, *, when=None, note: str = "") -> None:
    record = (
        CustodyRecord.objects.select_for_update()
        .filter(item=item, ended_at__isnull=True)
        .first()
    )
    if not record:
        return
    record.ended_at = when or timezone.now()
    if note:
        record.note = note
    record.save(update_fields=["ended_at", "note"])


def close_item_operations(item: FoundItem, *, note: str) -> int:
    """Close custody and pending claims while the caller holds the item lock."""
    _close_active_custody(item, note=note)
    pending = list(Claim.objects.filter(item=item, status=ClaimStatus.PENDING))
    for claim in pending:
        reject_claim(claim, user=None, decision_note=note)
    return len(pending)


@transaction.atomic
def transfer_to_point(
    item: FoundItem,
    point: CollectionPoint,
    *,
    user: User,
    note: str = "",
) -> CustodyRecord:
    """Transfere a custódia do item para um ponto de coleta autorizado."""
    item = FoundItem.objects.select_for_update().get(pk=item.pk)
    point = CollectionPoint.objects.select_for_update().get(pk=point.pk)

    if not point.is_active:
        raise InvalidCustody("O ponto de coleta está desativado.")

    if (
        user.is_operator
        and not user.is_admin
        and not point.operators.filter(pk=user.pk).exists()
    ):
        raise InvalidCustody("Você não é responsável por este ponto de coleta.")

    if item.status not in {ItemStatus.REPORTADO, ItemStatus.EM_CUSTODIA}:
        raise InvalidCustody(
            "Só é possível transferir itens REPORTADOS ou EM_CUSTODIA."
        )

    current = (
        CustodyRecord.objects.select_for_update()
        .filter(item=item, ended_at__isnull=True)
        .first()
    )
    if current and current.collection_point_id is not None:
        require_point_responsibility(item, user)
    if current and current.collection_point_id == point.pk:
        raise InvalidCustody("O item já está neste ponto de coleta.")

    if not point.has_capacity:
        raise InvalidCustody("O ponto de coleta atingiu a capacidade máxima.")

    previous_status = item.status
    now = timezone.now()
    holder_before: dict[str, Any] = {}
    if current:
        if current.collection_point_id:
            holder_before = {"collection_point": current.collection_point_id}
        else:
            holder_before = {"user": current.held_by_user_id}

    _close_active_custody(item, when=now, note="Transferido para ponto de coleta")

    record = CustodyRecord.objects.create(
        item=item,
        collection_point=point,
        note=note,
        started_at=now,
    )

    if item.status == ItemStatus.REPORTADO:
        item = transition_found_item(item, ItemStatus.EM_CUSTODIA, user=user)

    record_event(
        item=item,
        action=AuditAction.CUSTODY_TRANSFERRED,
        user=user,
        previous_status=previous_status,
        new_status=item.status,
        collection_point=point,
        metadata={
            "from": holder_before,
            "to": {"collection_point": point.pk},
            "note": note,
        },
    )

    # Notifica o usuário que cadastrou o objeto.
    notification_service.notify_custody_changed(
        item,
        point,
        actor=user,
    )

    # Notifica os funcionários responsáveis pelo ponto de coleta.
    notification_service.notify_staff_custody_changed(
        item,
        point,
        actor=user,
    )

    return record


# ---------------------------------------------------------------------------
# Claims
# ---------------------------------------------------------------------------
@transaction.atomic
def submit_claim(item: FoundItem, claimant: User, message: str = "") -> Claim:
    """Registra uma reivindicação pendente de avaliação."""
    item = FoundItem.objects.select_for_update().get(pk=item.pk)

    if item.is_terminal:
        raise InvalidClaim("Este item já encerrou o ciclo de vida.")

    if item.reported_by_id == claimant.pk:
        raise InvalidClaim("Quem cadastrou o item não pode reivindicá-lo.")

    if Claim.objects.filter(item=item, status=ClaimStatus.APPROVED).exists():
        raise InvalidClaim("Este item já possui uma retirada autorizada.")

    if Claim.objects.filter(
        item=item, claimant=claimant, status=ClaimStatus.PENDING
    ).exists():
        raise InvalidClaim("Você já possui uma reivindicação pendente para este item.")

    try:
        claim = Claim.objects.create(
            item=item,
            claimant=claimant,
            message=message,
        )
    except IntegrityError as exc:  # corrida entre duas requisições simultâneas
        raise InvalidClaim(
            "Você já possui uma reivindicação pendente para este item."
        ) from exc

    # Identifica o ponto de coleta responsável pelo objeto.
    point = current_collection_point(item)

    # Notifica os funcionários sobre a nova solicitação.
    notification_service.notify_new_claim(
        claim,
        point=point,
    )

    return claim


def _reject_other_pending_claims(
    claim: Claim, *, user: User, reason: str, status: str
) -> None:
    others = (
        Claim.objects.select_for_update()
        .filter(item=claim.item, status=ClaimStatus.PENDING)
        .exclude(pk=claim.pk)
    )

    now = timezone.now()
    for other in others:
        other.status = ClaimStatus.REJECTED
        other.reviewed_by = user
        other.reviewed_at = now
        other.decision_note = reason
        other.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "decision_note",
                "updated_at",
            ]
        )
        record_event(
            item=claim.item,
            action=AuditAction.CLAIM_REJECTED,
            user=user,
            previous_status=status,
            new_status=status,
            collection_point=current_collection_point(claim.item),
            metadata={"claim": other.pk, "reason": reason},
        )

        # Notifica o usuário cuja solicitação foi rejeitada automaticamente.
        notification_service.notify_claim_rejected(other)


def _lock_claim(claim: Claim) -> tuple[FoundItem, Claim]:
    item = FoundItem.objects.select_for_update().get(pk=claim.item_id)
    locked = Claim.objects.select_for_update().get(pk=claim.pk)
    locked.item = item
    return item, locked


@transaction.atomic
def approve_claim(claim: Claim, *, user: User, decision_note: str = "") -> Claim:
    """Aprova o claim, coloca o item em ``AGUARDANDO_RETIRADA`` e emite o QR."""
    item, claim = _lock_claim(claim)
    if claim.status != ClaimStatus.PENDING:
        raise InvalidClaim("Apenas reivindicações pendentes podem ser aprovadas.")

    if item.status != ItemStatus.EM_CUSTODIA:
        raise InvalidClaim(
            "O item precisa estar em custódia de um ponto de coleta para ser entregue."
        )

    require_point_responsibility(item, user)
    previous_status = item.status
    now = timezone.now()

    item = transition_found_item(item, ItemStatus.AGUARDANDO_RETIRADA, user=user)

    claim.status = ClaimStatus.APPROVED
    claim.reviewed_by = user
    claim.reviewed_at = now
    claim.decision_note = decision_note
    claim.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "decision_note",
            "updated_at",
        ]
    )

    authority = WithdrawalAuthority.objects.create(
        claim=claim,
        expires_at=now + WITHDRAWAL_TTL,
        created_by=user,
    )

    _reject_other_pending_claims(
        claim,
        user=user,
        reason="Outra reivindicação foi aprovada.",
        status=item.status,
    )

    point = current_collection_point(item)
    record_event(
        item=item,
        action=AuditAction.CLAIM_APPROVED,
        user=user,
        previous_status=previous_status,
        new_status=item.status,
        collection_point=point,
        metadata={
            "claim": claim.pk,
            "claimant": claim.claimant_id,
            "withdrawal": authority.pk,
            "decision_note": decision_note,
        },
    )

    # Notifica o usuário sobre a aprovação e liberação da retirada.
    notification_service.notify_awaiting_pickup(
        claim,
        authority,
        point=point,
    )

    return claim


@transaction.atomic
def reject_claim(claim: Claim, *, user: User | None, decision_note: str = "") -> Claim:
    """Recusa uma reivindicação pendente.

    ``user`` pode ser ``None`` quando a recusa é automática (expiração do item).
    """
    item, claim = _lock_claim(claim)
    if claim.status != ClaimStatus.PENDING:
        raise InvalidClaim("Apenas reivindicações pendentes podem ser recusadas.")

    if user is not None:
        require_point_responsibility(item, user)

    claim.status = ClaimStatus.REJECTED
    claim.reviewed_by = user
    claim.reviewed_at = timezone.now()
    claim.decision_note = decision_note
    claim.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "decision_note",
            "updated_at",
        ]
    )

    record_event(
        item=claim.item,
        action=AuditAction.CLAIM_REJECTED,
        user=user,
        previous_status=claim.item.status,
        new_status=claim.item.status,
        collection_point=current_collection_point(claim.item),
        metadata={
            "claim": claim.pk,
            "claimant": claim.claimant_id,
            "decision_note": decision_note,
        },
    )

    # Notifica o usuário sobre a rejeição da solicitação.
    notification_service.notify_claim_rejected(claim)

    return claim


@transaction.atomic
def cancel_claim(claim: Claim, *, user: User) -> Claim:
    """Cancela o próprio claim enquanto ele está pendente."""
    _, claim = _lock_claim(claim)

    if claim.claimant_id != user.pk and not user.is_admin:
        raise InvalidClaim("Apenas o autor do claim pode cancelá-lo.")

    if claim.status != ClaimStatus.PENDING:
        raise InvalidClaim("Apenas reivindicações pendentes podem ser canceladas.")

    claim.status = ClaimStatus.CANCELLED
    claim.save(update_fields=["status", "updated_at"])

    record_event(
        item=claim.item,
        action=AuditAction.CLAIM_CANCELLED,
        user=user,
        previous_status=claim.item.status,
        new_status=claim.item.status,
        collection_point=current_collection_point(claim.item),
        metadata={"claim": claim.pk},
    )
    return claim


# ---------------------------------------------------------------------------
# Retirada
# ---------------------------------------------------------------------------
@transaction.atomic
def reissue_withdrawal(claim: Claim, *, user: User, decision_note: str = "") -> Claim:
    item, claim = _lock_claim(claim)
    require_point_responsibility(item, user)
    if (
        claim.status != ClaimStatus.APPROVED
        or item.status != ItemStatus.AGUARDANDO_RETIRADA
    ):
        raise InvalidWithdrawal("O item precisa estar aguardando retirada.")

    authority = (
        WithdrawalAuthority.objects.select_for_update().filter(claim=claim).first()
    )
    if authority is None or authority.used_at is not None or not authority.is_expired:
        raise InvalidWithdrawal(
            "Só uma autorização vencida e sem uso pode ser reemitida."
        )

    authority.token = generate_withdrawal_token()
    authority.expires_at = timezone.now() + WITHDRAWAL_TTL
    authority.save(update_fields=["token", "expires_at"])
    item.save(update_fields=["updated_at"])
    point = current_collection_point(item)
    record_event(
        item=item,
        action=AuditAction.WITHDRAWAL_REISSUED,
        user=user,
        previous_status=item.status,
        new_status=item.status,
        collection_point=point,
        metadata={"withdrawal": authority.pk, "decision_note": decision_note},
    )
    notification_service.notify_awaiting_pickup(claim, authority, point=point)
    return claim


@transaction.atomic
def confirm_withdrawal(raw_token: str, *, user: User) -> WithdrawalAuthority:
    """Valida o QR Code e conclui a retirada (uso único)."""
    token = extract_withdrawal_token(raw_token)
    if not token:
        raise InvalidWithdrawal("Informe o token do QR Code de retirada.")

    item_id = (
        WithdrawalAuthority.objects.filter(token=token)
        .values_list("claim__item_id", flat=True)
        .first()
    )
    if item_id is None:
        raise InvalidWithdrawal("QR Code de retirada inválido.")

    item = FoundItem.objects.select_for_update().get(pk=item_id)
    authority = (
        WithdrawalAuthority.objects.select_for_update().filter(token=token).first()
    )
    if authority is None:
        raise InvalidWithdrawal("QR Code de retirada inválido.")
    if authority.used_at is not None:
        raise InvalidWithdrawal("Este QR Code já foi utilizado.")
    if authority.is_expired:
        raise InvalidWithdrawal(
            "Este QR Code expirou. Solicite uma nova autorização de retirada."
        )

    claim = authority.claim
    if claim.status != ClaimStatus.APPROVED:
        raise InvalidWithdrawal("A reivindicação vinculada não está aprovada.")

    if item.status != ItemStatus.AGUARDANDO_RETIRADA:
        raise InvalidWithdrawal("O item não está aguardando retirada neste momento.")

    require_point_responsibility(item, user)
    previous_status = item.status
    point = current_collection_point(item)
    item = transition_found_item(item, ItemStatus.DEVOLVIDO, user=user)

    now = timezone.now()
    authority.used_at = now
    authority.save(update_fields=["used_at"])
    _close_active_custody(item, when=now, note="Retirado pelo proprietário")

    if item.lost_report_id is not None:
        LostReport.objects.filter(
            pk=item.lost_report_id,
            owner_id=claim.claimant_id,
            status=LostReportStatus.ABERTO,
        ).update(
            status=LostReportStatus.ENCONTRADO,
            updated_at=now,
        )

    record_event(
        item=item,
        action=AuditAction.WITHDRAWAL_CONFIRMED,
        user=user,
        previous_status=previous_status,
        new_status=item.status,
        collection_point=point,
        metadata={
            "claim": claim.pk,
            "claimant": claim.claimant_id,
            "withdrawal": authority.pk,
        },
    )

    # Notifica o proprietário e o autor do achado sobre a devolução.
    notification_service.notify_withdrawal_confirmed(
        claim,
        authority,
        point=point,
    )

    return authority


__all__ = [
    "InvalidClaim",
    "InvalidCustody",
    "InvalidWithdrawal",
    "OperationError",
    "active_custody",
    "approve_claim",
    "cancel_claim",
    "confirm_withdrawal",
    "current_collection_point",
    "open_initial_custody",
    "reject_claim",
    "submit_claim",
    "transfer_to_point",
]
