import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { useRouter } from "next/router";
import { BanSharp } from 'react-ionicons'
import { PersonSharp } from 'react-ionicons'
import { VolumeMuteSharp } from 'react-ionicons'

const TreePointsBox = ( { avatar, username }: any ) =>
{
  const router = useRouter();
  return (
    <div className={ cn( styles.treepoints_box ) }>
      <div className={ styles.treepoints_box_row }>
        <p>invite player</p>
        <Image
          className={ styles.treepoints_settings }
          src="/invete_player.svg"
          alt="invete_player_icon"
          width={ "32px" }
          height={ "32px" }
        />
      </div>
      <div className={ styles.treepoints_box_row }>
        <p>mute user</p>
        <div className={ styles.treepoints_settings }>
          <VolumeMuteSharp
            color={ '#ffffff' }
            height="32px"
            width="32px"
          />
        </div>
      </div>
      <div className={ styles.treepoints_box_row }>
        <p>ban user</p>
        <div className={ styles.treepoints_settings }>
          <BanSharp
            color={ '#ffffff' }
            height="32px"
            width="32px"
          />
        </div>
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
          <div className={ styles.treepoints_settings }>
            <PersonSharp
              color={ '#ffffff' }
              height="32px"
              width="32px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreePointsBox;
