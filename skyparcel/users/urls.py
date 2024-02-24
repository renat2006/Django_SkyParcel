from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from homepage import views
import users.views


app_name = "users"

urlpatterns = [
    path(
        "activate_with_email/<str:username>/",
        users.views.activate_with_email,
        name="activate_with_email",
    ),
    path(
        "profile/",
        views.HomeView.as_view(),
        name="profile",
    ),
    path(
        "logout/",
        views.HomeView.as_view(),
        name="logout",
    ),
    path(
        "login",
        views.HomeView.as_view(),
        name="logout",
    ),
    path(
        "change_password/",
        users.views.change_password,
        name="change_password",
    ),
    path(
        "code_for_password/<str:email>",
        users.views.code_for_password,
        name="code_for_password",
    ),
    path(
        "password_change/<str:username>",
        users.views.password_change,
        name="password_change",
    ),
    path("api/users/", users.views.UserListCreate.as_view()),
    path("api/signup/", users.views.SignUpView.as_view(), name="api-signup"),
    path(
        "api/verify/",
        users.views.VerifyCodeView.as_view(),
        name="verify_code",
    ),
    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "api/user_info/",
        users.views.CurrentUserView.as_view(),
        name="current_user",
    ),
    path(
        "api/upload-profile-image/",
        users.views.UploadProfileImageView.as_view(),
        name="upload-profile-image",
    ),
    path(
        "api/upload-passport-images/",
        users.views.UploadPassportView.as_view(),
        name="upload-passport-images",
    ),
]

__all__ = ()
