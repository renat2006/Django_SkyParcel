from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
import django.contrib.auth.urls
from django.urls import include, path

from homepage import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("applications.urls")),
    path(
        "profile/",
        views.HomeView.as_view(),
        name="profile",
    ),
    path(
        "about",
        views.HomeView.as_view(),
        name="profile",
    ),
    path(
        "application_add/",
        views.HomeView.as_view(),
        name="application_add",
    ),
    path(
        "logout/",
        views.HomeView.as_view(),
        name="logout",
    ),
    path(
        "login/",
        views.HomeView.as_view(),
        name="login",
    ),
    path("auth/", include("users.urls")),
    path("auth/", include(django.contrib.auth.urls)),
    path("chat/", include("chat.urls")),
    path("", include("homepage.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT,
    )
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
