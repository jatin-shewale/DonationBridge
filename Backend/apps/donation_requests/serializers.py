from rest_framework import serializers

from .models import DonationRequest


class DonationRequestSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(source="ngo.organization_name", read_only=True)
    donation_title = serializers.CharField(source="donation.title", read_only=True)

    class Meta:
        model = DonationRequest
        fields = [
            "id", "donation", "donation_title", "ngo", "ngo_name", "donor", "status",
            "message", "requested_at", "responded_at", "completed_at",
        ]
        read_only_fields = ["id", "donor", "status", "requested_at", "responded_at", "completed_at"]
