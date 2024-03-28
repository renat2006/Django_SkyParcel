import React, {useState, useEffect} from 'react';
import MessageForm from './MessageForm';
import {List, ListItem} from 'baseui/list';
import {baseURL} from "../../../services/app.service";

const ChatWindow = ({chat}) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Здесь должен быть код для загрузки сообщений чата
        // Например, запрос к вашему API
        fetch(`${baseURL}/api/chats/${chat.id}/messages`)
            .then(response => response.json())
            .then(data => setMessages(data))
            .catch(error => console.error('Error fetching messages:', error));
    }, [chat]);

    const handleSendMessage = (newMessage) => {
        // Отправить новое сообщение на сервер
        // И обновить список сообщений
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    return (
        <div>
            <List>
                {messages.map((message, index) => (
                    <ListItem key={index}>
                        {message.author}: {message.content}
                    </ListItem>
                ))}
            </List>
            <MessageForm onSendMessage={handleSendMessage}/>
        </div>
    );
};

export default ChatWindow;
