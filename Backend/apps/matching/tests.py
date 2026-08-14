from django.test import TestCase

from apps.accounts.models import User
from apps.ngos.models import NGO, NGORequirement

from .services import match_donation_to_ngos


class MatchingServiceTests(TestCase):
    def setUp(self):
        user_a = User.objects.create_user(username="a", email="a@example.com", password="x", role="ngo")
        self.ngo_a = NGO.objects.create(
            user=user_a, organization_name="NGO A", registration_number="A1",
            email="a@example.com", approval_status=NGO.ApprovalStatus.APPROVED,
        )
        NGORequirement.objects.create(ngo=self.ngo_a, item_name="books", required_quantity=10, priority="high")
        NGORequirement.objects.create(ngo=self.ngo_a, item_name="clothes", required_quantity=20, priority="medium")

        user_b = User.objects.create_user(username="b", email="b@example.com", password="x", role="ngo")
        self.ngo_b = NGO.objects.create(
            user=user_b, organization_name="NGO B", registration_number="B1",
            email="b@example.com", approval_status=NGO.ApprovalStatus.APPROVED,
        )
        NGORequirement.objects.create(ngo=self.ngo_b, item_name="toys", required_quantity=5, priority="low")

    def test_matching_scores_and_reasons(self):
        results = match_donation_to_ngos({"books": 8, "clothes": 5})
        self.assertEqual(results[0].ngo_id, self.ngo_a.id)
        self.assertIn("books", results[0].matched_items)
        self.assertGreater(results[0].match_score, 0)
        # NGO B has no overlap with this donation -> excluded
        self.assertTrue(all(r.ngo_id != self.ngo_b.id for r in results))

    def test_no_match_returns_empty(self):
        results = match_donation_to_ngos({"stationery": 3})
        self.assertEqual(results, [])
