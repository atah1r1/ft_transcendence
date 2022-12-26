import styles from "../styles/friends.module.css";
import styles_room from "../styles/rooms.module.css";
import Image from "next/image";
import styles_s_l from "../styles/style_settings_nav.module.css";
import cn from "classnames";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../pages/_app";

const Rooms_box = ( { rooms, inputForm }: any ) =>
{
  const socket = useContext( SocketContext );
  const [ isProtected, setProtected ] = useState( -1 );
  const [ value, setValue ] = useState( '' );
  const [ empty, setEmpty ] = useState( false );

  useEffect( () =>
  {
    setTimeout( () =>
    {
      !rooms.length && setEmpty( true );
    }, 100 )
  } )

  const find = rooms ? rooms.filter( ( room: any ) => room.name.toLowerCase().includes( inputForm.toLowerCase() ) ) : [];

  return rooms.length ?
    (
      find.length ?
        rooms.map( ( room: any, i: number ) =>
        {
          return ( room.privacy !== 'PRIVATE' && <div className={ styles.friends_box } key={ i }>
            <div className={ styles.friends_avatar }>
              <Image src={ room?.image ?? "https://avatars.dicebear.com/api/bottts/yhadari.svg" } alt="avatar" width="68" height="68" />
            </div>
            <div className={ styles.friends_userName }>
              <p>{ room.name }</p>
            </div>
            <div className={ styles.friends_fullName }>
              <p>{ room.privacy }</p>
            </div>
            <div className={ styles.friends_options }>
              <div className={ styles_room.join_box }>
                <div onClick={ () =>
                {
                  if ( room.privacy === 'PROTECTED' )
                  {
                    setProtected( i );
                    if ( value && i === isProtected )
                      socket?.emit( "join_room", { roomId: room.id, password: value } );
                  }
                  else
                    socket?.emit( "join_room", { roomId: room.id, password: '' } );
                  setValue( '' );
                } }
                  className={ cn( styles_s_l.setting_btn, styles_room.join_btn ) }>
                  JOIN
                </div>
                {
                  isProtected === i &&
                  <input required type="password" placeholder="******" maxLength={ 16 }
                    onChange={ ( e ) => setValue( e.target.value.trim() ) } value={ value }></input>
                }
              </div>
            </div>
          </div > )
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

export default Rooms_box;