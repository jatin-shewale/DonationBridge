from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsDonor
from apps.donations.models import Donation

from .services import match_donation_to_ngos


class DonationMatchesView(APIView):
    permission_classes = [IsDonor]

    def get(self, request, donation_id):
        from rest_framework.generics import get_object_or_404
        donation = get_object_or_404(Donation, pk=donation_id, donor=request.user)
        item_counts = {item.item_name: item.quantity for item in donation.items.all()}
        matches = match_donation_to_ngos(item_counts)
        return Response({"donation": donation.id, "matches": [m.to_dict() for m in matches]})
