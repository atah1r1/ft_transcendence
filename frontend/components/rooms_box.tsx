import styles from "../styles/friends.module.css";
import styles_room from "../styles/rooms.module.css";
import Image from "next/image";
import styles_s_l from "../styles/style_settings_nav.module.css";
import cn from "classnames";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../pages/_app";

const Rooms_box = ( { rooms }: any ) =>
{
  const [ Protected, setProtected ] = useState( false );
  const [ value, setValue ] = useState( '' );

  const socket = useContext( SocketContext );
  return rooms.map( ( room: any, i: number ) =>
  {
    return ( room.privacy !== 'PRIVATE' && <div className={ styles.friends_box } key={ i }>
      <div className={ styles.friends_avatar }>
        <Image src={ room?.avatar ?? "https://picsum.photos/300/300" } alt="avatar" width="68" height="68" />
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
              setProtected( true );
              if ( value )
                socket?.emit( "join_room", { roomId: room.id, password: value } );
            }
            else
              socket?.emit( "join_room", { roomId: room.id, password: '' } );
          } }
            className={ cn( styles_s_l.setting_btn, styles_room.join_btn ) }>
            JOIN
          </div>
          {
            room.privacy === 'PROTECTED' && Protected &&
            <form>
              <input type="text" placeholder="******" maxLength={ 16 } value={ value }></input>
            </form>
          }
        </div>
      </div>
    </div> )
  } )
};

export default Rooms_box;