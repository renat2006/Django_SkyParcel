import * as React from 'react';
import {useState, useEffect} from 'react';
import {Card, StyledBody, StyledAction, StyledThumbnail} from 'baseui/card';
import {Button} from 'baseui/button';
import {ProgressBar} from 'baseui/progress-bar';
import PropTypes from "prop-types";
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader} from "baseui/modal";
import {StyledLink} from "baseui/link";

const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
};

const calculateTimeLeft = (flightDate) => {
    const now = new Date();
    const flightDateTime = new Date(flightDate);
    const timeLeft = flightDateTime - now;
    return Math.max(timeLeft, 0);
};

const calculateProgress = (flightDate, startTime = 24) => {
    const flightDateTime = new Date(flightDate);
    const startTimeDate = new Date(flightDateTime.getTime() - startTime * 60 * 60 * 1000); // 24 часа до вылета
    const now = new Date();

    if (now < startTimeDate) {
        return 0;
    }

    const totalTime = flightDateTime - startTimeDate;
    const elapsedTime = now - startTimeDate;
    return (elapsedTime / totalTime) * 100;
};

const formatRemainingTime = (timeLeft) => {
    let delta = Math.floor(timeLeft / 1000);

    const days = Math.floor(delta / 86400);
    delta -= days * 86400;

    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    const seconds = delta % 60;

    return `${hours}ч ${minutes}м ${seconds}с`;
};

const NearestFlightCard = ({
                               departureCity, arrivalCity, flightDate, userImage, departureTime,
                               flightDuration,
                               arrivalTime,

                               departureCode,

                               arrivalCode,
                               departureDate,
                               arrivalDate,
                               user,
                               contactPhone,
                               comment
                           }) => {
    const [progress, setProgress] = useState(calculateProgress(flightDate));
    const [remainingTime, setRemainingTime] = useState(formatRemainingTime(calculateTimeLeft(flightDate)));
    // const [arrivalCityImage, setArrivalCityImage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(calculateProgress(flightDate));
            setRemainingTime(formatRemainingTime(calculateTimeLeft(flightDate)));
        }, 1000);

        return () => clearInterval(interval);
    }, [flightDate]);

    // useEffect(() => {
    //     const fetchCityImage = async () => {
    //         const apiKey = '';
    //         const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${arrivalCity}&inputtype=textquery&fields=photos&key=${apiKey}`;
    //
    //         try {
    //             const response = await fetch(url);
    //             const data = await response.json();
    //             const photoReference = data.candidates[0]?.photos[0]?.photo_reference;
    //             if (photoReference) {
    //                 const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
    //                 setArrivalCityImage(imageUrl);
    //             }
    //         } catch (error) {
    //             console.error('Ошибка при получении изображения города:', error);
    //         }
    //     };
    //
    //     fetchCityImage();
    // }, [arrivalCity]);

    return (
        <Card
            overrides={{
                Root: {style: {width: '100%'}}, Title: {
                    style: ({$theme}) => ({
                        fontSize: $theme.typography.HeadingXSmall.fontSize
                    })
                }
            }}
            title={`${departureCity} ➔ ${arrivalCity}`}
        >
            <StyledThumbnail
                src={user ? user.image : ""}
            />
            <StyledBody>
                <div style={{fontWeight: 'bold', marginTop: '10px'}}>
                    Время вылета: {formatTime(flightDate)}
                </div>
                <ProgressBar overrides={{
                    BarContainer: {style: {marginLeft: 0}},
                }} value={progress}/>
                <div style={{marginTop: '10px'}}>
                    Осталось: {remainingTime}
                </div>
            </StyledBody>
            <StyledAction>
                <Button overrides={{BaseButton: {style: {width: '100%'}}}} onClick={openModal}>
                    Связаться
                </Button>
                <Modal onClose={closeModal} isOpen={isModalOpen}>
                    <ModalHeader>Информация о заявке</ModalHeader>
                    <ModalBody>
                        {/* Отображение информации о заявке */}
                        <p>Дата отправления: {departureTime}</p>
                        <p>Дата прибытия: {arrivalTime}</p>
                        <p>Контактный телефон: <StyledLink href={`tel:${contactPhone}`}>{contactPhone}</StyledLink></p>
                        <p>Email: {user.email}</p>
                        <p>Комментариий: {comment}</p>


                    </ModalBody>
                    <ModalFooter>

                        <ModalButton kind="tertiary" onClick={closeModal}>Закрыть</ModalButton>
                    </ModalFooter>
                </Modal>
            </StyledAction>
        </Card>
    );
};

NearestFlightCard.propTypes = {
    departureCity: PropTypes.string,
    arrivalCity: PropTypes.string,
    flightDate: PropTypes.string,
    userImage: PropTypes.string,
};

export default NearestFlightCard;
