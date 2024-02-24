from django.contrib.auth import get_user_model
from django.utils import timezone
import factory

import applications.models
import users.models

__all__ = ["UserFactory", "ApplicationFactory"]


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()

    username = factory.Sequence(lambda n: f"testuser{n}")
    password = factory.PostGenerationMethodCall("set_password", "password")
    is_active = True


class UserProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = users.models.Profile

    user = factory.SubFactory(UserFactory)


class ApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = applications.models.Application

    user = factory.SubFactory(UserFactory)
    departure_city = factory.Faker("city")
    destination_city = factory.Faker("city")
    booking_code = "TESTCODE"
    departure_time = timezone.now()
    arrival_time = timezone.now()
    comment = factory.Faker("text")
    is_active = True
