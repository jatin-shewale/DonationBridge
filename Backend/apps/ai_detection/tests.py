import io
import json
from unittest.mock import MagicMock, patch

from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User


def make_test_image():
    buf = io.BytesIO()
    Image.new("RGB", (50, 50), color="red").save(buf, format="JPEG")
    buf.seek(0)
    buf.name = "test.jpg"
    return buf


class AIDetectionTests(APITestCase):
    def setUp(self):
        self.donor = User.objects.create_user(
            username="donor", email="donor@example.com", password="StrongPass123",
            role="donor", is_active=True,
        )
        self.client.force_authenticate(self.donor)

    def test_detect_requires_authentication(self):
        self.client.force_authenticate(None)
        res = self.client.post(reverse("ai-detect"), {"image": make_test_image()}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(GEMINI_API_KEY="")
    def test_detect_returns_structured_response(self):
        res = self.client.post(reverse("ai-detect"), {"image": make_test_image()}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("detections", res.data)
        self.assertIn("counts", res.data)
        self.assertIn("model", res.data)
        self.assertIn("threshold", res.data)

    def test_invalid_file_rejected(self):
        bad_file = io.BytesIO(b"not an image")
        bad_file.name = "test.txt"
        res = self.client.post(reverse("ai-detect"), {"image": bad_file}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(GEMINI_API_KEY="test-key", GEMINI_MODEL="gemini-2.5-flash")
    def test_detect_uses_gemini_when_api_key_is_configured(self):
        payload = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": json.dumps(
                                    {
                                        "objects": [
                                            {
                                                "label": "books",
                                                "confidence": 0.91,
                                                "bbox": [10, 20, 30, 40],
                                            }
                                        ]
                                    }
                                )
                            }
                        ]
                    }
                }
            ]
        }
        response = MagicMock()
        response.read.return_value = json.dumps(payload).encode("utf-8")
        response.__enter__.return_value = response
        response.__exit__.return_value = False

        with patch("apps.ai_detection.services.urllib.request.urlopen", return_value=response):
            res = self.client.post(reverse("ai-detect"), {"image": make_test_image()}, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["model"], "gemini:gemini-2.5-flash")
        self.assertEqual(res.data["counts"], {"books": 1})
        self.assertEqual(res.data["detections"][0]["class_name"], "books")
