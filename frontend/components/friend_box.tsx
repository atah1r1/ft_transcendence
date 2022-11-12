import styles from "../styles/friends.module.css";
import Image from "next/image";
import { useContext } from "react";
import { SocketContext } from "../pages/_app";

const Friends_box = ({ friends }: any) => {

  const socket = useContext(SocketContext);

  return friends.map((ele: any, i: any) => {
    return (
      <div className={styles.friends_box} key={i}>
        <div className={styles.friends_avatar}>
          <Image src={ele.avatar === null ? `https://ui-avatars.com/api/?name=${ele.username}` : ele.avatar} alt="avatar" width="68" height="68" />
        </div>
        <div className={styles.friends_userName}>
          <p>{ele.username}</p>
        </div>
        <div className={styles.friends_fullName}>
          <p>{`${ele.first_name} ${ele.last_name}`}</p>
        </div>
        <div className={styles.friends_options}>
          <div>
            <Image
              src="/view_profile.svg"
              alt="invete_player_icon"
              width={"22px"}
              height={"22px"}
            />
          </div>
          <div onClick={() => {
            socket?.emit("create_dm", { otherUserId: ele.id });
          }}>
            <Image
              src="/chat.svg"
              alt="invete_player_icon"
              width={"22px"}
              height={"22px"}
            />
          </div>
          <div>
            <Image
              src="/block_user.svg"
              alt="invete_player_icon"
              width={"22px"}
              height={"22px"}
            />
          </div>
        </div>
      </div>
    );
  });
};

export default Friends_box;
