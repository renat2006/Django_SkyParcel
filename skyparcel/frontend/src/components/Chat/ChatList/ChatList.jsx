import React from 'react';
import { List, ListItem } from 'baseui/list';

const ChatList = ({ chats, onChatSelect }) => {
  return (
    <List>
      {chats.map(chat => (
        <ListItem
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          endEnhancer={() => <span>Последнее сообщение: {chat.lastMessage}</span>}
        >
          {chat.name}
        </ListItem>
      ))}
    </List>
  );
};

export default ChatList;
