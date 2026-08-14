from django.conf import settings
from django.db import models

from apps.donations.models import Donation
from apps.ngos.models import NGO


class DonationRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    # valid forward transitions; anything not listed here is rejected
    VALID_TRANSITIONS = {
        Status.PENDING: {Status.ACCEPTED, Status.REJECTED, Status.CANCELLED},
        Status.ACCEPTED: {Status.COMPLETED, Status.CANCELLED},
        Status.REJECTED: set(),
        Status.COMPLETED: set(),
        Status.CANCELLED: set(),
    }

    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name="requests")
    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE, related_name="donation_requests")
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="donation_requests")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    message = models.CharField(max_length=500, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["ngo", "status"]), models.Index(fields=["donor", "status"])]

    def can_transition_to(self, new_status):
        return new_status in self.VALID_TRANSITIONS.get(self.status, set())

    def __str__(self):
        return f"Request #{self.id}: {self.donation} -> {self.ngo} ({self.status})"
