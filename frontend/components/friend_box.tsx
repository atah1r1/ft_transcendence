import styles from "../styles/friends.module.css";
import styles_p from "../styles/profile.module.css";
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
          <Image src={ ele?.avatar ?? "https://picsum.photos/300/300" } alt="avatar" width="68" height="68" className={ styles_p.profile_avatar }/>
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
            router.push( `/profile/${ friends[ i ].id }` )
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
          <div onClick={ () =>
          {
            socket?.emit( "block_user", { targetUserId: friends[ i ].id } );
          } }>
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
