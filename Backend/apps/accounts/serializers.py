from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from apps.ngos.models import NGO

from .models import User


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "role",
            "phone", "address", "city", "state", "pincode", "is_active",
            "created_at",
        ]
        read_only_fields = fields


class DonorRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "first_name", "last_name",
            "phone", "address", "city", "state", "pincode",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(role=User.Role.DONOR, is_active=True, **validated_data)
        user.set_password(password)
        user.save()
        return user


class NGORegisterSerializer(serializers.ModelSerializer):
    """
    Registers the auth User (role=ngo, is_active=False) AND the related
    NGO profile (approval_status=pending) in one transaction. NGO users
    cannot log in until an admin approves them - enforced in the login view.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    organization_name = serializers.CharField(max_length=255)
    registration_number = serializers.CharField(max_length=100)
    website = serializers.URLField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "first_name", "last_name",
            "phone", "address", "city", "state", "pincode",
            "organization_name", "registration_number", "website", "description",
        ]

    def validate_registration_number(self, value):
        if NGO.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError("An NGO with this registration number already exists.")
        return value

    def validate(self, attrs):
        # Normalize incoming text fields so harmless leading/trailing whitespace
        # does not fail URL/unique validation or create inconsistent data.
        for field in [
            "username",
            "email",
            "organization_name",
            "registration_number",
            "phone",
            "website",
            "address",
            "city",
            "state",
            "pincode",
            "description",
        ]:
            value = attrs.get(field)
            if isinstance(value, str):
                attrs[field] = value.strip()

        if not attrs.get("website"):
            attrs["website"] = ""
        if not attrs.get("description"):
            attrs["description"] = ""
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        ngo_fields = {
            "organization_name": validated_data.pop("organization_name"),
            "registration_number": validated_data.pop("registration_number"),
            "website": validated_data.pop("website", ""),
            "description": validated_data.pop("description", ""),
        }
        password = validated_data.pop("password")
        user = User(role=User.Role.NGO, is_active=False, **validated_data)
        user.set_password(password)
        user.save()

        NGO.objects.create(
            user=user,
            email=user.email,
            phone=user.phone,
            address=user.address,
            city=user.city,
            state=user.state,
            pincode=user.pincode,
            approval_status=NGO.ApprovalStatus.PENDING,
            **ngo_fields,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]
        role = attrs["role"]

        user = authenticate(username=email, password=password)
        if user is None:
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        if user.role != role:
            raise serializers.ValidationError(
                {"detail": f"This account is not registered as a {role}."}
            )

        if user.role == User.Role.NGO:
            ngo = getattr(user, "ngo_profile", None)
            if ngo is None or ngo.approval_status != NGO.ApprovalStatus.APPROVED:
                raise serializers.ValidationError(
                    {"detail": "Your NGO account is pending admin approval or was rejected."}
                )

        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is inactive."})

        attrs["user"] = user
        return attrs

    def to_representation(self, validated_data):
        user = validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserPublicSerializer(user).data,
        }
