from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("register/donor/", views.DonorRegisterView.as_view(), name="register-donor"),
    path("register/ngo/", views.NGORegisterView.as_view(), name="register-ngo"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.MeView.as_view(), name="me"),
]
