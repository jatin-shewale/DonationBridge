from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import Notification
from .services import notify


class NotificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="u1", email="u1@example.com", password="x", role="donor", is_active=True,
        )
        self.client.force_authenticate(self.user)

    def test_create_and_list_and_mark_read(self):
        n = notify(self.user, "Hello", "Test message", "test")
        res = self.client.get(reverse("notification-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)

        res = self.client.patch(reverse("notification-mark-read", args=[n.id]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_read"])
