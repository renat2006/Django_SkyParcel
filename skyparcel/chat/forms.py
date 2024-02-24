import chat.models
import django.forms

__all__ = []


class SendMessage(django.forms.ModelForm):
    class Meta:
        model = chat.models.Message
        fields = ["content"]
