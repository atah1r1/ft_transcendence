import styles from "../styles/friends.module.css";
import styles_p from "../styles/profile.module.css";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../pages/_app";
import { AddCircleOutline, ChatbubbleOutline, PersonCircleOutline, RemoveCircleOutline } from 'react-ionicons'
import { useRouter } from "next/router";

const Friends_box = ( { friends, inputForm }: any ) =>
{
  const router = useRouter();
  const socket = useContext( SocketContext );
  const [ empty, setEmpty ] = useState( false );

  useEffect( () =>
  {
    setTimeout( () =>
    {
      !friends.length && setEmpty( true );
    }, 100 )
  } )

  const find = friends ? friends.filter( ( friend: any ) => friend.username.toLowerCase().includes( inputForm.toLowerCase() ) ) : [];

  return friends.length ?
    (
      find.length ?
        find.map( ( ele: any, i: any ) =>
        {
          return (
            <div className={ styles.friends_box } key={ i }>
              <div className={ styles.friends_avatar }>
                <Image src={ ele?.avatar ?? "https://picsum.photos/300/300" } alt="avatar" width="68" height="68" className={ styles_p.profile_avatar } />
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
                  router.push( `/profile/${ find[ i ].id }` )
                } }>
                  <PersonCircleOutline
                    color={ '#ffffff' }
                    height="30px"
                    width="30px"
                  />
                </div>
                {
                  find[ i ].isFriend === false &&
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
                  find[ i ].isFriend === true &&
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
        } ) : <div className={ styles.noresult }>
          <Image
            src={ "/noresult1.png" }
            alt="no_result_img"
            width="220"
            height="220"
          ></Image>
        </div> ) :
    empty && <div className={ styles.noresult }>
      <Image
        src={ "/noresult.png" }
        alt="no_result_img"
        width="220"
        height="220"
      ></Image>
    </div>
};

export default Friends_box;
