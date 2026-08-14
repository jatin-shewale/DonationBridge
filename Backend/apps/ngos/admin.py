from django.contrib import admin

from .models import NGO, NGORequirement


@admin.register(NGO)
class NGOAdmin(admin.ModelAdmin):
    list_display = ("organization_name", "approval_status", "city", "created_at")
    list_filter = ("approval_status",)


@admin.register(NGORequirement)
class NGORequirementAdmin(admin.ModelAdmin):
    list_display = ("ngo", "item_name", "required_quantity", "priority", "active")
    list_filter = ("priority", "active")
