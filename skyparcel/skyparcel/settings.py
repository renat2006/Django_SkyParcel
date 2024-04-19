from datetime import timedelta
import os
from pathlib import Path
import dj_database_url
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, True),
    DJANGO_SECRET_KEY=(str, "fake_secret_key"),
    DJANGO_ALLOWED_HOSTS=(list, ["*"]),
    DJANGO_MAIL_HOST=(str, "example.ru"),
    DJANGO_MAIL_PORT=(int, 1),
    DJANGO_MAIL_HOST_USER=(str, "example.ru"),
    DJANGO_MAIL_HOST_PASSWORD=(str, "123456"),
    DJANGO_MAIL_TLS=(bool, False),
    DJANGO_MAIL_SSL=(str, True),
)
environ.Env.read_env(BASE_DIR / ".env")

TRUE_DEF = ("", "true", "True", "yes", "YES", "1", "y")

SECRET_KEY = env("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS")
DEBUG = str(env("DJANGO_DEBUG")) in TRUE_DEF

EMAIL_HOST = env("DJANGO_MAIL_HOST")
EMAIL_PORT = env("DJANGO_MAIL_PORT")
EMAIL_HOST_USER = env("DJANGO_MAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("DJANGO_MAIL_HOST_PASSWORD")
EMAIL_USE_TLS = env("DJANGO_MAIL_TLS")
EMAIL_USE_SSL = env("DJANGO_MAIL_SSL")
SERVER_EMAIL = EMAIL_HOST_USER
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

AUTH_USER_MODEL = "users.User"

LOGIN_REDIRECT_URL = "/application_add"
LOGIN_URL = "/auth/login/"
LOGOUT_REDIRECT_URL = "/auth/logout/"

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_cleanup.apps.CleanupConfig",
    "sorl.thumbnail",
    "corsheaders",
    "channels",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "users.apps.UsersConfig",
    "applications.apps.ApplicationsConfig",
    "homepage.apps.HomepageConfig",
    "chat.apps.ChatConfig",
]
if DEBUG:
    INSTALLED_APPS.append("debug_toolbar")

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
]

ROOT_URLCONF = "skyparcel.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "frontend", "build")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "skyparcel.wsgi.application"
if not DEBUG:
    DATABASES = {
        'default': dj_database_url.config(

            default='postgres://renat:BOOyB5FjOpQgtK3NVpqBkCuh1sGmoUjD@dpg-coh919nsc6pc73ajhbdg-a.frankfurt-postgres.render.com/skyparceldb',
            conn_max_age=1200
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        },
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth"
                ".password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth"
                ".password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth"
                ".password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth"
                ".password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "ru"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "frontend", "build", "static")]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
]

CORS_ORIGIN_WHITELIST = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://localhost",
]
CORS_ALLOW_HEADERS = (
    "Access-Control-Allow-Origin",
    "accept-encoding",
    "content-type",
    "accept",
    "origin",
    "Authorization",
    "access-control-allow-methods",
)

SESSION_ENGINE = "django.contrib.sessions.backends.db"
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    },
}
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}
MEDIA_URL = "media/"
ASGI_APPLICATION = "skyparcel.routing.application"
MEDIA_ROOT = BASE_DIR / "media"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
if not DEBUG:
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
