import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";
import cookie from 'cookie';

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

// export const UserContext = React.createContext<GlobalContent | undefined>(undefined);
export const SocketContext = React.createContext<Socket | undefined>(undefined);

export const SocketProvider = (props: { children: React.ReactNode }) => {
  // const [loader, setLoader] = useState(true);
  // const [statusCode, setStatusCode] = useState(401);

  // const [data, setData] = useState(
  //   {
  //     avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
  //     createdAt: "",
  //     first_name: "",
  //     id: "",
  //     last_name: "",
  //     two_factor_auth: false,
  //     updateAt: "",
  //     username: "",
  //   }
  // );

  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`,
  //       {
  //         withCredentials: true,
  //       }
  //     );
  //     setData(response.data);
  //   } catch (error: any) {
  //     console.error(error);
  //     setStatusCode(error.response.status);
  //   }
  //   finally {
  //     setLoader(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  return <SocketContext.Provider value={socket}>{props.children}</SocketContext.Provider>
}

function MyApp({ Component, pageProps }: AppProps) {
  return <SocketProvider>
    return <Component {...pageProps} />
  </SocketProvider>
}

export default MyApp
