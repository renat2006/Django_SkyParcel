import django.test
from django.urls import reverse

import users.forms
from users.models import User

__all__ = []


class SignupTests(django.test.TestCase):
    def test_singup(self):
        user_data = {
            "username": "test_user_1",
            "first_name": "имя",
            "last_name": "фамилия",
            "email": "testmail@mail.ru",
            "password1": "159874test",
            "password2": "159874test",
        }
        user_form = users.forms.SignUpForm(user_data)
        self.assertTrue(
            user_form.is_valid(),
            msg="Форма регистрации не валидна",
        )

        users_count = User.objects.count()

        response = django.test.Client().post(
            reverse("users:signup"),
            data=user_data,
            follow=True,
        )

        self.assertEqual(User.objects.count(), users_count + 1)

        self.assertRedirects(
            response,
            reverse("users:activate_with_email", args=["test_user_1"]),
        )
