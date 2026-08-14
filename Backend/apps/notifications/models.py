from django.conf import settings
from django.db import models


class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.CharField(max_length=500)
    notification_type = models.CharField(max_length=50, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["recipient", "is_read"])]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} -> {self.recipient}"
