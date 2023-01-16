import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import cookie from "cookie";
import { useRouter } from "next/router";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Modal from "../components/modal_dialog";
import styles_r_w from "../styles/chatroom_window.module.css";

export enum GameStatus
{
  ACCEPTED,
  DECLINED,
  CANCELLED,
  QUEUED,
  STARTED,
  FINISHED,
}

export enum PlayerStatus
{
  PENDING,
  READY,
}

const socket = io( `http://localhost:9000/chat`, {
  auth: ( cb ) =>
  {
    cb( {
      token:
        typeof window !== "undefined" ? cookie.parse( document.cookie ).jwt : "",
    } );
  },
} );

const gameSocket = io( `http://localhost:9000/game`, {
  auth: ( cb ) =>
  {
    cb( {
      token:
        typeof window !== "undefined" ? cookie.parse( document.cookie ).jwt : "",
    } );
  },
} );

export const SocketContext = React.createContext<Socket>( socket );
export const GameSocketContext = React.createContext<Socket>( gameSocket );
export const GameDataContext = React.createContext<any[]>( [ null, () => { } ] );

export const DataContext = React.createContext<any[]>( [ {}, () => { } ] );
export const ChatContext = React.createContext<any[]>( [ [], () => { } ] );
export const OnlineFriendsContext = React.createContext<any[]>( [ [], () => { } ] );
export const CurrentConvContext = React.createContext<any[]>( [ {}, () => { } ] );
export const LastBlockedContext = React.createContext<any[]>( [ null, () => { } ] );
export const NewRoomContext = React.createContext<any[]>( [ null, () => { } ] );
export const UserStatusContext = React.createContext<any[]>( [ null, () => { } ] );
export const NewMemberAddedContext = React.createContext<any[]>( [
  null,
  () => { },
] );
export const MessagesContext = React.createContext<any[]>( [
  new Map(),
  () => { },
] );
export const GameRequestUserContext = React.createContext<any[]>( [
  null,
  () => { },
] );

