from django.conf import settings
from rest_framework import serializers

from .models import Donation, DonationItem


class DonationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationItem
        fields = ["id", "donation", "item_name", "quantity", "confidence", "source", "created_at", "updated_at"]
        read_only_fields = ["id", "donation", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class DonationSerializer(serializers.ModelSerializer):
    items = DonationItemSerializer(many=True, read_only=True)
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            "id", "donor", "donor_name", "title", "description", "image",
            "status", "items", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "donor", "status", "created_at", "updated_at"]

    def get_donor_name(self, obj):
        return f"{obj.donor.first_name} {obj.donor.last_name}".strip() or obj.donor.username

    def validate_image(self, value):
        if value is None:
            return value
        max_bytes = settings.MAX_UPLOAD_IMAGE_SIZE_MB * 1024 * 1024
        if value.size > max_bytes:
            raise serializers.ValidationError(f"Image must be smaller than {settings.MAX_UPLOAD_IMAGE_SIZE_MB}MB.")
        if value.content_type not in settings.ALLOWED_IMAGE_CONTENT_TYPES:
            raise serializers.ValidationError("Unsupported image format. Use JPG, PNG or WEBP.")
        return value
