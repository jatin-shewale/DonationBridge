from django.urls import path

from . import views

urlpatterns = [
    path("", views.DonationRequestListCreateView.as_view(), name="request-list-create"),
    path("<int:pk>/", views.DonationRequestDetailView.as_view(), name="request-detail"),
    path("<int:pk>/accept/", views.AcceptRequestView.as_view(), name="request-accept"),
    path("<int:pk>/reject/", views.RejectRequestView.as_view(), name="request-reject"),
    path("<int:pk>/complete/", views.CompleteRequestView.as_view(), name="request-complete"),
]
