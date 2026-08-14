from django.urls import path

from . import views

urlpatterns = [
    path("ngo-applications/", views.AdminNGOApplicationListView.as_view(), name="admin-ngo-applications"),
    path("ngo-applications/<int:pk>/", views.AdminNGOApplicationDetailView.as_view(), name="admin-ngo-application-detail"),
    path("ngo-applications/<int:pk>/approve/", views.AdminNGOApproveView.as_view(), name="admin-ngo-approve"),
    path("ngo-applications/<int:pk>/reject/", views.AdminNGORejectView.as_view(), name="admin-ngo-reject"),
]
