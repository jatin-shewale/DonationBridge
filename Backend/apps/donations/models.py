from django.conf import settings
from django.db import models


def donation_image_path(instance, filename):
    return f"donations/{instance.donor_id}/{filename}"


class Donation(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        CONFIRMED = "confirmed", "Confirmed"
        REQUESTED = "requested", "Requested"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="donations")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to=donation_image_path, blank=True, null=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["donor", "status"])]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.donor})"


class DonationItem(models.Model):
    class Source(models.TextChoices):
        AI = "ai", "AI detected"
        MANUAL = "manual", "Manually added"
        EDITED = "edited", "AI detected, edited by donor"

    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name="items")
    item_name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    confidence = models.FloatField(null=True, blank=True)
    source = models.CharField(max_length=10, choices=Source.choices, default=Source.MANUAL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["donation"]), models.Index(fields=["item_name"])]

    def __str__(self):
        return f"{self.quantity} x {self.item_name}"
