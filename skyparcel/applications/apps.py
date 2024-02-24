from django.apps import AppConfig

__all__ = []


class ApplicationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "applications"
    verbose_name = "Заявки"
