from django.conf import settings
from rest_framework import serializers


class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, value):
        max_bytes = settings.MAX_UPLOAD_IMAGE_SIZE_MB * 1024 * 1024
        if value.size > max_bytes:
            raise serializers.ValidationError(f"Image must be smaller than {settings.MAX_UPLOAD_IMAGE_SIZE_MB}MB.")
        if value.content_type not in settings.ALLOWED_IMAGE_CONTENT_TYPES:
            raise serializers.ValidationError("Unsupported image format. Use JPG, PNG or WEBP.")
        return value
