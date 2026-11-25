"""Views das inscrições de push e notificações internas.

- ``GET/POST /api/notifications/subscriptions/`` — lista/registra as inscrições
  do próprio usuário.
- ``DELETE /api/notifications/subscriptions/{id}/`` — remove a inscrição.
- ``GET /api/notifications/`` — lista as notificações do próprio usuário.
- ``GET /api/notifications/unread-count/`` — conta as notificações não lidas.
- ``PATCH /api/notifications/{id}/read/`` — marca uma notificação como lida.
- ``PATCH /api/notifications/read-all/`` — marca todas como lidas.
"""

from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification, PushSubscription
from .serializers import (
    NotificationSerializer,
    PushSubscriptionSerializer,
)


@extend_schema_view(
    get=extend_schema(
        tags=["notifications"],
        summary="Listar inscrições de push",
        responses={200: PushSubscriptionSerializer(many=True)},
    ),
    post=extend_schema(
        tags=["notifications"],
        summary="Registrar inscrição de push",
        request=PushSubscriptionSerializer,
        responses={201: PushSubscriptionSerializer},
    ),
)
class PushSubscriptionListCreateView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
):
    """Inscrições de push do usuário autenticado (sem paginação)."""

    serializer_class = PushSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = PushSubscription.objects.none()

    def get_queryset(self):
        return PushSubscription.objects.filter(user=self.request.user)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


@extend_schema_view(
    delete=extend_schema(
        tags=["notifications"],
        summary="Remover inscrição de push",
        responses={204: None},
    ),
)
class PushSubscriptionDetailView(mixins.DestroyModelMixin, generics.GenericAPIView):
    """Remove uma inscrição do próprio usuário (``404`` para as demais)."""

    serializer_class = PushSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    queryset = PushSubscription.objects.none()

    def get_queryset(self):
        return PushSubscription.objects.filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# ---------------------------------------------------------------------------
# Notificações internas
# ---------------------------------------------------------------------------


@extend_schema_view(
    get=extend_schema(
        tags=["notifications"],
        summary="Listar notificações internas",
        responses={200: NotificationSerializer(many=True)},
    ),
)
class NotificationListView(generics.ListAPIView):
    """Lista as notificações do usuário autenticado.

    O parâmetro ``?unread=true`` permite consultar apenas as notificações
    que ainda não foram lidas.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.none()

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)

        unread = self.request.query_params.get("unread")

        if unread == "true":
            queryset = queryset.filter(is_read=False)

        return queryset.order_by("-created_at", "-id")


class NotificationReadView(APIView):
    """Marca uma notificação do próprio usuário como lida.

    Retorna ``404`` caso a notificação não exista ou pertença
    a outro usuário.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["notifications"],
        summary="Marcar notificação como lida",
        request=None,
        responses={200: NotificationSerializer},
    )
    def patch(self, request, pk):
        notification = get_object_or_404(
            Notification,
            pk=pk,
            user=request.user,
        )

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()

            notification.save(update_fields=["is_read", "read_at"])

        return Response(NotificationSerializer(notification).data)


class NotificationReadAllView(APIView):
    """Marca todas as notificações do próprio usuário como lidas."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["notifications"],
        summary="Marcar todas as notificações como lidas",
        request=None,
        responses={200: dict},
    )
    def patch(self, request):
        updated = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(
            is_read=True,
            read_at=timezone.now(),
        )

        return Response({"updated": updated})


class NotificationUnreadCountView(APIView):
    """Retorna a quantidade de notificações não lidas.

    Utilizada pelo frontend para exibir o contador no ícone
    de notificações.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["notifications"],
        summary="Contar notificações não lidas",
        responses={200: dict},
    )
    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).count()

        return Response({"count": count})


__all__ = [
    "PushSubscriptionDetailView",
    "PushSubscriptionListCreateView",
    "NotificationListView",
    "NotificationReadView",
    "NotificationReadAllView",
    "NotificationUnreadCountView",
]
