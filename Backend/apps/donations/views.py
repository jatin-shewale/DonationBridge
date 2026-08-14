from django.db.models import Count, Q, Sum
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsDonor

from .models import Donation, DonationItem
from .permissions import IsDonationOwner
from .serializers import DonationItemSerializer, DonationSerializer


class DonationListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return Donation.objects.filter(donor=self.request.user)

    def perform_create(self, serializer):
        # donor is always taken from the authenticated request, never trusted from the client
        serializer.save(donor=self.request.user)


class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DonationSerializer
    permission_classes = [IsDonor, IsDonationOwner]

    def get_queryset(self):
        return Donation.objects.filter(donor=self.request.user)


class DonationItemListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationItemSerializer
    permission_classes = [IsDonor]

    def get_donation(self):
        return generics.get_object_or_404(
            Donation, pk=self.kwargs["donation_id"], donor=self.request.user
        )

    def get_queryset(self):
        return DonationItem.objects.filter(donation=self.get_donation())

    def perform_create(self, serializer):
        serializer.save(donation=self.get_donation(), source=DonationItem.Source.MANUAL)


class DonationItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DonationItemSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return DonationItem.objects.filter(
            donation_id=self.kwargs["donation_id"], donation__donor=self.request.user
        )

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.source == DonationItem.Source.AI:
            serializer.save(source=DonationItem.Source.EDITED)
        else:
            serializer.save()


class ConfirmDonationView(APIView):
    """POST /api/donations/<id>/confirm/ - moves a draft donation (with >=1 item) to CONFIRMED.
    Kept as its own endpoint (rather than allowing PATCH status=...) so status transitions are
    always validated server-side and never trusted from an arbitrary client PATCH."""

    permission_classes = [IsDonor]

    def post(self, request, pk):
        donation = generics.get_object_or_404(Donation, pk=pk, donor=request.user)
        if donation.status != Donation.Status.DRAFT:
            return Response({"detail": "Only draft donations can be confirmed."}, status=status.HTTP_400_BAD_REQUEST)
        if not donation.items.exists():
            return Response({"detail": "Add at least one item before confirming."}, status=status.HTTP_400_BAD_REQUEST)
        donation.status = Donation.Status.CONFIRMED
        donation.save()
        return Response(DonationSerializer(donation).data)


class DonorDashboardStatsView(APIView):
    permission_classes = [IsDonor]

    def get(self, request):
        qs = Donation.objects.filter(donor=request.user)
        data = qs.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status__in=[Donation.Status.DRAFT, Donation.Status.REQUESTED])),
            completed=Count("id", filter=Q(status=Donation.Status.COMPLETED)),
        )
        from apps.donation_requests.models import DonationRequest
        active_requests = DonationRequest.objects.filter(
            donor=request.user, status=DonationRequest.Status.PENDING
        ).count()
        recent = DonationSerializer(qs.order_by("-created_at")[:5], many=True).data
        return Response({
            "total_donations": data["total"],
            "pending_donations": data["pending"],
            "completed_donations": data["completed"],
            "active_requests": active_requests,
            "recent_donations": recent,
        })


class AdminSystemStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Admins only."}, status=status.HTTP_403_FORBIDDEN)

        from apps.accounts.models import User
        from apps.donation_requests.models import DonationRequest
        from apps.ngos.models import NGO

        return Response({
            "total_donors": User.objects.filter(role="donor").count(),
            "total_ngos": NGO.objects.count(),
            "pending_ngo_approvals": NGO.objects.filter(approval_status=NGO.ApprovalStatus.PENDING).count(),
            "total_donations": Donation.objects.count(),
            "active_donations": Donation.objects.exclude(
                status__in=[Donation.Status.COMPLETED, Donation.Status.CANCELLED]
            ).count(),
            "pending_requests": DonationRequest.objects.filter(status=DonationRequest.Status.PENDING).count(),
            "completed_donations": Donation.objects.filter(status=Donation.Status.COMPLETED).count(),
        })
