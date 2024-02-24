from django.contrib import admin

import applications.models
from applications.models import ParcelImage

__all__ = []


class ParcelImageInline(admin.TabularInline):
    model = ParcelImage
    extra = 1


@admin.register(applications.models.Application)
class ApplicationAdmin(admin.ModelAdmin):
    inlines = [ParcelImageInline]
