from chat.forms import SendMessage
from chat.models import Chat
from chat.models import Message
from django.shortcuts import redirect, render

from applications.models import Application

__all__ = []

from rest_framework import viewsets

from chat.serializers import ChatSerializer, MessageSerializer


# def chatpage(request, pk_application, pk):
#     form = SendMessage(request.POST or None)
#     if form.is_valid():
#         message = form.cleaned_data.get("content")
#         application = Application.objects.filter(id=pk_application).first()
#         chat = Chat.objects.filter(id=pk, chat_application=application).first()
#         if request.user != chat.traveler:
#             chat.client = request.user
#             chat.save()
#         Message.objects.create(
#             author=request.user,
#             relate_application=application,
#             content=message,
#             from_chat=chat,
#         )
#         return redirect("chat:chat-page", pk_application=pk_application, pk=pk)
#     chat = Chat.objects.filter(id=pk).first()
#     messages = Message.objects.filter(from_chat=chat)
#     form = SendMessage()
#     context = {
#         "pk_application": pk_application,
#         "pk": pk,
#         "messages": messages,
#         "form": form,
#     }
#     return render(request, "chat/chatPage.html", context)


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(from_chat=self.kwargs["chat_pk"])


# def chatpagecreate(request, pk_application):
#     application = Application.objects.filter(id=pk_application).first()
#     if Chat.objects.filter(
#             client=request.user,
#             chat_application=application,
#     ).exists():
#         chat = Chat.objects.filter(
#             client=request.user,
#             chat_application=application,
#         ).first()
#         return redirect(
#             "chat:chat-page",
#             pk_application=application.id,
#             pk=chat.id,
#         )
#     chat = Chat.objects.create(
#         client=request.user,
#         chat_application=application,
#         traveler=application.user,
#     )
#     context = {"pk_application": pk_application, "pk": chat.id}
#     return render(request, "chat/chatPage.html", context)
