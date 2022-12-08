import styles from "../styles/friends.module.css";
import styles_room from "../styles/rooms.module.css";
import Image from "next/image";
import styles_s_l from "../styles/style_settings_nav.module.css";
import cn from "classnames";

const Rooms_box = ( { rooms }: any ) =>
{
  return rooms.map( ( room: any, i: number ) =>
  {
    return ( <div className={ styles.friends_box } key={ i }>
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
        <div className={ cn( styles_s_l.setting_btn, styles_room.join_btn ) }>JOIN</div>
      </div>
    </div> )
  } )
};

export default Rooms_box;