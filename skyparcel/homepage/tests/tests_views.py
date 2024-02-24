import datetime
from unittest.mock import patch

import django.core.exceptions
import django.db
from django.db.models.query import QuerySet
import django.test
from django.urls import reverse
from django.utils import timezone

from applications.factory import ApplicationFactory

__all__ = []


class ViewsTests(django.test.TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.application_pos = ApplicationFactory(
            departure_time=timezone.now() + datetime.timedelta(hours=5),
        )
        cls.application_neg = ApplicationFactory(
            departure_time=timezone.now() + datetime.timedelta(hours=12),
        )

    def test_context_of_homepage(self):
        response = django.test.Client().get(reverse("homepage:home"))
        self.assertIn(
            "routes",
            response.context,
            msg="В контексте отсутсвует routes",
        )
        self.assertIsInstance(response.context["routes"], QuerySet)

    def test_context_of_homepage_hot_routes(self):
        response = django.test.Client().get(reverse("homepage:home"))

        self.assertIn(
            self.application_pos,
            response.context.get("routes"),
            msg="В контексте отсутсвует заявка",
        )
        self.assertNotIn(
            self.application_neg,
            response.context.get("routes"),
            msg="В контексте присутсвует заявка",
        )

    def test_context_of_homepage_count_routes(self):
        response = django.test.Client().get(reverse("homepage:home"))
        self.assertEqual(
            len(response.context.get("routes")),
            1,
            msg="Количество заявок не соответсвует",
        )

        for _ in range(4):
            ApplicationFactory(
                departure_time=timezone.now() + datetime.timedelta(hours=5),
            )
        response = django.test.Client().get(reverse("homepage:home"))
        self.assertEqual(
            len(response.context.get("routes")),
            5,
            msg="Количество заявок не соответсвует",
        )

        ApplicationFactory()
        response = django.test.Client().get(reverse("homepage:home"))
        self.assertEqual(
            len(response.context.get("routes")),
            5,
            msg="Количество заявок не соответсвует",
        )

    def test_context_active_logic_applcation(self):
        response = django.test.Client().get(reverse("homepage:home"))
        self.assertEqual(
            len(response.context.get("routes")),
            1,
            msg="Количество заявок не соответсвует",
        )

        application = ApplicationFactory(
            departure_time=timezone.now() + datetime.timedelta(hours=5),
            is_active=False,
        )

        response = django.test.Client().get(reverse("homepage:home"))
        self.assertEqual(
            len(response.context.get("routes")),
            1,
            msg="Количество заявок не соответсвует",
        )

        application.is_active = True
        application.save()

        response = django.test.Client().get(reverse("homepage:home"))
        self.assertEqual(
            len(response.context.get("routes")),
            2,
            msg="Количество заявок не соответсвует",
        )

    def test_hot_route_burning_after_6h(self):
        response = django.test.Client().get(reverse("homepage:home"))
        self.assertEqual(
            len(response.context.get("routes")),
            1,
            msg="Количество заявок не соответсвует",
        )

        now = timezone.now()
        with patch("django.utils.timezone.now") as mock_now:
            mock_now.return_value = now + datetime.timedelta(days=1)

            response = django.test.Client().get(reverse("homepage:home"))
            self.assertEqual(
                len(response.context.get("routes")),
                0,
                msg="Количество заявок не соответсвует, "
                "видимо не работает функционал сгорания заявок",
            )

        with patch("django.utils.timezone.now") as mock_now:
            mock_now.return_value = now - datetime.timedelta(hours=2)

            response = django.test.Client().get(reverse("homepage:home"))
            self.assertEqual(
                len(response.context.get("routes")),
                0,
                msg="Количество заявок не соответсвует, "
                "видимо не работает функционал отображения заявок",
            )
