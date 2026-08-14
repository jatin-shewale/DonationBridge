from rest_framework.permissions import BasePermission


class IsDonationOwner(BasePermission):
    """Ownership is always enforced server-side from request.user, never from client-supplied donor id."""

    def has_object_permission(self, request, view, obj):
        return obj.donor_id == request.user.id
