import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import {baseURL} from "../../../services/app.service";

const ChatApp = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  useEffect(() => {
    // Загрузить список чатов
    // Это может быть запрос к API для получения чатов пользователя
    fetch(`${baseURL}/api/chats`)
      .then(response => response.json())
      .then(data => setChats(data))
      .catch(error => console.error('Error fetching chats:', error));
  }, []);

  const handleChatSelect = (chatId) => {
    // Найти выбранный чат по его ID
    const selectedChat = chats.find(chat => chat.id === chatId);
    setCurrentChat(selectedChat);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '300px', marginRight: '20px' }}>
        <ChatList chats={chats} onChatSelect={handleChatSelect} />
      </div>
      <div style={{ flex: 1 }}>
        {currentChat ? <ChatWindow chat={currentChat} /> : <div>Выберите чат</div>}
      </div>
    </div>
  );
};

export default ChatApp;
