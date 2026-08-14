from django.urls import path

from . import views

urlpatterns = [
    path("detect/", views.DetectObjectsView.as_view(), name="ai-detect"),
]
