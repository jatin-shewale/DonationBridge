from django.urls import path

from . import views

urlpatterns = [
    path("list/", views.NGOListView.as_view(), name="ngo-list"),
    path("list/<int:pk>/", views.NGODetailView.as_view(), name="ngo-detail"),
    path("profile/", views.MyNGOProfileView.as_view(), name="ngo-profile"),
    path("requirements/", views.NGORequirementListCreateView.as_view(), name="ngo-requirements"),
    path("requirements/<int:pk>/", views.NGORequirementDetailView.as_view(), name="ngo-requirement-detail"),
]
