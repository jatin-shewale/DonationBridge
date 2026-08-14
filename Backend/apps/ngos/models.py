from django.conf import settings
from django.db import models


class NGO(models.Model):
    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ngo_profile"
    )
    organization_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="ngo_logos/", blank=True, null=True)
    registration_certificate = models.FileField(upload_to="ngo_certificates/", blank=True, null=True)
    approval_status = models.CharField(
        max_length=10, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="ngo_approvals",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["approval_status"])]

    def __str__(self):
        return self.organization_name


class NGORequirement(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE, related_name="requirements")
    item_name = models.CharField(max_length=100)
    required_quantity = models.PositiveIntegerField()
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    description = models.CharField(max_length=255, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["ngo", "active"]), models.Index(fields=["item_name"])]
        unique_together = ("ngo", "item_name")

    def __str__(self):
        return f"{self.ngo.organization_name} needs {self.required_quantity} {self.item_name}"
