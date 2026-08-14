from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminRole, IsNGO
from apps.notifications.services import notify

from .models import NGO, NGORequirement
from .permissions import IsOwnerNGOOrReadOnly
from .serializers import (
    NGOAdminSerializer,
    NGOProfileSerializer,
    NGOPublicSerializer,
    NGORequirementSerializer,
)


class NGOListView(generics.ListAPIView):
    """Public-ish list of approved NGOs, for donors to browse."""

    serializer_class = NGOPublicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NGO.objects.filter(approval_status=NGO.ApprovalStatus.APPROVED).order_by("organization_name")


class NGODetailView(generics.RetrieveAPIView):
    serializer_class = NGOPublicSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = NGO.objects.filter(approval_status=NGO.ApprovalStatus.APPROVED)


class MyNGOProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = NGOProfileSerializer
    permission_classes = [IsNGO]

    def get_object(self):
        return self.request.user.ngo_profile


class NGORequirementListCreateView(generics.ListCreateAPIView):
    serializer_class = NGORequirementSerializer
    permission_classes = [IsNGO]

    def get_queryset(self):
        return NGORequirement.objects.filter(ngo=self.request.user.ngo_profile).order_by("-priority", "item_name")

    def perform_create(self, serializer):
        serializer.save(ngo=self.request.user.ngo_profile)


class NGORequirementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NGORequirementSerializer
    permission_classes = [IsNGO, IsOwnerNGOOrReadOnly]

    def get_queryset(self):
        return NGORequirement.objects.filter(ngo=self.request.user.ngo_profile)


# ---- Admin: NGO application review ----

class AdminNGOApplicationListView(generics.ListAPIView):
    serializer_class = NGOAdminSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = NGO.objects.all().order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(approval_status=status_filter)
        return qs


class AdminNGOApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = NGOAdminSerializer
    permission_classes = [IsAdminRole]
    queryset = NGO.objects.all()


class AdminNGOApproveView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        ngo = generics.get_object_or_404(NGO, pk=pk)
        ngo.approval_status = NGO.ApprovalStatus.APPROVED
        ngo.approved_by = request.user
        ngo.approved_at = timezone.now()
        ngo.save()
        ngo.user.is_active = True
        ngo.user.save()
        notify(
            recipient=ngo.user,
            title="NGO application approved",
            message=f"Congratulations, {ngo.organization_name} has been approved. You can now log in.",
            notification_type="ngo_approved",
        )
        return Response(NGOAdminSerializer(ngo).data)


class AdminNGORejectView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        ngo = generics.get_object_or_404(NGO, pk=pk)
        ngo.approval_status = NGO.ApprovalStatus.REJECTED
        ngo.approved_by = request.user
        ngo.approved_at = timezone.now()
        ngo.save()
        ngo.user.is_active = False
        ngo.user.save()
        notify(
            recipient=ngo.user,
            title="NGO application rejected",
            message=f"Your application for {ngo.organization_name} was not approved.",
            notification_type="ngo_rejected",
        )
        return Response(NGOAdminSerializer(ngo).data)
