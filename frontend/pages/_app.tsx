import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";
import cookie from 'cookie';
import { useRouter } from 'next/router';
import { ToastContainer, ToastOptions, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io( "http://localhost:9000/chat", {
  auth: ( cb ) =>
  {
    cb( {
      token: typeof window !== "undefined" ? cookie.parse( document.cookie ).jwt : '',
    } );
  }
} );

export const SocketContext = React.createContext<Socket>( socket );
export const MessagesContext = React.createContext<any[]>( [ new Map(), () => { } ] );
export const ChatContext = React.createContext<any[]>( [ [], () => { } ] );
export const OnlineFriendsContext = React.createContext<any[]>( [ [], () => { } ] );
export const CurrentConvContext = React.createContext<any[]>( [ {}, () => { } ] );
export const LastBlockedContext = React.createContext<any[]>( [ null, () => { } ] );
export const NewRoomContext = React.createContext<any[]>( [ null, () => { } ] );
export const NewMemberAddedContext = React.createContext<any[]>( [ null, () => { } ] );

function MyApp ( { Component, pageProps }: AppProps )
{
  const router = useRouter();
  const [ chats, setChats ] = useState( [] );
  const [ messages, setMessages ] = useState( new Map<string, any[]>() );
  const [ onlineFriends, setOnlineFriends ] = useState( [] );
  const [ currentConv, setCurrentConv ] = useState<any>( {} );
  const [ lastBlockedId, setLastBlockedId ] = useState<any>( null );
  const [ newRoom, setNewRoom ] = useState<any>( null );
  const [ newMemberAdded, setNewMemberAdded ] = useState<any>( null );

  const toastOptions: ToastOptions<{}> = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",

  };

  useEffect( () =>
  {
    socket.on( "connect", () =>
    {
      console.log( 'CONNECT: ', socket.id );
    } );

    socket.on( "disconnect", () =>
    {
      console.log( 'DISCONNECT: ', socket.id );
    } );

    socket.on( "connect_error", () =>
    {
      toast.error( 'Websocket connection failed.', toastOptions );
      // TODO: redirect to login page.
      socket.connect();
    } );

    socket.on( "exception", ( exception ) =>
    {
      toast.error( `Error: ${ exception.error }: ${ exception.message }`, toastOptions );
    } );

    socket.on( 'chat_list', ( data: any ) =>
    {
      setChats( data );
    } );

    socket.on( 'online_friends', ( data: any ) =>
    {
      setOnlineFriends( data );
    } );

    socket.on( 'room_created', ( data: any ) =>
    {
      if ( data?.existing === false )
      {
        toast.info( `A new ${ data?.isDm === true ? "DM" : "Room" } has been created`, toastOptions );
      }
      setCurrentConv( data );
      router.push( `/settings/chat` );
    } );

    socket.on( 'room_created_notif', ( data: any ) =>
    {
      setNewRoom( data );
    } );

    socket.on( 'room_joined', ( data: any ) =>
    {
      const userId = localStorage.getItem( 'userId' );
      if ( userId !== data.roomUser.userId )
      {
        toast.info( `A new user has joined room: ${ data.chat.name }`, toastOptions );
        return;
      }
      toast.info( `You have successfully joined room: ${ data.chat.name }`, toastOptions );
      setCurrentConv( data.chat );
      router.push( `/settings/chat` );
    } );

    socket.on( 'room_left', ( data: any ) =>
    {
      setNewMemberAdded( data );
      setCurrentConv( {} );
    } );

    socket.on( 'member_added', ( data: any ) =>
    {
      toast.info( `User has been added successfully`, toastOptions );
      setNewMemberAdded( data );
    } );

    socket.on( 'message', ( data: any ) =>
    {
      const userId = localStorage.getItem( 'userId' );
      if ( userId !== data.user?.id )
      {
        toast.info( `You have a new ${ data?.roomName ? "Message" : "DM" } from ${ data?.user ? data?.user.username : "N/A" }`, toastOptions );
      }
      setMessages( ( prev ) =>
      {
        if ( prev.has( data.roomId ) )
        {
          prev.set( data.roomId, [ ...( prev.get( data.roomId ) ?? [] ), data ] );
        } else
        {
          prev.set( data.roomId, [ data ] );
        }
        return prev;
      } );

    } );

    socket.on( 'user_blocked', ( data: any ) =>
    {
      const userId = localStorage.getItem( 'userId' );
      if ( data )
      {
        setLastBlockedId( data );
        if ( userId === data )
        {
          toast.info( `User with Id: ${ data } blocked you.`, toastOptions );
        } else
        {
          toast.info( `User with Id: ${ data } was blocked.`, toastOptions );
        }
      }
    } );

  }, [] );

  return (
    <NewMemberAddedContext.Provider value={ [ newMemberAdded, setNewMemberAdded ] } >
      <NewRoomContext.Provider value={ [ newRoom, setNewRoom ] }>
        <LastBlockedContext.Provider value={ [ lastBlockedId, setLastBlockedId ] }>
          <CurrentConvContext.Provider value={ [ currentConv, setCurrentConv ] }>
            <OnlineFriendsContext.Provider value={ [ onlineFriends, setOnlineFriends ] }>
              <ChatContext.Provider value={ [ chats, setChats ] }>
                <MessagesContext.Provider value={ [ messages, setMessages ] }>
                  <SocketContext.Provider value={ socket }>
                    <Component { ...pageProps } />
                    <ToastContainer style={ { fontSize: "1.2rem" } } />
                  </SocketContext.Provider>
                </MessagesContext.Provider>
              </ChatContext.Provider>
            </OnlineFriendsContext.Provider>
          </CurrentConvContext.Provider>
        </LastBlockedContext.Provider>
      </NewRoomContext.Provider>
    </NewMemberAddedContext.Provider>
  );
}

export default MyApp
