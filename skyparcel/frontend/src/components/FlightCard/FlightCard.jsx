import * as React from 'react';
import {Card, StyledBody, StyledTitle} from 'baseui/card';
import {Block} from 'baseui/block';
import {ProgressBar} from 'baseui/progress-bar';
import {useStyletron} from 'baseui';
import {FaPlaneDeparture, FaPlaneArrival, FaMessage} from 'react-icons/fa6';
import {HeadingSmall} from "baseui/typography";
import {Avatar} from "baseui/avatar";
import {Button, SHAPE} from "baseui/button";
import PropTypes from "prop-types";
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader} from "baseui/modal";
import {useState} from "react";
import {StyledLink} from "baseui/link";


const FlightCard = ({
                        departureTime,
                        flightDuration,
                        arrivalTime,
                        departureCity,
                        departureCode,
                        arrivalCity,
                        arrivalCode,
                        departureDate,
                        arrivalDate,
                        user,
                        contactPhone,
                        comment
                    }) => {

    const [css, theme] = useStyletron();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const cardOverrides = {
        Root: {
            style: {

                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '16px',
            },
        },
    };

    const progressBarStyle = css({
        marginTop: '16px',
        marginBottom: '16px',
        height: '8px',
    });

    const iconStyle = css({
        fontSize: '20px',
    });

    const timeStyle = css({
        fontSize: '20px',
        fontWeight: 'bold',
    });
    const basicFontStyle =
        css({
            fontSize: '14px',


        });
    console.log(user)
    return (
        <Card overrides={cardOverrides}>
            <StyledTitle className={css({display: 'flex', justifyContent: "space-between"})}>
                <div className={css({display: 'flex', gap: "10px", alignItems: 'center'})}>
                    <Avatar
                        overrides={{
                            Avatar: {
                                style: ({$theme}) => ({
                                    borderTopLeftRadius: $theme.borders.radius100,
                                    borderTopRightRadius: $theme.borders.radius100,
                                    borderBottomRightRadius: $theme.borders.radius100,
                                    borderBottomLeftRadius: $theme.borders.radius100,
                                }),
                            },
                            Root: {
                                style: ({$theme}) => ({
                                    borderTopLeftRadius: $theme.borders.radius100,
                                    borderTopRightRadius: $theme.borders.radius100,
                                    borderBottomRightRadius: $theme.borders.radius100,
                                    borderBottomLeftRadius: $theme.borders.radius100,
                                }),
                            },
                        }}
                        name={user.userName}
                        size="scale1000"
                        src={user ? user.image : ""}
                    />
                    <HeadingSmall className={css({margin: 0})}>{user.userName}</HeadingSmall>
                </div>
                <Button shape={SHAPE.square} onClick={openModal}>
                    <FaMessage/>
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
            </StyledTitle>
            <StyledBody>
                <Block display="flex" justifyContent="space-between" alignItems="center">
                    <Block display="flex" flexDirection="column" alignItems="center">

                        <div className={timeStyle}>{departureTime}</div>
                        <div className={basicFontStyle}>{departureCity}</div>

                        <div className={basicFontStyle}>{departureDate}</div>
                    </Block>

                    <Block flex="1" marginLeft="16px" marginRight="16px">
                        <div style={{textAlign: 'center', display: "flex", justifyContent: "space-between"}}>
                            <div><FaPlaneDeparture className={iconStyle}/></div>
                            <div><FaPlaneArrival className={iconStyle}/></div>

                        </div>
                        <ProgressBar className={progressBarStyle} value={0} successValue={100} overrides={{
                            BarContainer: {style: {marginLeft: 0, marginRight: 0}},
                            BarProgress: {
                                style: {
                                    backgroundColor: theme.colors.primary,
                                    borderTopLeftRadius: '4px',
                                    borderTopRightRadius: '4px',
                                },
                            },
                        }}/>
                        <div style={{textAlign: 'center', display: "flex", justifyContent: "space-between"}}>
                            <div className={basicFontStyle}>{departureCode}</div>
                            <div className={basicFontStyle}>{flightDuration}</div>
                            <div className={basicFontStyle}>{arrivalCode}</div>
                        </div>

                    </Block>

                    <Block display="flex" flexDirection="column" alignItems="center">

                        <div className={timeStyle}>{arrivalTime}</div>
                        <div className={basicFontStyle}>{arrivalCity}</div>

                        <div className={basicFontStyle}>{arrivalDate}</div>
                    </Block>
                </Block>
            </StyledBody>
        </Card>
    );
};

FlightCard.propTypes = {
    departureTime: PropTypes.string.isRequired,
    flightDuration: PropTypes.string.isRequired,
    arrivalTime: PropTypes.string.isRequired,
    departureCity: PropTypes.string.isRequired,
    departureCode: PropTypes.string.isRequired,
    arrivalCity: PropTypes.string.isRequired,
    arrivalCode: PropTypes.string.isRequired,
    departureDate: PropTypes.string.isRequired,
    arrivalDate: PropTypes.string.isRequired,
    user: PropTypes.shape({
        userName: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired
    }).isRequired
};
export default FlightCard;
