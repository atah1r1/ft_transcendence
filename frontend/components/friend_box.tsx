import styles from "../styles/friends.module.css";
import Image from "next/image";

const Friends_box = ({ friends }: any) => {
  return friends.map((ele: any, i: any) => {
    return (
      <div className={styles.friends_box} key={i}>
        <div className={styles.friends_avatar}>
          <Image src={ele.avatar} alt="avatar" width="68" height="68" />
        </div>
        <div className={styles.friends_userName}>
          <p>{ele.userName}</p>
        </div>
        <div className={styles.friends_fullName}>
          <p>{ele.fullName}</p>
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
          <div>
            <Image
              src="/unfriend.svg"
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
