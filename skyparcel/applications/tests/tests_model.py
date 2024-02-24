import django.core.exceptions
import django.db
import django.test

import applications.factory
import applications.models

__all__ = []


class ModelTests(django.test.TestCase):
    def test_create_application_code_positive(self):
        codes_list = (
            "111111",
            "AAAAAA",
            "123ABC",
            "1AB23C45",
            "1234",
            "1ABCDS1",
            "A12313Z",
            "10LDGHBCXZ",
            "1FSDSF",
            "A12356",
        )
        for code in codes_list:
            with self.subTest(code=code):
                application_count = (
                    applications.models.Application.objects.count()
                )
                application = applications.factory.ApplicationFactory(
                    booking_code=code,
                )

                self.assertEqual(
                    applications.models.Application.objects.count(),
                    application_count + 1,
                    msg="Число заявок не увеличилось",
                )
                self.assertEqual(
                    application.booking_code,
                    code,
                    msg=f"Код полета не соотвествует тому что в тесте {code}",
                )

    def test_create_application_code_negative(self):
        codes_list = (
            "AAAAAa",
            "A",
            "TESTКОД",
            "CODE_",
            "_CODE",
            "CO_DE" "!12342",
            "",
            "RYBA+",
            ",FSDS",
            "<html>",
            "Русское:",
            "ネグロ",
            "PIVOOOOOOOOO",
            "MAIL@BK.RU",
            "CODE?",
        )
        for code in codes_list:
            with self.subTest(code=code):
                application_count = (
                    applications.models.Application.objects.count()
                )
                with self.assertRaises(django.core.exceptions.ValidationError):
                    self.application = (
                        applications.factory.ApplicationFactory.build(
                            booking_code=code,
                        )
                    )
                    self.application.full_clean()
                    self.application.save()

                self.assertEqual(
                    applications.models.Application.objects.count(),
                    application_count,
                    msg="Число заявок увеличилось",
                )
