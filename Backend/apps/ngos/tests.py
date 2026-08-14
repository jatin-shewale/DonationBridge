from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import NGO, NGORequirement


class NGORequirementTests(APITestCase):
    def setUp(self):
        self.ngo_user = User.objects.create_user(
            username="ngo", email="ngo@example.com", password="StrongPass123",
            role="ngo", is_active=True,
        )
        self.ngo = NGO.objects.create(
            user=self.ngo_user, organization_name="Helping Hands", registration_number="REG-100",
            email="ngo@example.com", approval_status=NGO.ApprovalStatus.APPROVED,
        )
        self.client.force_authenticate(self.ngo_user)

    def test_create_and_list_requirements(self):
        res = self.client.post(reverse("ngo-requirements"), {
            "item_name": "books", "required_quantity": 100, "priority": "high",
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        res = self.client.get(reverse("ngo-requirements"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)

    def test_donor_cannot_create_requirement(self):
        donor = User.objects.create_user(
            username="donor", email="donor@example.com", password="StrongPass123",
            role="donor", is_active=True,
        )
        self.client.force_authenticate(donor)
        res = self.client.post(reverse("ngo-requirements"), {
            "item_name": "books", "required_quantity": 100, "priority": "high",
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
