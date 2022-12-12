import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { useRouter } from "next/router";
import { BanSharp, PersonAddSharp } from 'react-ionicons'
import { PersonSharp } from 'react-ionicons'
import { VolumeMuteSharp } from 'react-ionicons'
import { useContext } from "react";
import { SocketContext } from "../pages/_app";

const TreePointsBox = ( { avatar, username, isgroup, roomId, roomUserId, ismember }: any ) =>
{
  console.log( 'user id: ', roomUserId );
  console.log( 'room id: ', roomId );
  const socket = useContext( SocketContext );
  const router = useRouter();
  return (
    <div className={ cn( styles.treepoints_box ) }>
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
              height="30px"
              width="30px"
            />
          </div>
        </div>
      </div>
      <div className={ styles.treepoints_box_row }>
        <p>invite player</p>
        <Image
          className={ styles.treepoints_settings }
          src="/invete_player.svg"
          alt="invete_player_icon"
          width={ "30px" }
          height={ "30px" }
        />
      </div>
      {
        isgroup && !ismember &&
        <div className={ styles.treepoints_box_row }>
          <p>mute user</p>
          <div className={ styles.treepoints_settings }>
            <VolumeMuteSharp
              color={ '#ffffff' }
              height="30px"
              width="30px"
            />
          </div>
        </div>
      }
      {
        isgroup && !ismember &&
        <div className={ styles.treepoints_box_row }>
          <p>ban user</p>
          <div className={ styles.treepoints_settings }>
            <BanSharp
              color={ '#ffffff' }
              height="30px"
              width="30px"
            />
          </div>
        </div>
      }
      {
        isgroup && !ismember &&
        <div className={ styles.treepoints_box_row }>
          <p>add Admine</p>
          <div className={ styles.treepoints_settings } onClick={ () =>
          {
            socket?.emit( 'make_admin', {
              targetUserId: roomUserId,
              roomId: roomId,
            } );
          } }>
            <PersonAddSharp
              color={ '#ffffff' }
              height="30px"
              width="30px"
            />
          </div>
        </div>
      }
    </div>
  );
};

export default TreePointsBox;
