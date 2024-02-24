from django.conf import settings
import django.core.validators
import django.db.models

import applications.validators

__all__ = []


class ApplicationManager(django.db.models.Manager):
    def active(self):
        return self.get_queryset().filter(is_active=True)


class Application(django.db.models.Model):
    objects = ApplicationManager()

    class StatusChoices(django.db.models.TextChoices):
        WAIT = ("WAIT", "Ожидание")
        IN_PROGRESS = ("IN", "Доставляется")
        DONE = ("DONE", "Доставлено")

    user = django.db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=django.db.models.CASCADE,
        verbose_name="пользователь",
        null=True,
    )

    contact_phone = django.db.models.CharField(
        "контактный телефон",
        max_length=20,
        blank=True,
    )
    departure_airport_code = django.db.models.CharField(
        max_length=10,
        verbose_name="код аэропорта отправления",
        blank=True,
    )
    arrival_airport_code = django.db.models.CharField(
        max_length=10,
        verbose_name="код аэропорта прибытия",
        blank=True,
    )
    departure_city = django.db.models.CharField(
        max_length=150,
        verbose_name="город отправления",
    )

    destination_city = django.db.models.CharField(
        max_length=150,
        verbose_name="город назначения",
    )
    booking_code = django.db.models.CharField(
        "номер рейса",
        max_length=10,
        validators=[
            django.core.validators.MinLengthValidator(
                4,
                message="номер слишком короткий",
            ),
            applications.validators.boocking_code_validator,
        ],
        help_text="Укажите номер рейса",
    )
    departure_time = django.db.models.DateTimeField(
        "дата и время отправления",
        help_text="Укажите дату и время отправления",
    )
    arrival_time = django.db.models.DateTimeField(
        "дата и время прибытия",
        help_text="Укажите дату и время прибытия",
    )
    comment = django.db.models.TextField(
        "комментарий к заявке",
        help_text="укажите какую-либо дополнительную информацию или пожелания",
        blank=True,
    )
    is_active = django.db.models.BooleanField(
        "активность заявки",
        help_text="отображается ли заявка другим пользователям",
        default=True,
    )
    status = django.db.models.CharField(
        "статус заявки",
        help_text="Текущий статус заявки",
        max_length=10,
        choices=StatusChoices.choices,
        default=StatusChoices.WAIT,
    )

    class Meta:
        verbose_name = "заявка на доставку"
        verbose_name_plural = "заявки на доставку"

    def __str__(self):
        return "Заявка с кодом " + self.booking_code


class ParcelImage(django.db.models.Model):
    application = django.db.models.ForeignKey(
        Application,
        related_name="parcel_images",
        on_delete=django.db.models.CASCADE,
    )
    image = django.db.models.ImageField("фото", upload_to="parcel_images/")

    def __str__(self):
        return f"Фото для заявки {self.application.id}"


class StatusLog(django.db.models.Model):
    timestamp = django.db.models.DateTimeField(
        "время изменения",
        default=django.utils.timezone.now,
        editable=False,
    )
    application = django.db.models.ForeignKey(
        "application",
        on_delete=django.db.models.CASCADE,
        verbose_name="заявка",
        null=True,
    )
    from_status = django.db.models.CharField(
        "изначальный статус",
        help_text="Изначальный статус",
        max_length=12,
        db_column="from",
    )
    to = django.db.models.CharField(
        "текущий статус",
        help_text="Текущий статус",
        max_length=12,
    )

    class Meta:
        verbose_name = "лог статуса"
        verbose_name_plural = "логи статуса"


class Comment(django.db.models.Model):
    user = django.db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=django.db.models.CASCADE,
        verbose_name="пользователь",
        null=True,
    )

    application = django.db.models.ForeignKey(
        Application,
        on_delete=django.db.models.CASCADE,
        verbose_name="заявление",
        related_name="comment_application",
        null=True,
    )

    text = django.db.models.TextField(max_length=600)

    def __str__(self):
        return self.user.username
