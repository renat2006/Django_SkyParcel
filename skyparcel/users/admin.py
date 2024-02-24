from django.contrib import admin
from django.db.models import Case, IntegerField, Value, When
from django.utils.html import format_html

import users.models
from .models import PassportImage

__all__ = []


class PassportImageInline(admin.TabularInline):
    model = PassportImage
    extra = 0
    can_delete = False

    readonly_fields = (
        "image_preview",
        "image",
    )

    def image_preview(self, obj):
        return format_html(
            '<img src="{}" style="max-width: 150px; max-height: 150px;" />',
            obj.image.url if obj.image else "",
        )

    def has_add_permission(self, request, obj=None):
        return False

    fields = ("image", "image_preview")


class UserAdmin(admin.ModelAdmin):
    inlines = [
        PassportImageInline,
    ]
    readonly_fields = (
        users.models.User.first_name.field.name,
        users.models.User.last_name.field.name,
        users.models.User.email.field.name,
        users.models.User.date_joined.field.name,
        users.models.User.username.field.name,
        users.models.User.last_login.field.name,
        users.models.User.attempts_count.field.name,
        users.models.User.image.field.name,
        users.models.User.reactivation_time.field.name,
    )
    list_display = (
        users.models.User.username.field.name,
        users.models.User.passport_status.field.name,
        users.models.User.email.field.name,
        users.models.User.is_staff.field.name,
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)

        ordering = Case(
            When(passport_status="pending", then=Value(1)),
            When(passport_status="not_verified", then=Value(2)),
            When(passport_status="verified", then=Value(3)),
            When(passport_status="rejected", then=Value(4)),
            default=Value(5),
            output_field=IntegerField(),
        )
        return queryset.annotate(custom_order=ordering).order_by(
            "custom_order",
            "username",
        )

    list_filter = ["passport_status", "is_active"]

    list_editable = ("passport_status",)


admin.site.register(users.models.User, UserAdmin)
