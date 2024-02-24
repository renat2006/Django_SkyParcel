import React, { useState, useEffect } from 'react';

const Chat = ({ chatId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    // Подключение к WebSocket
    useEffect(() => {
        const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/api/chat/${chatId}/`);
        setSocket(newSocket);

        return () => newSocket.close();
    }, [chatId]);

    // Обработка входящих сообщений
    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, messageData.message]);
        };

        return () => {
            socket.onmessage = null;
        };
    }, [socket]);

    // Отправка сообщения
    const sendMessage = () => {
        if (socket && newMessage) {
            socket.send(JSON.stringify({ message: newMessage }));
            setNewMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
            />
            <button onClick={sendMessage}>Отправить</button>
        </div>
    );
};

export default Chat;
