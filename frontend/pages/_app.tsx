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
export const UserStatusContext = React.createContext<any[]>( [ null, () => { } ] );

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
  const [ status, setStatus ] = useState<any>( null );

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
      console.log( 'connect_error: ', socket.id );
      toast.error( 'Websocket connection failed.', toastOptions );
      // TODO: redirect to login page.
      socket.connect();
    } );

    socket.on( "exception", ( exception ) =>
    {
      console.log( 'exception: ', socket.id );
      toast.error( `Error: ${ exception.error }: ${ exception.message }`, toastOptions );
    } );

    socket.on( 'chat_list', ( data: any ) =>
    {
      console.log( 'chat_list: ', socket.id );
      setChats( data );
    } );

    socket.on( 'online_friends', ( data: any ) =>
    {
      console.log( 'online_friends: ', socket.id );
      setOnlineFriends( data );
    } );

    socket.on( 'room_created', ( data: any ) =>
    {
      console.log( 'room_created: ', socket.id );
      if ( data?.existing === false )
      {
        toast.info( `A new ${ data?.isDm === true ? "DM" : "Room" } has been created`, toastOptions );
      }
      setCurrentConv( data );
      router.push( `/settings/chat` );
    } );

    socket.on( 'room_created_notif', ( data: any ) =>
    {
      console.log( 'room_created_notif: ', socket.id );
      setNewRoom( data );
    } );

    socket.on( 'room_joined', ( data: any ) =>
    {
      console.log( 'room_joined: ', socket.id );
      const userId = localStorage.getItem( 'userId' );
      if ( userId !== data.roomUser.userId )
      {
        toast.info( `A new user has joined room: ${ data.chat.name }`, toastOptions );
      } else
      {
        toast.info( `You have successfully joined room: ${ data.chat.name }`, toastOptions );
        setCurrentConv( data.chat );
        router.push( `/settings/chat` );
      }
      setNewMemberAdded( data.roomUser );
    } );

    socket.on( 'room_left', ( data: any ) =>
    {
      console.log( 'room_left: ', socket.id );
      const userId = localStorage.getItem( 'userId' );
      if ( userId === data.userId )
      {
        setCurrentConv( {} );
      }
      setNewMemberAdded( data );
    } );

    socket.on( 'member_added', ( data: any ) =>
    {
      console.log( 'member_added: ', socket.id );
      toast.info( `User has been added successfully`, toastOptions );
      setNewMemberAdded( data );
    } );

    socket.on( 'admin_made', ( data: any ) =>
    {
      console.log( 'admin_made: ', socket.id );
      const userId = localStorage.getItem( 'userId' );
      if ( userId === data.userId )
        toast.info( `You have been made an admin`, toastOptions );
      setNewMemberAdded( data );
    } );

    socket.on( 'member_status_changed', ( data: any ) =>
    {
      console.log( 'member_status_changed: ', socket.id );
      const userId = localStorage.getItem( 'userId' );
      if ( userId === data.userId && data.status === 'BANNED' )
      {
        setCurrentConv( ( prev: any ) =>
        {
          if ( data.roomId === prev?.roomId )
          {
            console.log( "DOOOONE" );
            return {};
          }
          console.log( "NOT DOOOONE" );
          return prev;
        } );
      }
      setStatus( data );
    } );

    socket.on( 'message', ( data: any ) =>
    {
      console.log( 'message: ', socket.id );
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
      console.log( 'user_blocked: ', socket.id );
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
    <UserStatusContext.Provider value={ [ status, setStatus ] } >
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
    </UserStatusContext.Provider>
  );
}

export default MyApp
