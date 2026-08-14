from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "username", "role", "is_active", "created_at")
    list_filter = ("role", "is_active")
    ordering = ("-created_at",)
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Donation system fields", {"fields": ("role", "phone", "address", "city", "state", "pincode")}),
    )


admin.site.register(User, UserAdmin)
