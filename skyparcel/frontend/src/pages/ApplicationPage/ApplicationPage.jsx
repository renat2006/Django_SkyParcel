import React, {useState} from 'react';
import {Button} from 'baseui/button';
import {Card, StyledBody} from 'baseui/card';
import {FormControl} from 'baseui/form-control';
import {Input} from 'baseui/input';
import {Notification, KIND} from 'baseui/notification';
import {FileUploader} from "baseui/file-uploader";
import {PhoneInput, COUNTRIES, StyledFlag} from 'baseui/phone-input';
import {Textarea} from "baseui/textarea";
import {DatePicker, TimePicker} from "baseui/datepicker";
import {isAfter, isBefore} from "date-fns";
import {baseURL} from "../../services/app.service";
import {useStyletron} from "baseui";
import {useNavigate} from "react-router-dom";

const START_DATE = new Date();
const END_DATE = new Date();

function ApplicationPage() {
    const [bookingCode, setBookingCode] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [country, setCountry] = useState(COUNTRIES.RU);
    const [parcelImages, setParcelImages] = useState([]);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [applicationSuccess, setApplicationSuccess] = useState(false);
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [css, theme] = useStyletron();
    const [dates, setDates] = useState([START_DATE, END_DATE]);
    const isValidFlightNumber = (flightNumber) => {
        // Регулярное выражение для проверки номера рейса
        const regex = /^[A-Z0-9]+$/;
        return regex.test(flightNumber);
    };
    const handleParcelImageUpload = (acceptedFiles, rejectedFiles) => {
        setUploadErrors(rejectedFiles.map(file => file.errors[0].message));
        setParcelImages(acceptedFiles.map(file => URL.createObjectURL(file)));
    };
    const validateForm = () => {
        const errors = {};
        if (!bookingCode) {
            errors.bookingCode = 'Код бронирования обязателен.';
        } else if (!isValidFlightNumber(bookingCode.replace(/\s/g, ''))) {
            errors.bookingCode = 'Неверный формат номера рейса. Используйте только заглавные латинские буквы и цифры.';
        }
        if (!contactPhone) errors.contactPhone = 'Контактный телефон обязателен.';
        if (!comment) errors.comment = 'Комментарий обязателен.';
        if (parcelImages.length === 0) errors.parcelImages = 'Необходимо добавить хотя бы одно фото посылки.';

        if (!dates[0] || !dates[1]) {
            errors.dates = 'Необходимо выбрать дату и время отправления и прибытия.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    console.log(parcelImages)
     const navigate = useNavigate();
    const uploadFlightApplication = async () => {
        if (!validateForm()) return;

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('Токен доступа отсутствует');
            return;
        }

        try {
            const formData = new FormData();
            const fullPhoneNumber = `${country.dialCode}${contactPhone}`;
            const cleanedBookingCode = bookingCode.replace(/\s/g, '');
            formData.append('booking_code', cleanedBookingCode);
            console.log(fullPhoneNumber)
            formData.append('contact_phone', fullPhoneNumber);
            formData.append('comment', comment);
            const formattedDepartureDateTime = dates[0].toISOString();
            const formattedArrivalDateTime = dates[1].toISOString();

            formData.append('departure_time', formattedDepartureDateTime);
            formData.append('arrival_time', formattedArrivalDateTime);


            parcelImages.forEach((image, index) => {
                formData.append(`parcel_images[${index}]`, image);
            });


            const response = await fetch(`${baseURL}/api/applications/create/`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log(response)
            if (!response.ok) {

                const errorData = await response.json();

            setFormErrors([ 'Произошла неизвестная ошибка или номер рейса не найден в системе']);

            return;
            }

            setApplicationSuccess(true);
            navigate('/');
            setError('');
        } catch (error) {
            setError(error.message || 'Произошла ошибка при создании заявки');
            setApplicationSuccess(false);
        }
    };

    function CustomFlag(props) {
        const {children, ...rest} = props;
        return <StyledFlag iso={props.$iso} {...rest} />;
    }

    return (
        <div className="main__content">
            <Card>
                <StyledBody>
                    <FormControl label="Номер рейса" error={formErrors.bookingCode}>
                        <Input
                            value={bookingCode}
                            onChange={(e) => setBookingCode(e.target.value)}
                            placeholder="Номер рейса"
                            error={Boolean(formErrors.bookingCode)}
                        />
                    </FormControl>

                    <FormControl label="Контактный телефон" error={formErrors.contactPhone}>
                        <PhoneInput
                            text={contactPhone}
                            country={country}
                            onTextChange={(event) => setContactPhone(event.currentTarget.value)}
                            onCountryChange={(event) => setCountry(event.option)}
                            error={Boolean(formErrors.contactPhone)}
                            overrides={{
                                FlagContainer: {
                                    component: CustomFlag,
                                },
                            }}
                        />
                    </FormControl>
                    <div className={css({display: 'flex', flexDirection: 'column'})}>

                        <FormControl label="Дата отправления">
                            <DatePicker
                                formatString="dd.MM.yyyy"
                                value={dates}
                                onChange={({date}) => setDates(date)}
                                timeSelectStart
                                range

                                displayValueAtRangeIndex={0}
                                placeholder="Дата отправления"
                            />
                        </FormControl>
                        <FormControl label="Время отправления">
                            <TimePicker
                                format="24"
                                creatable
                                value={dates[0]}
                                onChange={(time) => {
                                    if (time && isAfter(time, dates[1])) {
                                        setDates([time, time]);
                                    } else {
                                        setDates([time, dates[1]]);
                                    }
                                }}
                            />
                        </FormControl>


                        <FormControl label="Дата прибытия">
                            <DatePicker
                                formatString="dd.MM.yyyy"
                                value={dates}
                                onChange={({date}) => setDates(date)}
                                timeSelectEnd
                                range

                                displayValueAtRangeIndex={1}
                                placeholder="Дата прибытия"
                            />
                        </FormControl>
                        <FormControl label="Время прибытия">
                            <TimePicker
                                format="24"
                                creatable
                                value={dates[1]}
                                onChange={(time) => {
                                    if (time && isBefore(time, dates[0])) {
                                        setDates([time, time]);
                                    } else {
                                        setDates([dates[0], time]);
                                    }
                                }}
                                placeholder="Время прибытия"
                            />
                        </FormControl>
                    </div>

                    <FormControl label="Комментарий к заявке" error={formErrors.comment}>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Введите комментарий"
                            error={Boolean(formErrors.comment)}
                        />
                    </FormControl>

                    <FormControl label="Фото посылки">
                        <FileUploader
                            accept="image/*"
                            multiple
                            onDrop={handleParcelImageUpload}
                        />

                    </FormControl>
                    <div>
                        {parcelImages.map((image, index) => (
                            <img key={index} src={image} alt={`Parcel ${index}`}
                                 style={{width: 100, height: 100, margin: 10}}/>
                        ))}
                    </div>

                    {uploadErrors.length > 0 && (
                        uploadErrors.map((error, index) => (
                            <Notification key={index} kind={KIND.negative}>{error}</Notification>
                        ))
                    )}

                    <Button onClick={uploadFlightApplication}>Отправить заявку</Button>

                    {Object.values(formErrors).map((error, index) => (
                        <Notification key={index} kind={KIND.negative}>{error}</Notification>
                    ))}

                    {applicationSuccess && <Notification kind={KIND.positive}>Заявка успешно отправлена!</Notification>}
                </StyledBody>
            </Card>
        </div>
    );
}

export default ApplicationPage;
