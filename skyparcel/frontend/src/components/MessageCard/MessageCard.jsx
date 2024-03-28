import React, {useState} from 'react';
import {Card, StyledAction, StyledBody, StyledTitle} from "baseui/card";
import {Avatar} from "baseui/avatar";
import {HeadingSmall, LabelMedium, LabelSmall} from "baseui/typography";
import {Button, SHAPE} from "baseui/button";
import {useStyletron} from "baseui";
import {FaArrowRight} from "react-icons/fa";
import {baseURL} from "../../services/app.service";

const MessageCard = ({application, onHide}) => {
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async () => {
        setIsLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                console.error("Токен доступа отсутствует");
                return;
            }
            const response = await fetch(`${baseURL}/api/applications/update/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({application_id: application.id})
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении статуса заявки');
            }

            // Обработка успешного ответа, например, обновление состояния компонента
            console.log("Статус заявки успешно обновлен");
             onHide(application.id);
        } catch (error) {
            console.error('Ошибка: ', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <StyledTitle
                className={css({display: 'flex', gap:"10px"})}>
                <LabelMedium className={css({margin: 0})}>
                    {application.departure_city}
                </LabelMedium>
                <FaArrowRight className={css({margin: '0 10px'})}/>
                <LabelMedium className={css({margin: 0})}>
                    {application.destination_city}
                </LabelMedium>
            </StyledTitle>
            <StyledBody>
                {application.comment}
            </StyledBody>
            <StyledAction>
                <Button
                    onClick={handleStatusChange}
                    isLoading={isLoading}
                    disabled={!application.is_active}
                >
                    Нашёл отправителя
                </Button>
            </StyledAction>
        </Card>
    );
};

export default MessageCard;
