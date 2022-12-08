import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { useRouter } from "next/router";

const TreePointsBox = ( { avatar, username }: any ) =>
{
  const router = useRouter();
  return (
    <div
      className={ cn( styles.treepoints_box ) }
    >
      <div className={ styles.treepoints_box_row }>
        <p>invite player</p>
        <Image
          className={ styles.treepoints_settings }
          src="/invete_player.svg"
          alt="invete_player_icon"
          width={ "40px" }
          height={ "40px" }
        />
      </div>
      <div className={ styles.treepoints_box_row }>
        <p>block user</p>
        <Image
          className={ styles.treepoints_settings }
          src="/block_user.svg"
          alt="block_user_icon"
          width={ "40px" }
          height={ "40px" }
        />
      </div>
      <div className={ styles.treepoints_box_row }>
        <p>view profile</p>
        <div onClick={ () =>
        {
          router.push( {
            pathname: '/profile',
            query: {
              avatar,
              username
            }
          } )

        } }>
          <Image
            className={ styles.treepoints_settings }
            src="/view_profile.svg"
            alt="view_profile_icon"
            width={ "40px" }
            height={ "40px" }
          />
        </div>
      </div>
    </div>
  );
};

export default TreePointsBox;
