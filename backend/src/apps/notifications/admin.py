"""Registro das inscrições de push e notificações internas no Django Admin (caminho secreto)."""

from __future__ import annotations

from django.contrib import admin

from .models import PushSubscription, Notification


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "endpoint",
        "is_active",
        "last_used_at",
        "created_at",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("user__email", "endpoint", "user_agent")
    list_select_related = ("user",)
    readonly_fields = ("created_at", "updated_at", "last_used_at")


# ---------------------------------------------------------------------------
# Notificações internas
# ---------------------------------------------------------------------------


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Gerenciamento das notificações internas do Findly."""

    list_display = (
        "id",
        "user",
        "kind",
        "title",
        "is_read",
        "read_at",
        "created_at",
    )

    list_filter = (
        "kind",
        "is_read",
        "created_at",
    )

    search_fields = (
        "user__email",
        "title",
        "message",
    )

    list_select_related = ("user",)

    readonly_fields = (
        "created_at",
        "read_at",
        "is_read",
    )

    ordering = ("-created_at",)