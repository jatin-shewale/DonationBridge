from django.urls import path

from . import views

urlpatterns = [
    path("donations/<int:donation_id>/", views.DonationMatchesView.as_view(), name="donation-matches"),
]
