# Generated by Django 4.2.7 on 2023-12-21 20:01

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0003_application_arrival_airport_code_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="application",
            name="contact_email",
        ),
    ]
