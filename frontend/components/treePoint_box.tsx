import Image from "next/image";
import cn from "classnames";
import styles from "../styles/treeProints.module.css";
import { useRouter } from "next/router";
import { BanSharp, PersonAddSharp } from 'react-ionicons'
import { PersonSharp } from 'react-ionicons'
import { VolumeMuteSharp } from 'react-ionicons'
import { useContext } from "react";
import { GameSocketContext, SocketContext } from "../pages/_app";

const TreePointsBox = ({ members, group, roomId, roomUser, userStatus }: any) => {
  const userId = localStorage.getItem('userId');
  const friendId = members.find((member: any) => member.id != userId)?.id;
  const socket = useContext(SocketContext);
  const gameSocket = useContext(GameSocketContext);
  const router = useRouter();

  return !group.group_box ?
    (<div className={styles.treepoints_box_conv}>
      <div className={styles.treepoints_box_row}
        onClick={() => {
          router.push(`/profile/${friendId}`);
          group.setGroupBox(false);
        }}>
        <p>view profile</p>
        <PersonSharp
          color={'#ffffff'}
          height="30px"
          width="30px"
        />
      </div>
      <div className={styles.treepoints_box_row}
        onClick={() => {
          gameSocket.emit('play_against', { userId: friendId });
          group.setGroupBox(false);
        }}>
        <p>invite player</p>
        <Image
          src="/invete_player.svg"
          alt="invete_player_icon"
          width={"30px"}
          height={"30px"}
        />
      </div>
    </div>) :
    (
      <div className={styles.treepoints_box_details}>
        <div className={styles.treepoints_box_row}
          onClick={() => {
            router.push(`/profile/${roomUser.userId}`);
            group.setGroupBox(false);
          }}>
          <p>view profile</p>
          <PersonSharp
            color={'#ffffff'}
            height="30px"
            width="30px"
          />
        </div>
        <div className={styles.treepoints_box_row}
          onClick={() => {
            gameSocket.emit('play_against', { userId: roomUser.userId });
            group.setGroupBox(false);
          }}>
          <p>invite player</p>
          <Image
            src="/invete_player.svg"
            alt="invete_player_icon"
            width={"30px"}
            height={"30px"}
          />
        </div>
        {
          group.group_box && userStatus !== 'MEMBER' && roomUser.role !== 'OWNER' &&
          <div className={styles.treepoints_box_row}
            onClick={() => {
              roomUser.status === 'MUTED' ?
                socket?.emit('unmute_user', {
                  targetUserId: roomUser.userId,
                  roomId: roomId,
                }) : socket?.emit('mute_user', {
                  targetUserId: roomUser.userId,
                  roomId: roomId,
                })
              group.setGroupBox(false);
            }}>
            {roomUser.status === 'MUTED' ? <p style={{ color: "#dc465e" }}>unmute user</p> : <p>mute user</p>}
            <VolumeMuteSharp
              color={roomUser.status === 'MUTED' ? '#dc465e' : '#ffffff'}
              height="30px"
              width="30px"
            />
          </div>
        }
        {
          group.group_box && userStatus !== 'MEMBER' && roomUser.role !== 'OWNER' &&
          <div className={styles.treepoints_box_row}
            onClick={() => {
              roomUser.status === 'BANNED' ? socket?.emit('unban_user', {
                targetUserId: roomUser.userId,
                roomId: roomId,
              }) : socket?.emit('ban_user', {
                targetUserId: roomUser.userId,
                roomId: roomId,
              })
              group.setGroupBox(false);
            }}>
            {roomUser.status === 'BANNED' ? <p style={{ color: "#dc465e" }}>unban user</p> : <p>ban user</p>}
            <BanSharp
              color={roomUser.status === 'BANNED' ? '#dc465e' : '#ffffff'}
              height="30px"
              width="30px"
            />
          </div>
        }
        {
          group.group_box && userStatus === 'OWNER' && roomUser.role !== 'ADMIN' && roomUser.role !== 'OWNER' &&
          <div className={styles.treepoints_box_row}
            onClick={() => {
              socket?.emit('make_admin', {
                targetUserId: roomUser.userId,
                roomId: roomId,
              });
              group.setGroupBox(false);
            }}>
            <p>add Admin</p>
            <PersonAddSharp
              color={'#ffffff'}
              height="30px"
              width="30px"
            />
          </div>
        }
      </div>
    );
};

export default TreePointsBox;
