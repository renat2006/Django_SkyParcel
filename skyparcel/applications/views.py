from rest_framework import generics, status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView

from .flightaware_api import fetch_flight_data
from .models import Application, ParcelImage
from .serializers import ApplicationsSerializer

__all__ = []


class FlightDataNotFoundException(APIException):
    status_code = 404
    default_detail = "Flight data not found."


class ApplicationUpdate(APIView):
    def post(self, request, *args, **kwargs):
        application_id = request.data.get("application_id")
        try:
            application = Application.objects.get(id=application_id)
            application.is_active = False
            application.save()
            return Response(
                {"message": "Application status updated successfully"},
                status=status.HTTP_200_OK,
            )
        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


from rest_framework.permissions import IsAuthenticated


class UserApplicationsList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_applications = Application.objects.filter(
            user=request.user, is_active=True
        )
        serializer = ApplicationsSerializer(user_applications, many=True)
        return Response(serializer.data)


class ApplicationCreate(APIView):
    serializer_class = ApplicationsSerializer

    def post(self, request, *args, **kwargs):
        serializer = ApplicationsSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user
            flight_number = (
                request.data.get("booking_code").strip().replace(" ", "")
            )
            departure_time = request.data.get("departure_time")
            arrival_time = request.data.get("arrival_time")
            flight_data = fetch_flight_data(flight_number)

            if flight_data is None or not flight_data["flights"]:
                return Response(
                    {"error": "Flight data not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            first_flight = flight_data.get("flights", [])[0]
            if first_flight is None:
                return Response(
                    {"error": "No flight information available"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if flight_data:

                application = serializer.save(
                    user=user,
                    is_active=True,
                    departure_city=first_flight.get("origin", {}).get(
                        "name",
                        "",
                    ),
                    destination_city=first_flight.get("destination", {}).get(
                        "name",
                        "",
                    ),
                    departure_time=departure_time,
                    arrival_time=arrival_time,
                    departure_airport_code=first_flight.get("origin", {}).get(
                        "code_iata",
                        "",
                    ),
                    arrival_airport_code=first_flight.get(
                        "destination",
                        {},
                    ).get("code_iata", ""),
                    contact_phone=request.data.get("contact_phone", ""),
                    comment=request.data.get("comment", ""),
                )

                images = request.FILES.getlist("parcel_images")
                print("images")
                for image in images:
                    ParcelImage.objects.create(
                        application=application,
                        image=image,
                    )

                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED,
                )
            else:
                raise FlightDataNotFoundException()

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CitiesAPIView(APIView):
    def get(self, request, *args, **kwargs):
        departure_cities = Application.objects.values_list(
            "departure_city", flat=True
        ).distinct()
        arrival_cities = Application.objects.values_list(
            "destination_city", flat=True
        ).distinct()

        return Response(
            {
                "departureCities": list(departure_cities),
                "arrivalCities": list(arrival_cities),
            }
        )


class ApplicationsListCreate(generics.ListCreateAPIView):
    def get_queryset(self):
        return Application.objects.active()

    serializer_class = ApplicationsSerializer
