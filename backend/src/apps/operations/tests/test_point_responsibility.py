import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.operations.models import CollectionPoint, WithdrawalAuthority
from apps.operations.services import approve_claim
from apps.users.models import User

pytestmark = pytest.mark.django_db


def foreign_operator():
    user = User.objects.create_user(
        email="outro-operador@validacao.local", password=None, role="operator"
    )
    other_point = CollectionPoint.objects.create(
        name="Bloco de outro operador", address="Local exclusivo do teste"
    )
    other_point.operators.add(user)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_operator_cannot_approve_item_from_another_block(pending_claim):
    response = foreign_operator().post(
        reverse("operations:claim-approve", args=[pending_claim.pk]),
        {"decision_note": "Teste de isolamento por bloco"},
        format="json",
    )
    assert (
        response.status_code == 403
    ), f"Operador não designado aprovou reivindicação: HTTP {response.status_code}"


def test_operator_cannot_deliver_item_from_another_block(pending_claim, operator_user):
    approved = approve_claim(pending_claim, user=operator_user)
    authority = WithdrawalAuthority.objects.get(claim=approved)
    response = foreign_operator().post(
        reverse("operations:withdrawal-confirm"),
        {"token": authority.token},
        format="json",
    )
    assert (
        response.status_code == 403
    ), f"Operador não designado confirmou retirada: HTTP {response.status_code}"


@pytest.mark.parametrize(
    "account_fixture", ["common_user", "operator_user", "admin_user"]
)
def test_each_role_can_login_and_receives_correct_role(request, account_fixture):
    user = request.getfixturevalue(account_fixture)
    client = APIClient()
    response = client.post(
        reverse("authentication:login"),
        {"email": user.email, "password": "S3nh@Forte!2026"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["user"]["role"] == user.role
    assert response.data["access"] and response.data["refresh"]


@pytest.mark.parametrize(
    "account_fixture", ["common_user", "operator_user", "admin_user"]
)
def test_notifications_remain_private_for_every_role(
    request, account_fixture, other_user
):
    from apps.notifications.models import Notification

    user = request.getfixturevalue(account_fixture)
    own = Notification.objects.create(
        user=user, kind="test", title="Minha notificação", message="Teste isolado"
    )
    foreign = Notification.objects.create(
        user=other_user,
        kind="test",
        title="Notificação de outra conta",
        message="Teste isolado",
    )
    client = APIClient()
    client.force_authenticate(user=user)
    listed = client.get(reverse("notifications:notification-list"))
    assert listed.status_code == 200
    rows = (
        listed.data.get("results", []) if isinstance(listed.data, dict) else listed.data
    )
    assert [row["id"] for row in rows] == [own.pk]
    denied = client.patch(
        reverse("notifications:notification-read", args=[foreign.pk]), {}, format="json"
    )
    assert denied.status_code == 404
    marked = client.patch(
        reverse("notifications:notification-read-all"), {}, format="json"
    )
    assert marked.status_code == 200
    own.refresh_from_db()
    foreign.refresh_from_db()
    assert own.is_read and not foreign.is_read


def test_operator_cannot_reject_item_from_another_block(pending_claim):
    response = foreign_operator().post(
        reverse("operations:claim-reject", args=[pending_claim.pk]),
        {"decision_note": "Outro bloco"},
        format="json",
    )
    assert response.status_code == 403
    pending_claim.refresh_from_db()
    assert pending_claim.status == "PENDING"


def test_admin_can_approve_without_point_assignment(admin_client, pending_claim):
    response = admin_client.post(
        reverse("operations:claim-approve", args=[pending_claim.pk]), {}, format="json"
    )
    assert response.status_code == 200
    assert response.data["withdrawal"]["is_valid"]


@pytest.mark.parametrize("operation", ["edit", "status", "transfer"])
def test_other_routes_cannot_bypass_block_responsibility(item_in_custody, operation):
    client = foreign_operator()
    if operation == "edit":
        response = client.patch(
            reverse("items:found-item-detail", args=[item_in_custody.public_code]),
            {"title": "Alteração indevida"},
            format="json",
        )
    elif operation == "status":
        response = client.post(
            reverse(
                "items:found-item-change-status", args=[item_in_custody.public_code]
            ),
            {"status": "EXPIRADO"},
            format="json",
        )
    else:
        point = CollectionPoint.objects.get(name="Bloco de outro operador")
        response = client.post(
            reverse("operations:custody-transfer", args=[item_in_custody.public_code]),
            {"collection_point": point.pk},
            format="json",
        )
    assert response.status_code == 403
    item_in_custody.refresh_from_db()
    assert item_in_custody.status == "EM_CUSTODIA"
