"""Jornada integrada de publicação, custódia, reivindicação e devolução."""

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

pytestmark = pytest.mark.django_db


def test_full_owner_operator_and_admin_journey(
    auth_client, other_client, operator_client, admin_client, found_payload, point
):
    lost = other_client.post(
        reverse("items:lost-report-list"),
        {
            "title": found_payload["title"],
            "description": found_payload["description"],
            "category": found_payload["category"],
            "lost_at": (timezone.now() - timedelta(days=1)).isoformat(),
            "lost_location": "Biblioteca",
        },
        format="json",
    )
    assert lost.status_code == 201
    lost_code = lost.data["public_code"]
    found = auth_client.post(
        reverse("items:found-item-list"), found_payload, format="json"
    )
    assert found.status_code == 201
    code = found.data["public_code"]
    received = operator_client.post(
        reverse("operations:custody-transfer", args=[code]),
        {"collection_point": point.pk},
        format="json",
    )
    assert received.status_code == 201
    claim = other_client.post(
        reverse("operations:item-claims", args=[code]),
        {"message": "Tenho comprovante e reconheço características exclusivas."},
        format="json",
    )
    assert claim.status_code == 201
    claim_id = claim.data["id"]
    assert (
        auth_client.post(
            reverse("operations:claim-approve", args=[claim_id]), {}, format="json"
        ).status_code
        == 403
    )
    assert (
        admin_client.get(
            reverse("operations:claim-detail", args=[claim_id])
        ).status_code
        == 200
    )
    approved = operator_client.post(
        reverse("operations:claim-approve", args=[claim_id]),
        {"decision_note": "Características conferidas."},
        format="json",
    )
    assert approved.status_code == 200
    assert approved.data["withdrawal"]["qr_image"]
    own = other_client.get(reverse("operations:claim-detail", args=[claim_id]))
    authority = own.data["withdrawal"]
    assert authority["is_valid"]
    token = authority["token"]
    delivered = operator_client.post(
        reverse("operations:withdrawal-confirm"), {"token": token}, format="json"
    )
    assert delivered.status_code == 200
    assert delivered.data["item"]["status"] == "DEVOLVIDO"
    assert (
        operator_client.post(
            reverse("operations:withdrawal-confirm"), {"token": token}, format="json"
        ).status_code
        == 400
    )
    used = other_client.get(reverse("operations:claim-detail", args=[claim_id])).data[
        "withdrawal"
    ]
    assert used["used_at"] and not used["is_valid"]
    completed = other_client.post(
        reverse("items:lost-report-complete", args=[lost_code]), {}, format="json"
    )
    assert completed.status_code == 200
    opened = other_client.get(
        reverse("items:lost-report-list"), {"status": "ABERTO", "search": lost_code}
    )
    assert opened.data["count"] == 0
    history = other_client.get(
        reverse("items:lost-report-list"), {"mine": "true", "search": lost_code}
    )
    assert history.data["count"] == 1
