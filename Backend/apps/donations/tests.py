from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import Donation, DonationItem


class DonationTests(APITestCase):
    def setUp(self):
        self.donor = User.objects.create_user(
            username="donor", email="donor@example.com", password="StrongPass123",
            role="donor", is_active=True,
        )
        self.other_donor = User.objects.create_user(
            username="donor2", email="donor2@example.com", password="StrongPass123",
            role="donor", is_active=True,
        )
        self.client.force_authenticate(self.donor)

    def test_create_donation_and_items(self):
        res = self.client.post(reverse("donation-list-create"), {"title": "Winter donation"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        donation_id = res.data["id"]

        res = self.client.post(
            reverse("donation-item-list-create", args=[donation_id]),
            {"item_name": "books", "quantity": 5},
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["source"], "manual")

    def test_ownership_enforced(self):
        donation = Donation.objects.create(donor=self.other_donor, title="Not yours")
        res = self.client.get(reverse("donation-detail", args=[donation.id]))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_quantity_must_be_positive(self):
        res = self.client.post(reverse("donation-list-create"), {"title": "T"})
        donation_id = res.data["id"]
        res = self.client.post(
            reverse("donation-item-list-create", args=[donation_id]),
            {"item_name": "books", "quantity": 0},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
