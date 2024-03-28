import React, {useState} from 'react';
import axios from 'axios';

import Header from "../../components/Header/Header";
import {Card} from "baseui/card";
import {FormControl} from "baseui/form-control";
import {Input} from "baseui/input";
import {Button} from "baseui/button";
import {PinCode} from "baseui/pin-code";
import {Notification, KIND} from "baseui/notification";
import {StyledLink} from "baseui/link";
import {useNavigate} from "react-router-dom";
import {Check} from "baseui/icon";
import {DURATION, useSnackbar} from "baseui/snackbar";
import {baseURL} from "../../services/app.service";
import {Title} from "baseui/card/styled-components";
import {DisplayMedium, DisplaySmall, HeadingSmall} from "baseui/typography";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        surname: '',
        email: '',
        password1: '',
        password2: ''
    });
    const [pinCode, setPinCode] = useState(["", "", "", "", "", ""]);
    const [formErrors, setFormErrors] = useState({});
    const [stage, setStage] = useState('form'); // 'form', 'verify', or 'success'
    const navigate = useNavigate();
    const {enqueue} = useSnackbar();
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${baseURL}/auth/api/signup/`, formData);
            setStage('verify');
            setFormErrors({});
        } catch (error) {
            if (error.response) {
                setFormErrors(error.response.data);
            }
        }
    };

    const handleVerify = async () => {
        try {
            const response = await axios.post(`${baseURL}/auth/api/verify/`, {
                code: pinCode.join(''),
                email: formData.email
            });

            if (response.data.status === 'verified') {

                localStorage.setItem('accessToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                window.dispatchEvent(new Event('storage', {
                    key: 'accessToken',
                    newValue: response.data.access
                }));
                setStage('success');
                enqueue({
                    startEnhancer: ({size}) => <Check size={size}/>,
                    message: 'Вы успешно зарегистрировались!',
                    kind: 'positive',
                    duration: DURATION.medium,
                    actionMessage: 'Ок',
                    actionOnClick: () => {
                    },
                });
                navigate('/');
                window.location.reload();
            } else {
                setFormErrors({verify: 'Неверный код подтверждения'});
            }
        } catch (error) {
            if (error.response) {
                setFormErrors(error.response.data);
            }
        }
    };

    return (
        <>

            <div className="main__content">
                <Card>
                    {stage === 'form' && (
                        <>
                            <FormControl label="Ник" error={formErrors.username}>
                                <Input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl label="Имя" error={formErrors.first_name}>
                                <Input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl label="Фамилия" error={formErrors.last_name}>
                                <Input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl label="Email" error={formErrors.email}>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl label="Пароль" error={formErrors.password1}>
                                <Input
                                    name="password1"
                                    type="password"
                                    value={formData.password1}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl label="Подтверждение пароля" error={formErrors.password2}>
                                <Input
                                    name="password2"
                                    type="password"
                                    value={formData.password2}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <Button onClick={handleSubmit}>Регистрация</Button>
                            <div style={{marginTop: '10px'}}>
                                Уже зарегистрированы? <StyledLink href="/login">
                                Войти
                            </StyledLink>

                            </div>
                        </>
                    )}
                    {stage === 'verify' && (
                        <>
                            <HeadingSmall>Введите код подтверждения с почты</HeadingSmall>
                            <PinCode
                                values={pinCode}
                                onChange={({values}) => setPinCode(values)}
                            />
                            <Button style={{marginTop: "30px"}} onClick={handleVerify}>Подтвердить</Button>
                        </>
                    )}
                    {stage === 'success' && (
                        <Notification kind={KIND.positive}>
                            Регистрация успешно завершена!
                        </Notification>
                    )}
                    {Object.keys(formErrors).length > 0 && stage !== 'success' && (
                        <Notification kind={KIND.negative}>
                            Ошибка при заполнении формы. Проверьте введенные данные.
                        </Notification>
                    )}
                </Card>
            </div>
        </>
    );
};

export default SignUpPage;
