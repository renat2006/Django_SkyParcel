import random

from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.core.mail import send_mail
from django.shortcuts import redirect, render
from django.urls import reverse
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

import applications.models
from users.forms import (
    ChangePasswordForm,
    ChangeUserProfile,
    EmailForChangingPassword,
    UserToChangeForm,
    VerifyFormEmail,
)
from .models import PassportImage, User
from .serializers import SignUpSerializer, UserSerializer

__all__ = []


class SignUpView(APIView):
    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            code = "".join(random.choices("0123456789", k=6))

            cache_key = f"signup_{user_data['email']}"
            cache_data = {"user_data": user_data, "verification_code": code}
            cache.set(cache_key, cache_data, timeout=3600)

            cache.set(cache_key, cache_data, timeout=3600)

            send_mail(
                "Ваш код активации",
                f"Ваш код активации: {code}",
                settings.EMAIL_HOST_USER,
                [user_data["email"]],
                fail_silently=False,
            )

            return Response(
                {"status": "pending_verification"},
                status=status.HTTP_202_ACCEPTED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyCodeView(APIView):
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        cache_key = f"signup_{email}"

        cache_data = cache.get(cache_key)
        if not cache_data:
            return Response(
                {
                    "status": "error",
                    "message": "Invalid or expired verification key",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_code = cache_data["verification_code"]
        user_data = cache_data["user_data"]

        if session_code == code:
            user = User.objects.create_user(
                username=user_data["username"],
                email=user_data["email"],
                password=user_data["password1"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
            )
            user.is_active = True
            user.save()

            cache.delete(cache_key)

            login(
                request,
                user,
                backend="django.contrib.auth.backends.ModelBackend",
            )

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "status": "verified",
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"status": "invalid_code"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@login_required
def profile(request):
    form1 = UserToChangeForm(request.POST or None)
    form2 = ChangeUserProfile(request.POST or None)
    if form1.is_valid() and form2.is_valid():
        form1.save()
        form2.save()
        applications_user = applications.models.Application.objects.filter(
            user=request.user,
        )
        return redirect(
            "users:profile",
            {
                "form1": form1,
                "form2": form2,
                "user": request.user,
                "applications": applications_user,
            },
        )
    else:
        form1 = UserToChangeForm()
        form2 = ChangeUserProfile()
        applications_user = applications.models.Application.objects.filter(
            user=request.user,
        )
        return render(
            request,
            "users/profile.html",
            {
                "form1": form1,
                "form2": form2,
                "user": request.user,
                "applications": applications_user,
            },
        )


class UploadPassportView(APIView):
    def post(self, request):
        user = request.user
        images = request.FILES.getlist("file")

        if images:
            PassportImage.objects.filter(user=user).delete()
            for img in images:
                PassportImage.objects.create(user=user, image=img)

            user.passport_status = "pending"
            user.save()

            return Response(UserSerializer(user).data)
        else:
            return Response(
                {"error": "Картинки не загружены!"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UploadProfileImageView(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "Файл не выбран"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        file_path = user.get_userfiles_path(file.name)
        user.image.save(file_path, file, save=True)

        return Response(
            {
                "detail": "Файл загружен успешно!",
                "newAvatarUrl": user.image.url,
            },
            status=status.HTTP_200_OK,
        )


def activate_with_email(request):
    if request.method == "POST":
        form = VerifyFormEmail(request.POST)
        if form.is_valid():
            code = form.cleaned_data.get("code")
            if request.user.profile.code == code:
                request.user.profile.code = None
                request.user.is_active = True
                request.user.save()
                return redirect("/")
    else:
        form = VerifyFormEmail()
    return render(request, "users/activate_email.html", {"form": form})


def change_password(request):
    form = EmailForChangingPassword(request.POST or None)
    if form.is_valid():
        choises = "0123456789"

        the_code = ""

        for _ in range(6):
            the_code += random.choice(choises)

        email = form.cleaned_data.get("email")

        user = User.objects.filter(email=email).first()
        user.profile.code = the_code
        user.profile.save()
        user.save()

        send_mail(
            "Subject here",
            f"Here is the message. code: {user.profile.code}",
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )

        return redirect(
            "users:code_for_password",
            kwargs={"email": user.email},
        )
    else:
        form = EmailForChangingPassword()
    return render(request, "users/change_password.html", {"form": form})


def code_for_password(request, email):
    form = VerifyFormEmail(request.POST or None)
    if form.is_valid():
        code = form.cleaned_data.get("code")
        user = User.objects.filter(email=email).first()
        if user.profile.code == code:
            user.profile.code = None
            user.is_active = True
            user.save()
            return redirect(
                reverse(
                    "users:password_change",
                    kwargs={"username": user.username},
                ),
            )
    else:
        form = VerifyFormEmail()
    return render(
        request,
        "users/code_for_password.html",
        {"form": form, "email": email},
    )


def password_change(request, username):
    form = ChangePasswordForm(request.POST or None)
    if form.is_valid():
        user = User.objects.filter(username=username).first()
        password = form.cleaned_data.get("password")
        user.set_password(password)
        user.save()
        return redirect("users:login")
    else:
        form = ChangePasswordForm()
    return render(
        request,
        "users/password_change.html",
        {"form": form, "username": username},
    )
