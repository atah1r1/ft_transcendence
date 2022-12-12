import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { useRouter } from "next/router";
import { BanSharp, PersonAddSharp } from 'react-ionicons'
import { PersonSharp } from 'react-ionicons'
import { VolumeMuteSharp } from 'react-ionicons'
import { useContext, useEffect, useState } from "react";
import { SocketContext, UserStatusContext } from "../pages/_app";

const TreePointsBox = ( { avatar, username, isgroup, roomId, roomUser, userStatus }: any ) =>
{
  const socket = useContext( SocketContext );
  const [ member, setMember ] = useContext( UserStatusContext );
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
        isgroup && userStatus !== 'MEMBER' && roomUser.role !== 'OWNER' &&
        <div className={ styles.treepoints_box_row }>
          { member?.status === 'MUTED' ? <p>unmute user</p> : <p>mute user</p> }
          <div className={ styles.treepoints_settings } onClick={ () =>
          {
            member?.status === 'MUTED' ?
              socket?.emit( 'unmute_user', {
                targetUserId: roomUser.userId,
                roomId: roomId,
              } ) : socket?.emit( 'mute_user', {
                targetUserId: roomUser.userId,
                roomId: roomId,
              } )
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
        isgroup && userStatus !== 'MEMBER' && roomUser.role !== 'OWNER' &&
        <div className={ styles.treepoints_box_row }>
          { member?.status === 'BANNED' ? <p>unban user</p> : <p>ban user</p> }
          <div className={ styles.treepoints_settings } onClick={ () =>
          {
            member?.status === 'BANNED' ? socket?.emit( 'unban_user', {
              targetUserId: roomUser.userId,
              roomId: roomId,
            } ) : socket?.emit( 'ban_user', {
              targetUserId: roomUser.userId,
              roomId: roomId,
            } )
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
        isgroup && userStatus === 'OWNER' && roomUser.role !== 'ADMIN' && roomUser.role !== 'OWNER' &&
        <div className={ styles.treepoints_box_row }>
          <p>add Admine</p>
          <div className={ styles.treepoints_settings } onClick={ () =>
          {
            socket?.emit( 'make_admin', {
              targetUserId: roomUser.userId,
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
