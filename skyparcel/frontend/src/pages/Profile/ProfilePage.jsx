import React, {useState, useEffect} from 'react';
import {Button, SHAPE} from 'baseui/button';
import {Card, StyledAction, StyledBody, StyledTitle} from 'baseui/card';
import {FormControl} from 'baseui/form-control';
import {Input} from 'baseui/input';
import Header from "../../components/Header/Header";
import {KIND, Notification} from "baseui/notification";
import {NumberedStep, ProgressSteps} from "baseui/progress-steps";
import {FlexGrid, FlexGridItem} from "baseui/flex-grid";
import {Avatar} from "baseui/avatar";
import {HeadingSmall} from "baseui/typography";
import {FaMessage} from "react-icons/fa6";
import {useStyletron} from "baseui";
import MessageCard from "../../components/MessageCard/MessageCard";
import ReactCrop from 'react-image-crop';
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader} from "baseui/modal";
import {FileUploader} from "baseui/file-uploader";
import {baseURL} from "../../services/app.service";


function UserProfilePage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({firstName: '', lastName: '', email: ''});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [errorMessage, setErrorMessage] = React.useState(
        ""
    );
    const [passportImages, setPassportImages] = useState([]);
    const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
    const fetchUserInfo = async (token = '') => {
        try {
            const response = await fetch(`${baseURL}/auth/api/user_info/`, {
                headers: token ? {Authorization: `Bearer ${token}`} : {}
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setCurrentUser(data);
                setFormData({firstName: data.first_name, lastName: data.last_name, email: data.email});
            } else {
                console.error("Ошибка получения данных пользователя");
            }
        } catch (error) {
            console.error("Ошибка при запросе к API: ", error);
        }
    };
    const handlePassportImageUpload = (event) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const fileReaders = files.map(file => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                return reader;
            });

            Promise.all(fileReaders.map(reader => new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
            }))).then(images => setPassportImages(images));
        }
    };
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            setIsAuthenticated(true);
            fetchUserInfo(accessToken);
        } else {
            // Если пользователь не аутентифицирован, загрузите общедоступные данные пользователя
            fetchUserInfo();
        }
    }, []);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const handleImageUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result); // Установить предпросмотр изображения
            };
            reader.readAsDataURL(event.target.files[0]); // Читаем файл
            reader.onerror = (error) => {
                console.error('Ошибка при чтении файла: ', error);
            };
        }
    };


    const uploadImage = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("Токен доступа отсутствует");
            return;
        }
        if (!imagePreview) {
            setErrorMessage("Нет изображения для отправки");
            return;
        }

        try {
            const blob = await fetch(imagePreview).then(r => r.blob());
            const formData = new FormData();
            formData.append('file', blob, 'avatar.jpg');

            const response = await fetch(`${baseURL}/auth/api/upload-profile-image/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке изображения');
            }

            const data = await response.json();
            setCurrentUser(prevState => ({
                ...prevState,
                image: data.newAvatarUrl // Обновляем URL аватара
            }));
            console.log("Изображение успешно загружено", currentUser);

        } catch (error) {
            console.error("Ошибка при запросе к API: ", error);
            setErrorMessage(error.message || "Ошибка при загрузке изображения");
        }

        setIsModalOpen(false);
    };
    const uploadPassportImages = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("Токен доступа отсутствует");
            return;
        }

        try {
            const formData = new FormData();
            for (let i = 0; i < passportImages.length; i++) {
                const imagePreview = passportImages[i];
                const blob = await fetch(imagePreview).then(r => r.blob());

                const filename = `passport_image_${i}.jpg`;

                formData.append('file', blob, filename);


            }
            console.log(formData)
            const response = await fetch(`${baseURL}/auth/api/upload-passport-images/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке изображения');
            }

            if (response.ok) {
                const updatedUser = await response.json();
                setCurrentUser(updatedUser);
            }
            setIsPassportModalOpen(false);  // Закрыть модальное окно после загрузки всех изображений
        } catch (error) {
            console.error("Ошибка при загрузке изображений: ", error);
            setErrorMessage(error.message || "Ошибка при загрузке изображений");
        }
    };

    const handleEditClick = () => {
        if (isAuthenticated) {
            setEditMode(true);
        } else {
            alert("Только аутентифицированные пользователи могут редактировать профиль.");
        }
    };


    const getPassportVerificationStep = () => {

        switch (currentUser?.passport_status) {
            case 'pending':
                return 1; // "Отправлен на проверку"
            case 'verified':
                return 2; // "Проверен"
            case 'rejected':
                return 2; // "Проверен"
            default:
                return 0; // "Паспорт не подтвержден"
        }
    };
    const getColumnCount = () => {
        if (windowWidth < 750) return 1;

        return 2;
    };
    const getCardCount = () => {

        if (windowWidth < 1200) return 1;

        return 2;
    };
    const [css, theme] = useStyletron();
    const [messageCards, setMessageCards] = useState([{
        "lastMessage": {"author": "Maks", "date": "12.11.23"}, "interlocutor": {
            "name": "Renat"
        },
    }, {
        "lastMessage": {"author": "Dave", "date": "13.11.23"}, "interlocutor": {
            "name": "Dave"
        },
    }, {
        "lastMessage": {"author": "Dave", "date": "13.11.23"}, "interlocutor": {
            "name": "Dave"
        },
    }, {
        "lastMessage": {"author": "Dave", "date": "13.11.23"}, "interlocutor": {
            "name": "Dave"
        },
    }]);
    const [userApplications, setUserApplications] = useState([]);
    const [hiddenApplications, setHiddenApplications] = useState([]);
    const handleHideApplication = (id) => {
        setHiddenApplications([...hiddenApplications, id]);
    };
    useEffect(() => {
        const fetchUserApplications = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                console.error("Токен доступа отсутствует");
                return;
            }

            const response = await fetch(`${baseURL}/api/user_applications/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,

                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserApplications(data);
            } else {
                // Обработка ошибки
            }
        };

        fetchUserApplications();
    }, []);
    const renderMessageCards = () => {
    const hasActiveApplications = userApplications.some(application => !hiddenApplications.includes(application.id) && application.is_active);

    if (!hasActiveApplications) {
        return <p>Нет активных заявок</p>;
    }

    return userApplications.map((application, index) => (
        !hiddenApplications.includes(application.id) && (
            <FlexGridItem key={index}>
                <MessageCard application={application} onHide={handleHideApplication} />
            </FlexGridItem>
        )
    ));
};


    return (<>

            <div className="main__content">
                {currentUser ? (
                    <>
                        <Modal onClose={() => setIsPassportModalOpen(false)} isOpen={isPassportModalOpen}>
                            <ModalHeader>Загрузите фото паспорта и селфи с ним</ModalHeader>
                            <ModalBody>
                                <FileUploader
                                    accept="image/*"
                                    onDrop={(acceptedFiles, rejectedFiles) => {
                                        if (rejectedFiles && rejectedFiles.length > 0) {
                                            setErrorMessage('Некоторые файлы были отклонены');
                                        }

                                        // Обработка принятых файлов
                                        const imagePreviews = acceptedFiles.map(file => URL.createObjectURL(file));
                                        setPassportImages(imagePreviews);
                                        setErrorMessage('');
                                    }}
                                    errorMessage={errorMessage}
                                />

                                <div
                                    className={css({
                                        display: "flex",
                                        gap: "10px",
                                        marginTop: "10px",
                                        flexWrap: "wrap"
                                    })}>
                                    {passportImages.map((image, index) => (
                                        <img key={index} src={image} alt="Passport Preview"
                                             style={{width: '100px', height: '100px'}}/>
                                    ))}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <ModalButton onClick={() => setIsPassportModalOpen(false)}>Отмена</ModalButton>
                                <ModalButton onClick={uploadPassportImages}>Загрузить</ModalButton>
                            </ModalFooter>
                        </Modal>
                        <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
                            <ModalHeader>Загрузите новый аватар</ModalHeader>
                            <ModalBody>
                                <FileUploader
                                    accept="image/*"
                                    onDrop={(acceptedFiles, rejectedFiles) => {
                                        // Обработка выбранного файла
                                        const file = acceptedFiles[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImagePreview(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }

                                        // Если есть ошибки, устанавливаем сообщение об ошибке
                                        if (rejectedFiles.length > 0) {
                                            setErrorMessage('Ошибка загрузки файла');
                                        }
                                    }}
                                    errorMessage={errorMessage}
                                />

                                {imagePreview && (
                                    <div className={css({marginTop: "20px"})}>
                                        <Avatar
                                            name={currentUser.first_name + ' ' + currentUser.last_name}
                                            src={imagePreview}
                                            overrides={{
                                                Root: {
                                                    style: () => ({
                                                        width: "200px",
                                                        height: "200px"
                                                    })
                                                },
                                                Avatar: {
                                                    style: () => ({
                                                        width: "200px",
                                                        height: "200px"
                                                    })
                                                },

                                            }}

                                        /></div>
                                )}

                            </ModalBody>
                            <ModalFooter>
                                <ModalButton onClick={() => setIsModalOpen(false)}>Отмена</ModalButton>
                                <ModalButton onClick={() => uploadImage()}>Сохранить</ModalButton>
                            </ModalFooter>
                        </Modal>
                        <FlexGrid
                            flexGridColumnCount={getCardCount()}
                            flexGridColumnGap="scale800"
                            flexGridRowGap="scale800"


                        >
                            <FlexGridItem>
                                <Card style={{height: "100%"}}>
                                    <StyledBody>
                                        <FlexGrid
                                            flexGridColumnCount={getColumnCount()}
                                            flexGridColumnGap="scale800"
                                            flexGridRowGap="scale800"
                                            style={{marginLeft: "20px"}}

                                        >
                                            <FlexGridItem style={{marginTop: "10px"}}>
                                                <div onClick={() => setIsModalOpen(true)}
                                                     style={{cursor: 'pointer', transition: "0.3s"}}
                                                     onMouseOver={(e) => e.currentTarget.style.opacity = 0.7}
                                                     onMouseOut={(e) => e.currentTarget.style.opacity = 1}>
                                                    <Avatar
                                                        name={currentUser.first_name + ' ' + currentUser.last_name}
                                                        src={`${currentUser.image}`}
                                                        size="scale1400"

                                                    />
                                                </div>

                                                <h2>Профиль пользователя</h2>
                                                {/*{!editMode ? (*/}
                                                <>
                                                    <p>Имя: {currentUser.first_name}</p>
                                                    <p>Фамилия: {currentUser.last_name}</p>
                                                    <p>Email: {currentUser.email}</p>
                                                    <Button disabled={currentUser?.passport_status === 'pending'}
                                                            onClick={() => setIsPassportModalOpen(true)}>Отправить фото
                                                        паспорта</Button>
                                                </>
                                                {/*) : (*/}
                                                {/*    <>*/}
                                                {/*        <FormControl label="Имя">*/}
                                                {/*            <Input*/}
                                                {/*                value={formData.firstName}*/}
                                                {/*                onChange={e => setFormData({*/}
                                                {/*                    ...formData,*/}
                                                {/*                    firstName: e.target.value*/}
                                                {/*                })}*/}
                                                {/*            />*/}
                                                {/*        </FormControl>*/}
                                                {/*        <FormControl label="Фамилия">*/}
                                                {/*            <Input*/}
                                                {/*                value={formData.lastName}*/}
                                                {/*                onChange={e => setFormData({*/}
                                                {/*                    ...formData,*/}
                                                {/*                    lastName: e.target.value*/}
                                                {/*                })}*/}
                                                {/*            />*/}
                                                {/*        </FormControl>*/}
                                                {/*        <FormControl label="Email">*/}
                                                {/*            <Input*/}
                                                {/*                value={formData.email}*/}
                                                {/*                onChange={e => setFormData({*/}
                                                {/*                    ...formData,*/}
                                                {/*                    email: e.target.value*/}
                                                {/*                })}*/}
                                                {/*            />*/}
                                                {/*        </FormControl>*/}
                                                {/*        <Button onClick={handleSaveClick}>Сохранить изменения</Button>*/}
                                                {/*    </>*/}
                                                {/*)}*/}
                                            </FlexGridItem>
                                            <FlexGridItem>
                                                <h3>Статус подтверждения паспорта</h3>
                                                <ProgressSteps current={getPassportVerificationStep()}>
                                                    <NumberedStep title="Отправьте паспорт на проверку">
                                                        Паспорт не подтверждён
                                                    </NumberedStep>
                                                    <NumberedStep title="Отправлен на проверку">
                                                        Ваш паспорт отправлен на проверку
                                                    </NumberedStep>
                                                    <NumberedStep title="Проверен">
                                                        {currentUser?.passport_status === 'verified' ? (
                                                            <div className={css({
                                                                color: theme.colors.positive400,
                                                                fontWeight: 'bold',
                                                            })}>Ваш паспорт проверен и
                                                                подтвержден</div>
                                                        ) : (
                                                            <div className={css({
                                                                color: theme.colors.negative400,
                                                                fontWeight: 'bold',
                                                            })}>Ваш паспорт проверен и
                                                                отклонен. Загрузите действительные данные и отправьте
                                                                ещё раз</div>
                                                        )}
                                                    </NumberedStep>
                                                </ProgressSteps>
                                            </FlexGridItem>
                                        </FlexGrid>
                                    </StyledBody>
                                </Card>
                            </FlexGridItem>
                            <FlexGridItem>
                                <Card style={{
                                    height: "100%"
                                }}>
                                    <StyledBody className={css({
                                        maxHeight: '400px',
                                        overflow: 'auto',
                                        scrollbarWidth: 'thin',


                                        '::-webkit-scrollbar': {

                                            width: '4px',

                                        },
                                        '::-webkit-scrollbar-thumb': {

                                            backgroundColor: 'rgba(123,123,123,0.5)',
                                            borderRadius: "5px"
                                        },

                                        '::-webkit-scrollbar-track': {
                                            backgroundColor: 'transparent',
                                            borderRadius: "5px"
                                        },

                                    })}>
                                        <FlexGrid

                                            flexGridColumnGap="scale800"
                                            flexGridRowGap="scale800"
                                            style={{
                                                flexDirection: "column",
                                                marginRight: "2px"
                                            }}

                                        >
                                            {renderMessageCards()}
                                        </FlexGrid>
                                    </StyledBody>
                                </Card>
                            </FlexGridItem>
                        </FlexGrid>
                    </>) : (
                    <p>Пользователь не найден</p>
                )}
            </div>
        </>
    );
}

export default UserProfilePage;
