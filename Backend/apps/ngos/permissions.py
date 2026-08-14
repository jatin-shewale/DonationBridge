from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerNGOOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.ngo.user_id == request.user.id
