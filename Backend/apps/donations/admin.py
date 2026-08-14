from django.contrib import admin

from .models import Donation, DonationItem


class DonationItemInline(admin.TabularInline):
    model = DonationItem
    extra = 0


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ("title", "donor", "status", "created_at")
    list_filter = ("status",)
    inlines = [DonationItemInline]
