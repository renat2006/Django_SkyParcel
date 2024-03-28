import React, {useState, useEffect} from 'react';
import {AppNavBar, setItemActive} from 'baseui/app-nav-bar';
import {Layer} from 'baseui/layer';
import {useStyletron} from "baseui";
import {Overflow} from "baseui/icon";
import {Snackbar, DURATION, useSnackbar} from 'baseui/snackbar';
import {useNavigate} from "react-router-dom";
import {baseURL} from "../../services/app.service";

export default function Header() {
    const [mainItems, setMainItems] = useState([{label: 'Главная'}, {label: 'О нас'}]);
    const [currentUser, setCurrentUser] = useState(null);

    const navigate = useNavigate();
    const {enqueue} = useSnackbar();

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            fetchUserInfo(accessToken);
        }

        const handleStorageChange = (e) => {
            if (e.key === "accessToken" && e.newValue) {
                fetchUserInfo(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    const refreshTokenIfNeeded = async () => {
        const expiryTime = localStorage.getItem("expiryTime");

        if (new Date().getTime() > expiryTime) {
            // Токен истек, отправляем запрос на обновление
            const response = await fetch(`${baseURL}/auth/api/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh: localStorage.getItem("refreshToken")
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("data")
                localStorage.setItem("accessToken", data.access);
                // Обновите время истечения срока действия accessToken
            } else {
                console.error("Ошибка обновления токена");
            }
        }
    };
    const fetchUserInfo = async (token) => {
        await refreshTokenIfNeeded()

        try {
            const response = await fetch(`${baseURL}/auth/api/user_info/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data, "sds")

                setCurrentUser(data);


            } else {
                console.error("Ошибка получения данных пользователя");
            }
        } catch (error) {
            console.error("Ошибка при запросе к API: ", error);
        }
    };

    const handleMainItemSelect = (item) => {
        setMainItems(prev => setItemActive(prev, item));
        if (item.label === 'Главная') {
            navigate('/');
        } else if (item.label === 'О нас') {
            navigate('/about')
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setCurrentUser(null);
        enqueue({
            message: 'Вы успешно вышли из аккаунта',
            startEnhancer: () => "👋",
            duration: DURATION.medium
        });
        navigate('/login');
    };
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "accessToken" && e.newValue) {
                fetchUserInfo(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const userItems = currentUser ? [
        {icon: Overflow, label: 'Создать заявку', onClick: () => navigate('/application_add')},
        {icon: Overflow, label: 'Профиль', onClick: () => navigate('/profile')},
        {icon: Overflow, label: 'Выход', onClick: handleLogout}
    ] : [
        {icon: Overflow, label: 'Вход', onClick: () => navigate('/login')},
        {icon: Overflow, label: 'Регистрация', onClick: () => navigate('/signup')}
    ];

    return (
        <>

            <Layer>
                <div style={{width: '100%', position: 'fixed', top: 0, left: 0}}>
                    <AppNavBar
                        title="SkyParcel"
                        mainItems={mainItems}
                        username={currentUser ? currentUser.username : "Гость"}
                        userItems={userItems}
                        onMainItemSelect={handleMainItemSelect}
                        onUserItemSelect={(item) => {
                            if (item.onClick) {
                                item.onClick();
                            }
                        }}
                        usernameSubtitle="5.0"
                        userImgUrl={currentUser ? `${currentUser.image}` : ""}
                    />
                </div>
            </Layer>
        </>
    );
}
