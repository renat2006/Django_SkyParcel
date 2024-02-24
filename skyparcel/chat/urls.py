from chat import views
from django.urls import path, include

__all__ = []

from rest_framework.routers import DefaultRouter

from homepage.views import HomeView

app_name = "chat"

router = DefaultRouter()
router.register(r"chats", views.ChatViewSet)
router.register(r"messages", views.MessageViewSet, basename="message")

urlpatterns = [
    path("", HomeView.as_view(), name="chat-page"),
    # path("<int:pk_application>/<int:pk>/", views.chatpage, name="chat-page"),
    # path("<int:pk_application>/", views.chatpagecreate, name="chat-page-create"),
    path("api/", include(router.urls)),
]