function MyApp ( { Component, pageProps }: AppProps )
{
  const router = useRouter();
  const [ data, setData ] = useState<any>( {
    two_factor_auth: false,
    two_factor_auth_uri: "",
  } );
  const [ chats, setChats ] = useState( [] );
  const [ messages, setMessages ] = useState( new Map<string, any[]>() );
  const [ onlineFriends, setOnlineFriends ] = useState( [] );
  const [ currentConv, setCurrentConv ] = useState<any>( {} );
  const [ lastBlockedId, setLastBlockedId ] = useState<any>( null );
  const [ newRoom, setNewRoom ] = useState<any>( null );
  const [ newMemberAdded, setNewMemberAdded ] = useState<any>( null );
  const [ status, setStatus ] = useState<any>( null );
  const [ game, setGame ] = useState<any>( null );
  const [ gameRequestUser, setGameRequestUser ] = useState<any>( null );

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
      console.log( "CONNECT: ", socket.id );
    } );

    socket.on( "disconnect", () =>
    {
      console.log( "DISCONNECT: ", socket.id );
    } );

    socket.on( "connect_error", () =>
    {
      console.log( "connect_error: ", socket.id );
      toast.error( "Websocket connection failed.", toastOptions );
      // TODO: redirect to login page.
      socket.connect();
    } );

    socket.on( "exception", ( exception ) =>
    {
      console.log( "exception: ", socket.id );
      toast.error(
        `Error: ${ exception.error }: ${ exception.message }`,
        toastOptions
      );
    } );

    socket.on( "chat_list", ( data: any ) =>
    {
      console.log( "chat_list: ", socket.id );
      setChats( data );
    } );

    socket.on( "online_friends", ( data: any ) =>
    {
      console.log( "online_friends: ", socket.id );
      setOnlineFriends( data );
    } );

    socket.on( "room_created", ( data: any ) =>
    {
      console.log( "room_created: ", socket.id );
      if ( data?.existing === false )
      {
        toast.info(
          `A new ${ data?.isDm === true ? "DM" : "Room" } has been created`,
          toastOptions
        );
      }
      setCurrentConv( data );
      router.push( `/chat` );
    } );

    socket.on( "room_created_notif", ( data: any ) =>
    {
      console.log( "room_created_notif: ", socket.id );
      setNewRoom( data );
    } );

    socket.on( "room_joined", ( data: any ) =>
    {
      console.log( "room_joined: ", socket.id );
      const userId = localStorage.getItem( "userId" );
      if ( userId !== data.roomUser.userId )
      {
        toast.info(
          `A new user has joined room: ${ data.chat.name }`,
          toastOptions
        );
      } else
      {
        toast.info(
          `You have successfully joined room: ${ data.chat.name }`,
          toastOptions
        );
        setCurrentConv( data.chat );
        router.push( `/chat` );
      }
      setNewMemberAdded( data.roomUser );
    } );

    socket.on( "room_left", ( data: any ) =>
    {
      console.log( "room_left: ", socket.id );
      const userId = localStorage.getItem( "userId" );
      if ( userId === data.userId )
      {
        setCurrentConv( {} );
      }
      setNewMemberAdded( data );
    } );

    socket.on( "room_protected", ( data: any ) =>
    {
      console.log( "room_protected: ", socket.id );
      console.log( "data: ", data );
      const userId = localStorage.getItem( "userId" );
      toast.info(
        `You have successfully protected this room: ${ data.name }`,
        toastOptions
      );
      setCurrentConv( data );
    } );

    socket.on( "member_added", ( data: any ) =>
    {
      console.log( "member_added: ", socket.id );
      toast.info( `User has been added successfully`, toastOptions );
      setNewMemberAdded( data );
    } );

    socket.on( "admin_made", ( data: any ) =>
    {
      console.log( "admin_made: ", socket.id );
      const userId = localStorage.getItem( "userId" );
      if ( userId === data.userId )
        toast.info( `You have been made an admin`, toastOptions );
      setNewMemberAdded( data );
    } );

    socket.on( "member_status_changed", ( data: any ) =>
    {
      console.log( "member_status_changed: ", socket.id );
      const userId = localStorage.getItem( "userId" );
      if ( userId === data.userId && data.status === "BANNED" )
      {
        setCurrentConv( ( prev: any ) =>
        {
          if ( data.roomId === prev?.roomId )
          {
            return {};
          }
          return prev;
        } );
      }
      setStatus( data );
    } );

    socket.on( "message", ( data: any ) =>
    {
      console.log( "message: ", socket.id );
      const userId = localStorage.getItem( "userId" );
      if ( userId !== data.user?.id )
      {
        toast.info(
          `You have a new ${ data?.roomName ? "Message" : "DM" } from ${ data?.user ? data?.user.username : "N/A"
          }`,
          toastOptions
        );
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

    socket.on( "user_blocked", ( data: any ) =>
    {
      console.log( "user_blocked: ", socket.id );
      const userId = localStorage.getItem( "userId" );
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

    gameSocket.on( "exception", ( exception ) =>
    {
      console.log( "exception: ", socket.id );
      toast.error(
        `Error: ${ exception.error }: ${ exception.message }`,
        toastOptions
      );
    } );

    gameSocket.on( "emit_play_against_request", ( user: any ) =>
    {
      console.log( "play_against: ", socket.id );
      console.log( "user: ", user );
      setGameRequestUser( user );
    } );

    gameSocket.on( "emit_play_queue", ( data: any ) =>
    {
      // when you send req for queue, you receieve this one back.
      // it will have either status: ACCPTED or QUEUED.
    } );

    gameSocket.on( "emit_play_against_accept", ( gameData: any ) =>
    {
      console.log( "play_against_accept: ", gameData );
      if ( gameData.status === GameStatus.ACCEPTED )
      {
        setGame( gameData );
        router.push( { pathname: `/game/play`, query: { isPlaying: true } } );
      } else if ( gameData.status === GameStatus.CANCELLED )
      {
        setGame( null );
        toast.info(
          `Game has been cancelled: the other user was disconnected.`,
          toastOptions
        );
      }
    } );

    gameSocket.on( "emit_play_against_decline", ( data: any ) =>
    {
      //if rejected by other user, show toast.
      // cancel waiting popup.
      toast.info( `You request was denied by the other user.`, toastOptions );
    } );

    gameSocket.on( "emit_play_against_cancel", ( data: any ) =>
    {
      //if you cancelled request, you will receive this.
      // data = Game(status: "CANCELLED",... )
      // the waiting popup will be closed.
    } );

    gameSocket.on( "emit_spectate_game", ( gameData: any ) =>
    {
      setGame( gameData );
      router.push( `/game/play`, { query: { isPlaying: false } } );
      // TODO: redirect to game and start receiving game data.
    } );

    gameSocket.on( "emit_leave_queue", ( data: any ) =>
    {
      // TODO: hide waiting popup.
    } );
  }, [] );

  useEffect( () =>
  {
    axios
      .get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/me`, {
        withCredentials: true,
      } )
      .then( ( response ) =>
      {
        setData( response.data );
        localStorage.setItem( "user", JSON.stringify( response.data ) );
        localStorage.setItem( "userId", response.data?.id );
      } )
      .catch( ( err ) =>
      {
        console.log( "error1: ", err );
      } );
  }, [] );

  return (
    <GameRequestUserContext.Provider
      value={ [ gameRequestUser, setGameRequestUser ] }
    >
      <UserStatusContext.Provider value={ [ status, setStatus ] }>
        <NewMemberAddedContext.Provider
          value={ [ newMemberAdded, setNewMemberAdded ] }
        >
          <NewRoomContext.Provider value={ [ newRoom, setNewRoom ] }>
            <LastBlockedContext.Provider
              value={ [ lastBlockedId, setLastBlockedId ] }
            >
              <CurrentConvContext.Provider
                value={ [ currentConv, setCurrentConv ] }
              >
                <OnlineFriendsContext.Provider
                  value={ [ onlineFriends, setOnlineFriends ] }
                >
                  <ChatContext.Provider value={ [ chats, setChats ] }>
                    <MessagesContext.Provider value={ [ messages, setMessages ] }>
                      <GameDataContext.Provider value={ [ game, setGame ] }>
                        <GameSocketContext.Provider value={ gameSocket }>
                          <SocketContext.Provider value={ socket }>
                            <DataContext.Provider value={ [ data, setData ] }>
                              <div>
                                { gameRequestUser && (
                                  <Modal
                                    content={
                                      <>
                                        <div className={ styles_r_w.part_up }>
                                          <div className={ styles_r_w.text }>
                                            game invitaion
                                          </div>
                                        </div>
                                        <div
                                          className={ styles_r_w.leave_room_box }
                                        >
                                          <div
                                            className={ styles_r_w.leave_room }
                                          >
                                            { gameRequestUser.username } has
                                            invited to play a pong game.
                                          </div>
                                        </div>
                                        <div className={ styles_r_w.part_down }>
                                          <div
                                            className={ styles_r_w.cancel }
                                            onClick={ () =>
                                            {
                                              gameSocket.emit(
                                                "play_against_decline",
                                                {
                                                  userId: gameRequestUser.id,
                                                }
                                              );
                                              setGameRequestUser( null );
                                            } }
                                          >
                                            DENY
                                          </div>
                                          <button
                                            className={ styles_r_w.create }
                                            type="submit"
                                            onClick={ () =>
                                            {
                                              gameSocket.emit(
                                                "play_against_accept",
                                                {
                                                  userId: gameRequestUser.id,
                                                }
                                              );
                                              setGameRequestUser( null );
                                            } }
                                          >
                                            ACCEPT
                                          </button>
                                        </div>
                                      </>
                                    }
                                  />
                                ) }
                                <div className={ gameRequestUser && styles_r_w.room }>
                                  <Component { ...pageProps } />
                                </div>
                              </div>

                              <ToastContainer style={ { fontSize: "1.2rem" } } />
                            </DataContext.Provider>
                          </SocketContext.Provider>
                        </GameSocketContext.Provider>
                      </GameDataContext.Provider>
                    </MessagesContext.Provider>
                  </ChatContext.Provider>
                </OnlineFriendsContext.Provider>
              </CurrentConvContext.Provider>
            </LastBlockedContext.Provider>
          </NewRoomContext.Provider>
        </NewMemberAddedContext.Provider>
      </UserStatusContext.Provider>
    </GameRequestUserContext.Provider>
  );
}

export default MyApp;
