"""Rotas do app de notificações (montadas em ``/api/notifications/``)."""

from __future__ import annotations

from django.urls import path

from .views import (
    PushSubscriptionDetailView,
    PushSubscriptionListCreateView,
    NotificationListView,
    NotificationReadView,
    NotificationReadAllView,
    NotificationUnreadCountView,
)

app_name = "notifications"

urlpatterns = [
    # Inscrições de Web Push
    path(
        "subscriptions/",
        PushSubscriptionListCreateView.as_view(),
        name="subscription-list",
    ),
    path(
        "subscriptions/<int:pk>/",
        PushSubscriptionDetailView.as_view(),
        name="subscription-detail",
    ),

    # Notificações internas
    path(
        "",
        NotificationListView.as_view(),
        name="notification-list",
    ),
    path(
        "unread-count/",
        NotificationUnreadCountView.as_view(),
        name="notification-unread-count",
    ),
    path(
        "read-all/",
        NotificationReadAllView.as_view(),
        name="notification-read-all",
    ),
    path(
        "<int:pk>/read/",
        NotificationReadView.as_view(),
        name="notification-read",
    ),
]