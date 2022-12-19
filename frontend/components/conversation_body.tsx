import axios from "axios";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import styles from "../styles/chat.module.css";
import styles_p from "../styles/profile.module.css";
import { CurrentConvContext, MessagesContext, SocketContext, LastBlockedContext } from "../pages/_app";

export default function ConversationBody ()
{
  const bottomRef = useRef<null | HTMLDivElement>( null );
  const [ messageInput, setMessageInput ] = useState( "" );
  const [ messages, setMessages ] = useContext( MessagesContext );
  const [ currentConv, setCurrentConv ] = useContext( CurrentConvContext );
  const [ lastBlockedId, setLastBlockedId ] = useContext( LastBlockedContext );
  const socket = useContext( SocketContext );

  useEffect( () =>
  {
    if ( !currentConv.roomId ) return;
    axios.get( `http://localhost:9000/api/chat/messages/${ currentConv.roomId }`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      const ms = new Map( messages );
      ms.set( currentConv.roomId, res.data );
      setMessages( ms );
    } ).catch( ( err ) =>
    {
    } );
  }, [ currentConv ] );

  useEffect( () =>
  {
    if ( currentConv && currentConv?.roomId )
    {
      socket?.emit( 'seen', {
        roomId: currentConv?.roomId,
        seen: true,
      } );
    }
  }, [ messages.get( currentConv?.roomId ?? '' ) ] );

  useEffect( () =>
  {
    return () =>
    {
      setCurrentConv( {} );
    };
  }, [ lastBlockedId ] );

  const handleSubmitMessages = ( e: any ) =>
  {
    e.preventDefault();
    if ( messageInput === "" ) return;
    socket?.emit( "message", {
      roomId: currentConv.roomId,
      message: messageInput,
    } );
    setMessageInput( "" );
  };

  useEffect( () =>
  {
    // 👇️ scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView( { behavior: 'smooth' } )
  }, [ messages.get( currentConv?.roomId ), messageInput === '' ] );

  return (
    <div className={ styles.conversation_body }>
      <div className={ styles.message_part_content }>
        { messages?.get( currentConv!.roomId )?.map( ( message: any, i: number ) =>
        {
          return (
            <div className={ styles.message_left } key={ i } >
              <div className={ styles.message_box }>
                <div className={ styles.message_avatar }>
                  <Image
                    src={ message.user?.avatar ?? "https://picsum.photos/300/300" }
                    alt="message_avatar"
                    width={ "42px" }
                    height={ "42px" }
                    className={ styles_p.profile_avatar }
                  />
                </div>
                <div style={ { width: "100%" } }>
                  <div className={ styles.message_nametime_box }>
                    <div className={ styles.message_fullName }>
                      { message.user?.username }
                    </div>
                    <div className={ styles.message_time }>
                      { message.createdAt.split( "T" )[ 0 ] } { message.createdAt.split( "T" )[ 1 ].split( "." )[ 0 ] }
                    </div>
                  </div>
                  <div className={ styles.message_text }>
                    { message.message }
                  </div>
                </div>
              </div>
              <div ref={ bottomRef } />
            </div>
          );
        } ) }
      </div>
      {
        currentConv.roomId &&
        <div className={ styles.message_part_send }>
          <div className={ styles.message_box_sender }>
            <form
              className={ styles.message_form }
              onSubmit={ handleSubmitMessages }
            >
              <input
                type="search"
                placeholder="Type a message here ."
                onChange={ ( e ) => setMessageInput( e.target.value ) }
                value={ messageInput }
              ></input>
            </form>

          </div>
          <div
            className={ styles.message_send }
            onClick={ handleSubmitMessages }
          >
            <Image
              src="/send_icon.svg"
              alt="send_message_icon"
              width={ "20%" }
              height={ "20%" }
            ></Image>
          </div>
        </div>
      }
    </div >
  )
}