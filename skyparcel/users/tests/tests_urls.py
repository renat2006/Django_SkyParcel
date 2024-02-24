from http import HTTPStatus

import django.test
from django.urls import reverse

from applications.factory import UserFactory, UserProfileFactory

__all__ = []


class ViewTests(django.test.TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.test_user = UserFactory(username="test_admin", password="admin")
        UserProfileFactory(user=cls.test_user)

    def test_auth_endpoints(self):
        client = django.test.Client()
        client.post(
            reverse("users:login"),
            data={
                "username": "test_admin",
                "password": "admin",
            },
            follow=True,
        )

        auth_urls = (
            "signup",
            "login",
            "profile",
            "logout",
            "change_password",
        )
        for url in auth_urls:
            with self.subTest(url=url):
                response = client.get(reverse(f"users:{url}"))
                self.assertEqual(
                    response.status_code,
                    HTTPStatus.OK,
                    msg=f"Страница {url} не отвечает",
                )

    def test_auth_code_endpoint(self):
        response = django.test.Client().get(
            reverse("users:code_for_password", args=["example@bk.ru"]),
        )
        self.assertEqual(
            response.status_code,
            HTTPStatus.OK,
            msg="Страница для ввода кода из письма не отвечает",
        )

    def test_auth_password_change_endpoint(self):
        response = django.test.Client().get(
            reverse("users:password_change", args=["oleg"]),
        )
        self.assertEqual(
            response.status_code,
            HTTPStatus.OK,
            msg="Страница для ввода кода из письма не отвечает",
        )
