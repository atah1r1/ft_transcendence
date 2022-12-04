import styles from "../styles/friends.module.css";
import Image from "next/image";
import { useContext } from "react";
import { SocketContext } from "../pages/_app";
import { AddCircleOutline, ChatbubbleOutline, PersonCircleOutline, RemoveCircleOutline } from 'react-ionicons'
import { useRouter } from "next/router";

const Friends_box = ( { friends }: any ) =>
{
  const router = useRouter();
  const socket = useContext( SocketContext );

  return friends.map( ( ele: any, i: any ) =>
  {
    return (
      <div className={ styles.friends_box } key={ i }>
        <div className={ styles.friends_avatar }>
          <Image src={ ele.avatar === null ? `https://ui-avatars.com/api/?name=${ ele.username }` : ele.avatar } alt="avatar" width="68" height="68" />
        </div>
        <div className={ styles.friends_userName }>
          <p>{ ele.username }</p>
        </div>
        <div className={ styles.friends_fullName }>
          <p>{ `${ ele.first_name } ${ ele.last_name }` }</p>
        </div>
        <div className={ styles.friends_options }>
          <div onClick={ () =>
          {
            router.push( {
              pathname: '/profile',
              query: {
                avatar: friends[ i ].avatar,
                username: friends[ i ].username
              }
            } )
          } }>
            <PersonCircleOutline
              color={ '#ffffff' }
              height="30px"
              width="30px"
            />
          </div>
          {
            friends[ i ].isFriend === false &&
            <div onClick={ () =>
            {
              socket?.emit( "create_dm", { otherUserId: ele.id } );
            } }>
              <AddCircleOutline
                color={ '#ffffff' }
                height="30px"
                width="30px"
              />
            </div>
          }
          {
            friends[ i ].isFriend === true &&
            <div onClick={ () =>
            {
              socket?.emit( "create_dm", { otherUserId: ele.id } );
            } }>
              <ChatbubbleOutline
                color={ '#ffffff' }
                height="30px"
                width="30px"
              />
            </div>
          }
          <div>
            <RemoveCircleOutline
              color={ '#ffffff' }
              height="30px"
              width="30px"
            />
          </div>
        </div>
      </div>
    );
  } );
};

export default Friends_box;
