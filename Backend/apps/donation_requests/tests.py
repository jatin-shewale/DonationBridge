from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.donations.models import Donation
from apps.ngos.models import NGO

from .models import DonationRequest


class DonationRequestTests(APITestCase):
    def setUp(self):
        self.donor = User.objects.create_user(
            username="donor", email="donor@example.com", password="x", role="donor", is_active=True,
        )
        ngo_user = User.objects.create_user(
            username="ngo", email="ngo@example.com", password="x", role="ngo", is_active=True,
        )
        self.ngo = NGO.objects.create(
            user=ngo_user, organization_name="NGO A", registration_number="R1",
            email="ngo@example.com", approval_status=NGO.ApprovalStatus.APPROVED,
        )
        self.donation = Donation.objects.create(donor=self.donor, title="D1", status=Donation.Status.CONFIRMED)

    def test_full_request_lifecycle(self):
        self.client.force_authenticate(self.donor)
        res = self.client.post(reverse("request-list-create"), {"donation": self.donation.id, "ngo": self.ngo.id})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        request_id = res.data["id"]

        self.client.force_authenticate(self.ngo.user)
        res = self.client.post(reverse("request-accept", args=[request_id]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "accepted")

        res = self.client.post(reverse("request-reject", args=[request_id]))
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)  # invalid: already accepted

        res = self.client.post(reverse("request-complete", args=[request_id]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "completed")

        self.donation.refresh_from_db()
        self.assertEqual(self.donation.status, Donation.Status.COMPLETED)
