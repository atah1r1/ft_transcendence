import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";
import cookie from 'cookie';
// import ChatStore, { ChatContext } from "../stores/chat_store";

const socket = io("http://localhost:9000/chat", {
  auth: (cb) => {
    cb({
      token: typeof window !== "undefined" ? cookie.parse(document.cookie).jwt : '',
    });
  }
});

export const SocketContext = React.createContext<Socket>(socket);
export const MessagesContext = React.createContext<any[]>([new Map(), () => { }]);
export const ChatContext = React.createContext<any[]>([[], () => { }]);
export const OnlineFriendsContext = React.createContext<any[]>([[], () => { }]);

function MyApp({ Component, pageProps }: AppProps) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState(new Map<string, any[]>());
  const [onlineFriends, setOnlineFriends] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log('CONNECT: ', socket.id);
    });

    socket.on("disconnect", () => {
      console.log('DISCONNECT: ', socket.id);
    });

    socket.on("connect_error", () => {
      console.log('CONNECT_ERROR: ', socket.id);
      socket.connect();
    });

    socket.on("exception", (exception) => {
      console.log('exception: ', exception);
    });

    socket!.on('chat_list', (data: any) => {
      console.log('chat_list: ', data);
      setChats(data);
    });

    socket!.on('online_friends', (data: any) => {
      console.log('online_friends: ', data);
      setOnlineFriends(data);
    });

    socket!.on('message', (data: any) => {
      setMessages((prev) => {
        if (prev.has(data.roomId)) {
          prev.set(data.roomId, [...(prev.get(data.roomId) ?? []), data]);
        } else {
          prev.set(data.roomId, [data]);
        }
        return prev;
      });
    });

  }, []);

  return (
    <OnlineFriendsContext.Provider value={[onlineFriends, setOnlineFriends]}>
      <ChatContext.Provider value={[chats, setChats]}>
        <MessagesContext.Provider value={[messages, setMessages]}>
          <SocketContext.Provider value={socket}>
            <Component {...pageProps} />
          </SocketContext.Provider>
        </MessagesContext.Provider>
      </ChatContext.Provider>
    </OnlineFriendsContext.Provider>
  );
}

export default MyApp
