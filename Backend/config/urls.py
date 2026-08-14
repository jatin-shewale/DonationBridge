from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/ngo/", include("apps.ngos.urls")),
    path("api/admin/", include("apps.ngos.admin_urls")),
    path("api/donations/", include("apps.donations.urls")),
    path("api/ai/", include("apps.ai_detection.urls")),
    path("api/matching/", include("apps.matching.urls")),
    path("api/requests/", include("apps.donation_requests.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/admin-stats/", include("apps.donations.admin_stats_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
