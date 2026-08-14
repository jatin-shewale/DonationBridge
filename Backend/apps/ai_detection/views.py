from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ImageUploadSerializer
from .services import DetectionError, detect_objects


class DetectObjectsView(APIView):
    """POST /api/ai/detect/ - authenticated users only. Never leaks tracebacks."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = serializer.validated_data["image"]

        try:
            result = detect_objects(image)
        except DetectionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception:
            return Response(
                {"detail": "AI detection failed unexpectedly. Please add items manually."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(result.to_dict(), status=status.HTTP_200_OK)
