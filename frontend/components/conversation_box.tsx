import styles from "../styles/conversation_box.module.css";
import cn from "classnames";
import { useContext, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { ChatContext, CurrentConvContext } from "../pages/_app";

const ConversationBox = () =>
{
  // format date
  const formatDateAndTime = ( date: string ) =>
  {
    if ( !date ) return;
    const dateObj = new Date( date );
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();
    return `${ dateStr } ${ timeStr }`;
  }

  const [ chats, setChats ] = useContext( ChatContext );
  const [ currentConv, setCurrentConv ] = useContext( CurrentConvContext );

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/chat/chats`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setChats( res.data );
    } ).catch( ( err ) =>
    {
      console.log( err );
    } );
  }, [] );

  return chats?.map( ( conv: any, i: number ) =>
  {
    // setCurrent_conv( conv );
    return (
      <div key={ i }>
        <div
          onClick={ () =>
          {
            // console.log( "onclick conv is:", conv );
            setCurrentConv( conv );
          } }
          className={ cn(
            styles.conversation, ` ${ conv.roomId === currentConv.roomId && styles.current_conv }`
          ) }
        >
          <div className={ styles.conversation_img }>
            <Image
              src={ conv.image === null ? "https://ui-avatars.com/api/?name=John+Doe" : conv.image }
              alt="conversation_image"
              width={ "42px" }
              height={ "42px" }
            ></Image>
          </div>
          <div>
            <p className={ styles.conversation_name }>
              { conv.name }
            </p>
            <p className={ styles.conversation_text }>{ conv.lastMessage?.message }</p>
          </div>
          <div>
            <p className={ styles.conversation_time }>{ formatDateAndTime( conv.lastMessage?.createdAt ) }</p>
            { conv.wasRead !== true && (
              <p
                className={ cn(
                  styles.conversation_number
                ) }
              >
                { conv.wasRead ? "" : "" }
              </p> )
            }
          </div>
        </div>
      </div>
    );
  } );
};

export default ConversationBox;
