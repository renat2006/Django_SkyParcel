from rest_framework import serializers

from .models import Application, ParcelImage

__all__ = []


class ParcelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParcelImage
        fields = ["id", "image"]


class ApplicationsSerializer(serializers.ModelSerializer):
    departure_city = serializers.CharField(required=False)
    destination_city = serializers.CharField(required=False)
    departure_time = serializers.DateTimeField(required=False)
    arrival_time = serializers.DateTimeField(required=False)
    parcel_images = ParcelImageSerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "user",
            "departure_city",
            "destination_city",
            "booking_code",
            "departure_time",
            "arrival_time",
            "comment",
            "is_active",
            "status",
            "contact_phone",
            "parcel_images",
            "departure_airport_code",
            "arrival_airport_code",
        ]
