from django.contrib import admin

from .models import DonationRequest


@admin.register(DonationRequest)
class DonationRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "donation", "ngo", "donor", "status", "requested_at")
    list_filter = ("status",)
