from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsDonor, IsNGO
from apps.donations.models import Donation
from apps.notifications.services import notify

from .models import DonationRequest
from .serializers import DonationRequestSerializer


class DonationRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationRequestSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDonor()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.role == "donor":
            return DonationRequest.objects.filter(donor=user).order_by("-requested_at")
        if user.role == "ngo":
            return DonationRequest.objects.filter(ngo=user.ngo_profile).order_by("-requested_at")
        return DonationRequest.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        donation_id = self.request.data.get("donation")
        donation = get_object_or_404(Donation, pk=donation_id, donor=self.request.user)
        if donation.status not in [Donation.Status.CONFIRMED, Donation.Status.REQUESTED]:
            raise ValidationError({"detail": "Donation must be confirmed before requesting an NGO."})

        req = serializer.save(donor=self.request.user, donation=donation)
        donation.status = Donation.Status.REQUESTED
        donation.save()

        notify(
            recipient=req.ngo.user,
            title="New donation request",
            message=f"{self.request.user.first_name or self.request.user.username} sent a donation request.",
            notification_type="request_received",
        )


class DonationRequestDetailView(generics.RetrieveAPIView):
    serializer_class = DonationRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "donor":
            return DonationRequest.objects.filter(donor=user)
        if user.role == "ngo":
            return DonationRequest.objects.filter(ngo=user.ngo_profile)
        return DonationRequest.objects.none()


class _BaseTransitionView(APIView):
    permission_classes = [IsNGO]
    target_status = None
    notify_title = ""
    notify_type = ""

    def post(self, request, pk):
        req = get_object_or_404(DonationRequest, pk=pk, ngo=request.user.ngo_profile)
        if not req.can_transition_to(self.target_status):
            return Response(
                {"detail": f"Cannot move request from '{req.status}' to '{self.target_status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        req.status = self.target_status
        req.responded_at = timezone.now()
        if self.target_status == DonationRequest.Status.COMPLETED:
            req.completed_at = timezone.now()
            req.donation.status = req.donation.Status.COMPLETED
            req.donation.save()
        elif self.target_status == DonationRequest.Status.ACCEPTED:
            pass  # donation stays REQUESTED until handover completes
        elif self.target_status == DonationRequest.Status.REJECTED:
            req.donation.status = req.donation.Status.CONFIRMED  # donor can request another NGO
            req.donation.save()
        req.save()

        notify(
            recipient=req.donor,
            title=self.notify_title,
            message=f"{req.ngo.organization_name} has {self.target_status} your donation request.",
            notification_type=self.notify_type,
        )
        return Response(DonationRequestSerializer(req).data)


class AcceptRequestView(_BaseTransitionView):
    target_status = DonationRequest.Status.ACCEPTED
    notify_title = "Donation request accepted"
    notify_type = "request_accepted"


class RejectRequestView(_BaseTransitionView):
    target_status = DonationRequest.Status.REJECTED
    notify_title = "Donation request rejected"
    notify_type = "request_rejected"


class CompleteRequestView(_BaseTransitionView):
    target_status = DonationRequest.Status.COMPLETED
    notify_title = "Donation completed"
    notify_type = "donation_completed"
