import django.forms
from django.forms import DateInput

import applications.models

__all__ = []


class RouteSearchForm(django.forms.Form):
    pass


class AddCommentForm(django.forms.ModelForm):
    class Meta:
        model = applications.models.Comment
        fields = ["text"]


class ApplicationAdd(django.forms.ModelForm):
    departure_time = django.forms.DateTimeField(
        required=False,
        widget=DateInput(attrs={"type": "datetime-local"}),
    )

    class Meta:
        model = applications.models.Application
        fields = "__all__"
        exclude = ["user", "is_active", "status"]
