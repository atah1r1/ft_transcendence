import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { callbackify } from "util";

const TreePointsBox = ({ group_box, group_box_i }: any) => {
  return (
    <div
      className={cn(
        styles.treepoints_box,
        group_box && styles.treepoints_box_group
      )}
      style={{
        top: `calc(4.6rem + ${group_box_i * 4 + group_box_i * 1.6}rem)`
      }}
    >
      <div className={styles.treepoints_box_row}>
        <p>invite player</p>
        <Image
          src="/invete_player.svg"
          alt="invete_player_icon"
          width={"26px"}
          height={"26px"}
        />
      </div>
      <div className={styles.treepoints_box_row}>
        <p>unfriend</p>
        <Image
          src="/unfriend.svg"
          alt="unfriend_icon"
          width={"26px"}
          height={"26px"}
        />
      </div>
      <div className={styles.treepoints_box_row}>
        <p>block user</p>
        <Image
          src="/block_user.svg"
          alt="block_user_icon"
          width={"26px"}
          height={"26px"}
        />
      </div>
      <div className={styles.treepoints_box_row}>
        <p>view profile</p>
        <Image
          src="/view_profile.svg"
          alt="view_profile_icon"
          width={"26px"}
          height={"26px"}
        />
      </div>
    </div>
  );
};

export default TreePointsBox;
