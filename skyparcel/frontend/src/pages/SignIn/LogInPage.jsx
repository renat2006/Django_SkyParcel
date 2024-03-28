import React, {useState} from 'react';
import axios from 'axios';
import {Card} from "baseui/card";
import {FormControl} from "baseui/form-control";
import {Input} from "baseui/input";
import {Button} from "baseui/button";
import {Notification, KIND} from "baseui/notification";
import {StyledLink} from "baseui/link";
import {useNavigate} from "react-router-dom";
import {DURATION, useSnackbar} from "baseui/snackbar";
import {Check} from "baseui/icon";
import {baseURL} from "../../services/app.service";

const LoginPage = () => {
    const [formData, setFormData] = useState({email: '', password: ''});
    const [formErrors, setFormErrors] = useState({});
    const [loginSuccess, setLoginSuccess] = useState(false);
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const navigate = useNavigate();
    const {enqueue} = useSnackbar();
    const handleSubmit = async () => {
        try {

            const response = await axios.post(`${baseURL}/auth/api/token/`, formData);
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            window.dispatchEvent(new Event('storage', {
                key: 'accessToken',
                newValue: response.data.access
            }));

            setLoginSuccess(true);
            enqueue({
                startEnhancer: ({size}) => <Check size={size}/>,
                message: 'Успешный вход в систему!',
                kind: 'positive',
                duration: DURATION.medium,
                actionMessage: 'Ок',
                actionOnClick: () => {
                },
            });
            navigate('/');
            window.location.reload();
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
                    {loginSuccess && (
                        <Notification kind={KIND.positive}>
                            Успешный вход в систему!
                        </Notification>
                    )}
                    {!loginSuccess && (
                        <>
                            <FormControl label="Email" error={formErrors.username}>
                                <Input
                                    name="email"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl label="Пароль" error={formErrors.password}>
                                <Input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <Button onClick={handleSubmit}>Вход</Button>
                            {Object.keys(formErrors).length > 0 && (
                                <Notification kind={KIND.negative}>
                                    Ошибка при входе в систему. Проверьте введенные данные.
                                </Notification>
                            )}
                            <div style={{marginTop: '10px'}}>
                                Ещё нет аккаунта? <StyledLink href="/signup">
                                Зарегистрируйтесь
                            </StyledLink>

                            </div>
                        </>
                    )}
                </Card>
            </div>
        </>
    );
};

export default LoginPage;
