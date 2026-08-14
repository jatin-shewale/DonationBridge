from rest_framework import serializers

from .models import NGO, NGORequirement


class NGOPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGO
        fields = [
            "id", "organization_name", "email", "phone", "website",
            "address", "city", "state", "pincode", "description", "logo",
            "approval_status", "created_at",
        ]
        read_only_fields = fields


class NGOProfileSerializer(serializers.ModelSerializer):
    """Used by the NGO themselves to view/update their own profile."""

    class Meta:
        model = NGO
        fields = [
            "id", "organization_name", "registration_number", "email", "phone",
            "website", "address", "city", "state", "pincode", "description",
            "logo", "registration_certificate", "approval_status", "created_at",
        ]
        read_only_fields = ["id", "registration_number", "approval_status", "created_at"]


class NGOAdminSerializer(serializers.ModelSerializer):
    """Used by admins reviewing NGO applications."""

    class Meta:
        model = NGO
        fields = [
            "id", "organization_name", "registration_number", "email", "phone",
            "website", "address", "city", "state", "pincode", "description",
            "logo", "registration_certificate", "approval_status",
            "approved_by", "approved_at", "created_at",
        ]
        read_only_fields = fields


class NGORequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGORequirement
        fields = [
            "id", "ngo", "item_name", "required_quantity", "priority",
            "description", "active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "ngo", "created_at", "updated_at"]
