from django.urls import path

from . import views

urlpatterns = [
    path("stats/", views.AdminSystemStatsView.as_view(), name="admin-system-stats"),
]
