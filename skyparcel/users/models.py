from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager, PermissionsMixin
import django.db
import django.db.models
from django.utils import timezone
import jwt
import sorl.thumbnail

__all__ = []


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):

        if username is None:
            raise TypeError("Users must have a username.")
        if email is None:
            raise TypeError("Users must have an email address.")

        user = self.model(
            username=username,
            email=self.normalize_email(email),
            **extra_fields,
        )
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, username, email, password):
        """Создает и возввращет пользователя с привилегиями суперадмина."""
        if password is None:
            raise TypeError("Superusers must have a password.")

        user = self.create_user(username, email, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()

        return user


class User(AbstractBaseUser, PermissionsMixin):
    def get_userfiles_path(self, filename):
        return f"users/{self.username}/{filename}"

    # Каждому пользователю нужен понятный человеку уникальный идентификатор,
    # который мы можем использовать для предоставления User в пользовательском
    # интерфейсе. Мы так же проиндексируем этот столбец в базе данных для
    # повышения скорости поиска в дальнейшем.
    username = django.db.models.CharField(
        db_index=True,
        max_length=255,
        unique=True,
    )

    first_name = django.db.models.CharField(db_index=True, max_length=255)

    last_name = django.db.models.CharField(db_index=True, max_length=255)

    # Так же мы нуждаемся в поле, с помощью которого будем иметь возможность
    # связаться с пользователем и идентифицировать его при входе в систему.
    # Поскольку адрес почты нам нужен в любом случае, мы также будем
    # использовать его для входы в систему, так как это наиболее
    # распространенная форма учетных данных на данный момент (ну еще телефон).
    email = django.db.models.EmailField(db_index=True, unique=True)

    is_active = django.db.models.BooleanField(default=True)

    # Этот флаг определяет, кто может войти в административную часть нашего
    # сайта. Для большинства пользователей это флаг будет ложным.
    is_staff = django.db.models.BooleanField(default=False)

    # Временная метка создания объекта.
    created_at = django.db.models.DateTimeField(auto_now_add=True)

    # Временная метка показывающая время последнего обновления объекта.
    updated_at = django.db.models.DateTimeField(auto_now=True)

    # Дополнительный поля, необходимые Django
    # при указании кастомной модели пользователя.

    image = django.db.models.ImageField(
        "фото профиля",
        upload_to=get_userfiles_path,
        help_text="Фото пользователя",
        null=True,
        blank=True,
    )

    attempts_count = django.db.models.PositiveIntegerField(
        "попытки входа",
        help_text="Число неудачных попыток входа",
        default=0,
    )

    reactivation_time = django.db.models.DateTimeField(
        "время деактивации аккаунта",
        help_text="Время преодоления порога максимального"
        " числа неудачных попыток войти",
        null=True,
        blank=True,
    )

    PASSPORT_STATUS_CHOICES = [
        ("not_verified", "Паспорт не подтвержден"),
        ("pending", "Отправлен на проверку"),
        ("verified", "Проверен (подтвержден)"),
        ("rejected", "Проверен (отклонен)"),
    ]
    passport_status = django.db.models.CharField(
        max_length=15,
        choices=PASSPORT_STATUS_CHOICES,
        default="not_verified",
    )
    date_joined = django.db.models.DateTimeField(
        "date joined",
        default=timezone.now,
    )

    # Свойство USERNAME_FIELD сообщает нам, какое поле мы будем использовать
    # для входа в систему. В данном случае мы хотим использовать почту.
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    # Сообщает Django, что определенный выше класс UserManager
    # должен управлять объектами этого типа.
    objects = UserManager()

    def __str__(self):
        """Строковое представление модели (отображается в консоли)"""
        return self.email

    def get_passport_verifications_status(self):
        return self.passport_status

    get_passport_verifications_status.short_description = (
        "статус подтверждения паспорта"
    )

    @property
    def token(self):
        """
        Позволяет получить токен пользователя путем вызова user.token, вместо
        user._generate_jwt_token(). Декоратор @property выше делает это
        возможным. token называется "динамическим свойством".
        """
        return self._generate_jwt_token()

    @property
    def get_image_300x300(self):
        return sorl.thumbnail.get_thumbnail(
            self.image,
            "150x150",
            quality=65,
        )

    def get_full_name(self):
        """
        Этот метод требуется Django для таких вещей, как обработка электронной
        почты. Обычно это имя фамилия пользователя, но поскольку мы не
        используем их, будем возвращать username.
        """
        return self.username

    def get_short_name(self):
        """Аналогично методу get_full_name()."""
        return self.username

    def _generate_jwt_token(self):
        """
        Генерирует веб-токен JSON, в котором хранится идентификатор этого
        пользователя, срок действия токена составляет 1 день от создания
        """
        dt = datetime.now() + timedelta(days=1)

        token = jwt.encode(
            {"id": self.pk, "exp": int(dt.strftime("%s"))},
            settings.SECRET_KEY,
            algorithm="HS256",
        )

        return token.decode("utf-8")


class PassportImage(django.db.models.Model):
    def get_userfiles_path(self, filename):
        return f"users/{self.user.username}/{filename}"

    user = django.db.models.ForeignKey(
        User,
        related_name="passport_images",
        on_delete=django.db.models.CASCADE,
    )
    image = django.db.models.ImageField("фото", upload_to=get_userfiles_path)
    created_at = django.db.models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Изображение для {self.user.username}"
