from django.urls import path

from . import views
from .views import ApplicationCreate, CitiesAPIView

urlpatterns = [
    path("api/applications/", views.ApplicationsListCreate.as_view()),
    path(
        "api/applications/create/",
        ApplicationCreate.as_view(),
        name="application-create",
    ),
    path("api/cities/", CitiesAPIView.as_view(), name="cities"),
    path(
        "api/applications/update/",
        views.ApplicationUpdate.as_view(),
        name="application-update",
    ),
    path(
        "api/user_applications/",
        views.UserApplicationsList.as_view(),
        name="user-applications-list",
    ),
]
