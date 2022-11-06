import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";
import cookie from 'cookie';
import ChatStore, { ChatContext } from "../stores/chat_store";

// type User = {
//   avatar: string;
//   createdAt: string;
//   first_name: string;
//   id: string;
//   last_name: string;
//   two_factor_auth: boolean;
//   updateAt: string;
//   username: string;
// }

// type GlobalContent = {
//   data: User;
//   loader: boolean;
//   statusCode: number;
// }

const socket = io("http://localhost:9000/chat", {
  auth: (cb) => {
    cb({
      token: typeof window !== "undefined" ? cookie.parse(document.cookie).jwt : '',
    });
  }
});

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

export const SocketContext = React.createContext<Socket>(socket);

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <SocketContext.Provider value={socket}>
      <ChatStore>
        <InitialComponent Component={Component} pageProps={pageProps} router={router} />
      </ChatStore>
    </SocketContext.Provider>
  );
}

function InitialComponent({ Component, pageProps }: AppProps) {
  const [chats, setChats] = useContext(ChatContext);

  useEffect(() => {
    console.log("CHAT LIST SUBSRCIBED");
    socket!.on('chat_list', (data: any) => {
      console.log('chat_list: ', data);
      setChats(data);
    });
  }, []);

  return (<Component {...pageProps} />);
}

export default MyApp
