from django.urls import path

from . import views

urlpatterns = [
    path("", views.DonationListCreateView.as_view(), name="donation-list-create"),
    path("<int:pk>/", views.DonationDetailView.as_view(), name="donation-detail"),
    path("<int:donation_id>/items/", views.DonationItemListCreateView.as_view(), name="donation-item-list-create"),
    path("<int:donation_id>/items/<int:pk>/", views.DonationItemDetailView.as_view(), name="donation-item-detail"),
    path("<int:pk>/confirm/", views.ConfirmDonationView.as_view(), name="donation-confirm"),
    path("stats/dashboard/", views.DonorDashboardStatsView.as_view(), name="donor-dashboard-stats"),
]
