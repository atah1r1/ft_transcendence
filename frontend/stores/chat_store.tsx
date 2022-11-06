import type { AppProps } from 'next/app'
import React, { useState } from 'react';

const initialChats: any[] = [];

export const ChatContext = React.createContext(initialChats);

const ChatStore = ({ children }: any) => {
    const [chats, setChats] = useState([]);

    return (
        <ChatContext.Provider value={[chats, setChats]}>{children}</ChatContext.Provider>
        );
};

export default ChatStore;