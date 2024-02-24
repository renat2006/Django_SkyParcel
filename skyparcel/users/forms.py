from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

import users.models


class VerifyFormEmail(forms.Form):
    code = forms.CharField(label="Введите код из письма на вашей почте")


class EmailForChangingPassword(forms.Form):
    email = forms.EmailField(label="Введите вашу почту")

    def clean(self):
        mail = self.cleaned_data.get("email")
        if not users.models.User.objects.filter(email=mail).exists():
            raise forms.ValidationError(
                "Пользователя с данной почтой не существует",
            )


class ChangePasswordForm(forms.Form):
    password = forms.CharField(label="Введите новый пароль")


class SignUpForm(UserCreationForm):
    def clean_email(self):
        allowed_emails = [
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
        mail = self.cleaned_data.get("email")
        if mail.split("@")[-1] not in allowed_emails:
            raise forms.ValidationError("Используйте Российскую почту")
        if "@" in mail:
            if users.models.User.objects.filter(email=mail).exists():
                raise forms.ValidationError(
                    "Пользователь с такой почтой уже существует",
                )
            return mail

        raise forms.ValidationError("Введенные данные не являются почтой")

    class Meta:
        model = users.models.User
        fields = (
            "username",
            "first_name",
            "last_name",
            "password1",
            "email",
            "password2",
        )


class UserToChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = users.models.User
        fields = ("username", "email")


class ChangeUserProfile(forms.ModelForm):
    class Meta:
        model = users.models.User
        fields = ["image"]


__all__ = ()
