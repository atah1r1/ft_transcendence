import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { useRouter } from "next/router";
import { BanSharp, PersonAddSharp } from 'react-ionicons'
import { PersonSharp } from 'react-ionicons'
import { VolumeMuteSharp } from 'react-ionicons'
import { useContext } from "react";
import { SocketContext } from "../pages/_app";

const TreePointsBox = ( { avatar, username, group, roomId, roomUser, userStatus }: any ) =>
{
  const socket = useContext( SocketContext );
  const router = useRouter();

  return (
    <div className={ cn( styles.treepoints_box ) }>
      <div className={ styles.treepoints_box_row }>
        <p>view profile</p>
        <div onClick={ () =>
        {
          router.push( {
            pathname: '/friendProfile',
            query: {
              avatar,
              username
            }
          } )
          group.setGroupBox( false );

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
        group.group_box && userStatus !== 'MEMBER' && roomUser.role !== 'OWNER' &&
        <div className={ styles.treepoints_box_row }>
          { roomUser.status === 'MUTED' ? <p>unmute user</p> : <p>mute user</p> }
          <div className={ styles.treepoints_settings } onClick={ () =>
          {
            roomUser.status === 'MUTED' ?
              socket?.emit( 'unmute_user', {
                targetUserId: roomUser.userId,
                roomId: roomId,
              } ) : socket?.emit( 'mute_user', {
                targetUserId: roomUser.userId,
                roomId: roomId,
              } )
            group.setGroupBox( false );
          } }>
            <VolumeMuteSharp
              color={ '#ffffff' }
              height="30px"
              width="30px"
            />
          </div>
        </div>
      }
      {
        group.group_box && userStatus !== 'MEMBER' && roomUser.role !== 'OWNER' &&
        <div className={ styles.treepoints_box_row }>
          { roomUser.status === 'BANNED' ? <p>unban user</p> : <p>ban user</p> }
          <div className={ styles.treepoints_settings } onClick={ () =>
          {
            roomUser.status === 'BANNED' ? socket?.emit( 'unban_user', {
              targetUserId: roomUser.userId,
              roomId: roomId,
            } ) : socket?.emit( 'ban_user', {
              targetUserId: roomUser.userId,
              roomId: roomId,
            } )
            group.setGroupBox( false );
          } }>
            <BanSharp
              color={ '#ffffff' }
              height="30px"
              width="30px"
            />
          </div>
        </div>
      }
      {
        group.group_box && userStatus === 'OWNER' && roomUser.role !== 'ADMIN' && roomUser.role !== 'OWNER' &&
        <div className={ styles.treepoints_box_row }>
          <p>add Admine</p>
          <div className={ styles.treepoints_settings } onClick={ () =>
          {
            socket?.emit( 'make_admin', {
              targetUserId: roomUser.userId,
              roomId: roomId,
            } );
            group.setGroupBox( false );
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
