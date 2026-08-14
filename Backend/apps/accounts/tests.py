from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.ngos.models import NGO

from .models import User


class DonorAuthTests(APITestCase):
    def test_donor_register_and_login(self):
        payload = {
            "username": "donor1", "email": "donor1@example.com", "password": "StrongPass123",
            "first_name": "D", "last_name": "One",
        }
        res = self.client.post(reverse("register-donor"), payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        res = self.client.post(reverse("register-donor"), payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        login_res = self.client.post(reverse("login"), {
            "email": "donor1@example.com", "password": "StrongPass123", "role": "donor",
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_res.data)

    def test_wrong_password_rejected(self):
        User.objects.create_user(
            username="d2", email="d2@example.com", password="StrongPass123", role="donor",
        )
        res = self.client.post(reverse("login"), {
            "email": "d2@example.com", "password": "WrongPass", "role": "donor",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class NGOAuthTests(APITestCase):
    def test_ngo_cannot_login_until_approved(self):
        payload = {
            "username": "ngo1", "email": "ngo1@example.com", "password": "StrongPass123",
            "organization_name": "Helping Hands", "registration_number": "REG-001",
        }
        res = self.client.post(reverse("register-ngo"), payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        login_res = self.client.post(reverse("login"), {
            "email": "ngo1@example.com", "password": "StrongPass123", "role": "ngo",
        })
        self.assertEqual(login_res.status_code, status.HTTP_400_BAD_REQUEST)

        ngo = NGO.objects.get(registration_number="REG-001")
        ngo.approval_status = NGO.ApprovalStatus.APPROVED
        ngo.user.is_active = True
        ngo.user.save()
        ngo.save()

        login_res = self.client.post(reverse("login"), {
            "email": "ngo1@example.com", "password": "StrongPass123", "role": "ngo",
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
