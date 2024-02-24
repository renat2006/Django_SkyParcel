import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
import django.db.models

import applications.models

__all__ = []


class Chat(django.db.models.Model):
    client = django.db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="chats",
        on_delete=django.db.models.CASCADE,
        null=True,
        blank=True,
    )

    traveler = django.db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="chat_with_client",
        on_delete=django.db.models.CASCADE,
        null=True,
        blank=True,
    )

    chat_application = django.db.models.ForeignKey(
        applications.models.Application,
        related_name="chats",
        on_delete=django.db.models.CASCADE,
    )


class MessageManager(django.db.models.Manager):
    def ordered_by_time(self):
        return super().get_queryset().order_by("-timestamp").all()


class Message(django.db.models.Model):
    objects = MessageManager()

    author = django.db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="messages",
        on_delete=django.db.models.CASCADE,
    )

    relate_application = django.db.models.ForeignKey(
        applications.models.Application,
        related_name="messages",
        on_delete=django.db.models.CASCADE,
    )

    from_chat = django.db.models.ForeignKey(
        Chat,
        related_name="messages",
        on_delete=django.db.models.CASCADE,
    )

    content = django.db.models.TextField()

    timestamp = django.db.models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        channel_layer = get_channel_layer()
        is_client = self.author == self.from_chat.client
        notification = {
            "type": "chat_message",
            "message": json.dumps(
                {
                    "content": self.content,
                    "author_id": self.author_id,
                    "is_client": is_client,
                }
            ),
        }
        async_to_sync(channel_layer.group_send)(
            f"chat_{self.from_chat.id}", notification
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return self.author.name

    class Meta:
        verbose_name = "сообщение"
        verbose_name_plural = "сообщения"
