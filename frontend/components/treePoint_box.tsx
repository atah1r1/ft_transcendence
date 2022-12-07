import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { callbackify } from "util";

const TreePointsBox = ( { group_box, group_box_i }: any ) =>
{
  return (
    <div
      className={ cn(
        styles.treepoints_box,
        group_box && styles.treepoints_box_group
      ) }
      style={ {
        top: `calc(4.6rem + ${ group_box_i * 4 + group_box_i * 1.6 }rem)`
      } }
    >
      <div className={ styles.treepoints_box_row_details }>
        <p>invite player</p>
        <div className={ styles.treepoints_settings }>
          <Image
            src="/invete_player.svg"
            alt="invete_player_icon"
            width={ "80px" }
            height={ "80px" }
          />
        </div>
      </div>
      <div className={ styles.treepoints_box_row_details }>
        <p>block user</p>
        <div className={ styles.treepoints_settings }>
          <Image
            src="/block_user.svg"
            alt="block_user_icon"
            width={ "80px" }
            height={ "80px" }
          />
        </div>
      </div>
      <div className={ styles.treepoints_box_row_details }>
        <p>view profile</p>
        <div className={ styles.treepoints_settings }>
          <Image
            src="/view_profile.svg"
            alt="view_profile_icon"
            width={ "80px" }
            height={ "80px" }
          />
        </div>
      </div>
    </div>
  );
};

export default TreePointsBox;
