import React, {useState, useEffect} from "react";
import Header from "../../components/Header/Header";
import {FlexGrid, FlexGridItem} from "baseui/flex-grid";
import NearestFlightCard from "../../components/Card/NearestFlightCard";
import {DisplayMedium} from "baseui/typography";
import FlightsDashboard from "../../components/FlightsDashboard/FlightsDashboard";
import {Card, StyledBody} from "baseui/card";
import {Button} from "baseui/button";
import FlightCard from "../../components/FlightCard/FlightCard";
import axios from "axios";
import {baseURL} from "../../services/app.service";


const MainPage = () => {
    const [flights, setFlights] = useState([]);
    const [users, setUsers] = useState({});
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [filteredFlights, setFilteredFlights] = useState([]);

    const retrieveAllFlights = () => {
        axios.get(`api/applications/`)
            .then(response => {
                setFlights(response.data);
                setFilteredFlights(response.data); // Инициализация фильтрованных рейсов
                retrieveUsers();
            })
            .catch(error => console.error(error));
    };
    const handleFilterChange = (filters) => {
        const {departureCity, arrivalCity, dates} = filters;
        const filtered = flights.filter(flight => {
            // Ваша логика фильтрации здесь. Пример:
            return (!departureCity || flight.departure_city === departureCity) &&
                (!arrivalCity || flight.destination_city === arrivalCity) &&
                (!dates || (flight.departure_time >= dates[0] && flight.departure_time <= dates[1]));
        });
        setFilteredFlights(filtered);
    };
const [cities, setCities] = useState({ departureCities: [], arrivalCities: [] });

    const retrieveCities = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/cities/`);
            setCities({
                departureCities: response.data.departureCities,
                arrivalCities: response.data.arrivalCities
            });
            console.log({
                departureCities: response.data.departureCities,
                arrivalCities: response.data.arrivalCities
            })
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };


    const nearestFlights = flights.filter(flight => {
        const flightDateTime = new Date(flight.departure_time);
        const now = new Date();
        const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        return flightDateTime >= sixHoursFromNow && flightDateTime <= twentyFourHoursFromNow;
    });
    const retrieveUsers = () => {
        axios.get(`${baseURL}/auth/api/users/`)
            .then(response => {
                const usersData = response.data.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsers(usersData);
            })
            .catch(error => console.error(error));
    };

    useEffect(() => {
        retrieveAllFlights();
    }, []);
 useEffect(() => {
        retrieveAllFlights()
    }, []);


    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const calculateFlightDuration = (departure, arrival) => {
        const departureTime = new Date(departure);
        const arrivalTime = new Date(arrival);
        const duration = arrivalTime - departureTime;
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        return `${hours}ч ${minutes}м`;
    };

    const getColumnCount = () => {
        if (windowWidth < 600) return 1;
        if (windowWidth < 900) return 2;
        if (windowWidth < 1500) return 3;
        return 5;
    };
    const getColumnFlightCardCount = () => {
        if (windowWidth < 750) return 1;
        if (windowWidth < 1250) return 2;
        if (windowWidth < 1500) return 3;
        return 4;
    };


    return (
        <div>

            <div className="main__content">
                <DisplayMedium marginBottom="scale800" color="primaryB">Горящие рейсы🔥</DisplayMedium>
                <FlexGrid marginBottom="scale800"
                          flexGridColumnCount={getColumnCount()}
                          flexGridColumnGap="scale800"
                          flexGridRowGap="scale800">
                    {nearestFlights.map(flight => {
                        const formatDate = date => date.toLocaleDateString();
                        const formatTime = date => date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const user = users[flight.user];
                        console.log(flight)
                        const departureDateTime = new Date(flight.departure_time);
                        const arrivalDateTime = new Date(flight.arrival_time);

                        return (
                            <FlexGridItem key={flight.id}>
                                <NearestFlightCard
                                    departureCity={flight.departure_city}
                                    arrivalCity={flight.destination_city}
                                    flightDate={flight.departure_time}
                                    userImage={users[flight.user]?.userImage}
                                    departureTime={formatTime(departureDateTime)}
                                    arrivalTime={formatTime(arrivalDateTime)}
                                    departureDate={formatDate(departureDateTime)}
                                    arrivalDate={formatDate(arrivalDateTime)}
                                    departureCity={flight.departure_city}
                                    departureCode={flight.departure_airport_code}
                                    arrivalCity={flight.destination_city}
                                    arrivalCode={flight.arrival_airport_code}
                                    comment={flight.comment}
                                    cities={cities}
                                    contactPhone={flight.contact_phone}
                                    user={{userName: user?.username, image: user?.image, email: user?.email}}
                                    flightDuration={calculateFlightDuration(flight.departure_time, flight.arrival_time)}
                                />
                            </FlexGridItem>
                        )
                    })}
                </FlexGrid>
                <DisplayMedium marginBottom="scale800" color="primaryB">Выбор рейса</DisplayMedium>
                <Card title="Выберите удобные параметры доставки">
                    <StyledBody>
                        <FlightsDashboard windowWidth={windowWidth}/>
                        <Button overrides={{BaseButton: {style: {width: "100%", marginBottom: "15px"}}}}>
                            Найти рейсы
                        </Button>
                        <FlexGrid marginBottom="scale800"
                                  flexGridColumnCount={getColumnFlightCardCount()}
                                  flexGridColumnGap="scale800"
                                  flexGridRowGap="scale800">
                            {flights.map(flight => {
                                const user = users[flight.user];
                                console.log(flight)
                                const departureDateTime = new Date(flight.departure_time);
                                const arrivalDateTime = new Date(flight.arrival_time);

                                const formatDate = date => date.toLocaleDateString();
                                const formatTime = date => date.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                return (
                                    <FlexGridItem key={flight.id}>
                                        <FlightCard
                                            departureTime={formatTime(departureDateTime)}
                                            arrivalTime={formatTime(arrivalDateTime)}
                                            departureDate={formatDate(departureDateTime)}
                                            arrivalDate={formatDate(arrivalDateTime)}
                                            departureCity={flight.departure_city}
                                            departureCode={flight.departure_airport_code}
                                            arrivalCity={flight.destination_city}
                                            arrivalCode={flight.arrival_airport_code}
                                            comment={flight.comment}

                                            contactPhone={flight.contact_phone}
                                            user={{userName: user?.username, image: user?.image, email: user?.email}}
                                            flightDuration={calculateFlightDuration(flight.departure_time, flight.arrival_time)}
                                            onFilterChange={handleFilterChange}
                                        />
                                    </FlexGridItem>
                                );
                            })}
                        </FlexGrid>
                    </StyledBody>
                </Card>
            </div>
        </div>
    );
};

export default MainPage;
