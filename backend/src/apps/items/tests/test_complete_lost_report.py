import pytest
from django.urls import reverse

from apps.items.models import LostReportStatus

pytestmark = pytest.mark.django_db


def url(report):
    return reverse("items:lost-report-complete", args=[report.public_code])


def test_owner_confirms_found_and_leaves_open_list(auth_client, lost_report):
    response = auth_client.post(url(lost_report), {}, format="json")
    assert response.status_code == 200
    assert response.data["status"] == LostReportStatus.ENCONTRADO
    lost_report.refresh_from_db()
    assert lost_report.status == LostReportStatus.ENCONTRADO
    opened = auth_client.get(reverse("items:lost-report-list"), {"status": "ABERTO"})
    assert opened.data["count"] == 0
    history = auth_client.get(reverse("items:lost-report-list"), {"mine": "true"})
    assert history.data["count"] == 1


@pytest.mark.parametrize("client_fixture", ["other_client", "operator_client"])
def test_other_people_cannot_confirm_found(request, client_fixture, lost_report):
    response = request.getfixturevalue(client_fixture).post(
        url(lost_report), {}, format="json"
    )
    assert response.status_code == 403
    lost_report.refresh_from_db()
    assert lost_report.status == LostReportStatus.ABERTO


def test_anonymous_cannot_complete(api_client, lost_report):
    assert api_client.post(url(lost_report)).status_code == 401


def test_admin_can_complete(admin_client, lost_report):
    assert admin_client.post(url(lost_report)).status_code == 200


@pytest.mark.parametrize("status", ["ENCONTRADO", "CANCELADO", "EXPIRADO"])
def test_closed_report_cannot_be_completed_again(auth_client, lost_report, status):
    lost_report.status = status
    lost_report.save(update_fields=["status"])
    assert auth_client.post(url(lost_report)).status_code == 400
    lost_report.refresh_from_db()
    assert lost_report.status == status
