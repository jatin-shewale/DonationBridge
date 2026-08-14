from .models import Notification


def notify(recipient, title, message, notification_type=""):
    """Central helper other apps call to create a notification (no direct model coupling elsewhere)."""
    return Notification.objects.create(
        recipient=recipient, title=title, message=message, notification_type=notification_type,
    )
