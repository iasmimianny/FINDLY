"""Tarefas assíncronas/agendadas do app de itens.

Executadas pelo Celery worker/beat (ver ``docker-compose.yml``). O agendamento é
registrado por ``python manage.py setup_periodic_tasks``.

- ``expire_found_items``: encerra achados sem movimentação há N dias.
- ``expire_lost_reports``: encerra alertas de perda antigos ainda abertos.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import FoundItem, ItemStatus, LostReport, LostReportStatus
from .services import InvalidStatusTransition, transition_found_item

logger = logging.getLogger(__name__)

TERMINAL_STATUSES = frozenset(
    {ItemStatus.DEVOLVIDO, ItemStatus.EXPIRADO, ItemStatus.ENCAMINHADO}
)


@shared_task
def expire_found_items(days: int | None = None) -> dict[str, int]:
    """Move para ``EXPIRADO`` os achados inativos há mais de ``days`` dias.

    A inatividade é medida por ``updated_at``: transferências, mudanças de
    status e demais decisões renovam o prazo. Claims pendentes do item são
    recusadas automaticamente com auditoria (responsável nulo).
    """
    window = settings.ITEM_EXPIRATION_DAYS if days is None else days
    cutoff = timezone.now() - timedelta(days=window)

    candidates = list(
        FoundItem.objects.filter(updated_at__lt=cutoff)
        .exclude(status__in=TERMINAL_STATUSES)
        .values_list("pk", flat=True)
    )

    from apps.operations.services import close_item_operations

    expired = 0
    rejected_claims = 0

    for pk in candidates:
        with transaction.atomic():
            item = FoundItem.objects.select_for_update().filter(pk=pk).first()
            if item is None or item.is_terminal or item.updated_at >= cutoff:
                continue
            try:
                expired_item = transition_found_item(
                    item, ItemStatus.EXPIRADO, user=None
                )
            except InvalidStatusTransition:
                continue
            expired += 1
            rejected_claims += close_item_operations(
                expired_item, note="Item expirado automaticamente pelo sistema."
            )

    if expired:
        logger.info(
            "Expiração automática: %s item(ns) expirado(s), %s claim(s) recusado(s).",
            expired,
            rejected_claims,
        )
    return {"expired": expired, "rejected_claims": rejected_claims}


@shared_task
def expire_lost_reports(days: int | None = None) -> dict[str, int]:
    """Move para ``EXPIRADO`` os alertas de perda abertos há muito tempo."""
    window = settings.LOST_REPORT_EXPIRATION_DAYS if days is None else days
    cutoff = timezone.now() - timedelta(days=window)

    expired = LostReport.objects.filter(
        status=LostReportStatus.ABERTO,
        lost_at__lt=cutoff,
    ).update(
        status=LostReportStatus.EXPIRADO,
        updated_at=timezone.now(),
    )
    if expired:
        logger.info("Expiração automática: %s alerta(s) de perda expirado(s).", expired)
    return {"expired": expired}
