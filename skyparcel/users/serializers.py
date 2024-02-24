import re

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import serializers

from .models import User

__all__ = []


def validate_latin_username(value):
    if not re.match(r"^[a-zA-Z0-9.@+-]+$", value):
        raise ValidationError(
            "Ник может содержать только латинские буквы, цифры и @/./+/-/_",
        )


class SignUpSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=[validate_latin_username])
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "password1",
            "password2",
        )

    def validate_email(self, value):
        allowed_domains = [
            "yandex.ru",
            "mail.ru",
            "vk.com",
            "rambler.ru",
            "ro.ru",
            "myrambler.ru",
            "inbox.ru",
            "bk.ru",
            "list.ru",
            "internet.ru",
        ]

        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError(
                "Некорректный формат адреса электронной почты",
            )

        email_domain = value.split("@")[-1] if "@" in value else None
        if not email_domain or email_domain not in allowed_domains:
            raise serializers.ValidationError("Используйте Российскую почту")

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Пользователь с такой почтой уже существует",
            )

        return value

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError(
                "Поле 'Ник' обязательно к заполнению",
            )
        try:
            AbstractUser.username_validator(value)
        except ValidationError:
            raise serializers.ValidationError(
                "Ник может содержать только латинские буквы, цифры"
                " и @/./+/-/_",
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Пользователь с таким ником уже существует",
            )
        return value

    def validate_first_name(self, value):
        if not value:
            raise serializers.ValidationError(
                "Поле 'Имя' обязательно к заполнению",
            )
        return value

    def validate_last_name(self, value):
        if not value:
            raise serializers.ValidationError(
                "Поле 'Фамилия' обязательно к заполнению",
            )
        return value

    def validate_password1(self, value):
        if not value:
            raise serializers.ValidationError(
                "Поле 'Пароль' обязательно к заполнению",
            )
        return value

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError(
                {"password2": "Пароли не совпадают."},
            )

        return data

    # def create(self, validated_data):
    #
    #     user = User.objects.create_user(
    #         username=validated_data["username"],
    #         email=validated_data["email"],
    #         password=validated_data["password1"],
    #         first_name=validated_data["first_name"],
    #         last_name=validated_data["last_name"],
    #     )
    #     user.save()
    #
    #     return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "image",
            "passport_status",
        )

    def update(self, instance, validated_data):
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.save()

        return instance
