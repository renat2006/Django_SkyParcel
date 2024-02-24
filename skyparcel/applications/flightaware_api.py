import requests

__all__ = []

FLIGHTAWARE_API_KEY = "416HPu5SqZ8DJAP9ndNfeqZFDxjgFGs2"
FLIGHTAWARE_BASE_URL = "https://flightxml.flightaware.com/json/FlightXML3/"


def fetch_flight_data(flight_number):
    apiKey = "416HPu5SqZ8DJAP9ndNfeqZFDxjgFGs2"
    apiUrl = "https://aeroapi.flightaware.com/aeroapi/"

    payload = {"max_pages": 2}
    auth_header = {"x-apikey": apiKey}

    try:
        response = requests.get(
            apiUrl + f"flights/{flight_number}",
            params=payload,
            headers=auth_header,
        )
        response.raise_for_status()
        flight_data = response.json()

        return flight_data
    except requests.exceptions.HTTPError:

        return None
    except Exception:

        return None
