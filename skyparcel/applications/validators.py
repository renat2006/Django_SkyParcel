import re

import django.core.exceptions

__all__ = []


def boocking_code_validator(code):
    pattern = r"^[A-Z0-9]+$"
    if not re.match(pattern, code):
        raise django.core.exceptions.ValidationError(
            "Введите правильный код бронирования, "
            "состоящий из заглавных латинских букв и цифр",
        )
