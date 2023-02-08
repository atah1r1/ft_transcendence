import cn from "classnames";
import styles from "../../styles/chat.module.css";
import styles_p from "../../styles/profile.module.css";
import styles_box from "../../styles/style_box.module.css";
import styles_r_w from "../../styles/chatroom_window.module.css";
import styles_tree_p from "../../styles/treeProints.module.css";
import SettingsNav from "../../components/settings_nav";
import ConversationBox from "../../components/conversation_box";
import styles_c_b from "../../styles/conversation_box.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ClickOutsidePoints from "../../components/clickOutsidePoints";
import TreePointsBox from "../../components/treePoint_box";
import {
  CurrentConvContext,
  GameDataContext,
  GameRequestUserContext,
  GameSocketContext,
  GameStatus,
  NewMemberAddedContext,
  OnlineFriendsContext,
  SocketContext,
  UserStatusContext,
} from "../_app";
import MenuNav from "../../components/menuNav";
import {
  AddOutline,
  CloseSharp,
  ArrowBackOutline,
  PersonSharp,
  LogOutSharp,
  BagAddSharp,
  ShieldCheckmarkSharp,
  AlertCircleOutline,
  PersonAddOutline,
  PersonRemoveOutline,
  ReturnUpBackOutline,
} from "react-ionicons";
import ConversationBody from "../../components/conversation_body";
import axios from "axios";
import { LastBlockedContext } from "../_app";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";
import { useRouter } from "next/router";
import Modal from "../../components/modal_dialog";

const Chat = () => {
  const router = useRouter();

  const socket = useContext(SocketContext);
  const [onlineFriends, setOnlineFriends] = useContext(OnlineFriendsContext);
  const [currentConv, setCurrentConv] = useContext(CurrentConvContext);
  const [roomMembers, setRoomMembers] = useState([]);
  const [value, setValue] = useState("");
  const [lastBlockedId, setLastBlockedId] = useContext(LastBlockedContext);
  const [newMemberAdded, setNewMemberAdded] = useContext(NewMemberAddedContext);
  const [memberStatus, setMemberStatus] = useContext(UserStatusContext);
  const [gameRequestUser, setGameRequestUser] = useContext(
    GameRequestUserContext
  );
  const handleChange = (e: any) => {
    const result = e.target.value.replace(/\D/g, "");
    setValue(result);
  };

  const [room, setRoom] = useState(false);
  const [creat_room, setCreat_room] = useState(false);
  const [protected_room, setProtected_room] = useState(false);
  const [chatroomInputs, setChatroomInputs] = useState({
    groupName: "",
    groupType: "PUBLIC",
    password: "",
  });

  const handleSubmitGroup = (e: any) => {
    e.preventDefault();
    socket?.emit("create_room", {
      name: chatroomInputs.groupName,
      privacy: chatroomInputs.groupType,
      password: chatroomInputs.password,
      image: `https://avatars.dicebear.com/api/bottts/${chatroomInputs.groupName}.svg`,
    });
    setChatroomInputs({
      groupName: "",
      groupType: "PUBLIC",
      password: "",
    });
    setRoom(false);
    setProtected_room(false);
    setCreat_room(false);
  };

  const [searchInput, setSearchInput] = useState("");
  const [treePoints, setTreePoints] = useState(false);
  const [group_box, setGroupBox] = useState(false);
  const [menu, setMenu] = useState(false);
  const [friends, setFriends] = useState([]);
  const [addFriends, setAddFriends] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  const [roomUser, setRoomUser] = useState({});
  const [addPassToProtectedRoom, setAddPassToProtectedRoom] = useState(false);
  const [passValue, setPassValue] = useState("");
  const [leaveRoom, setLeaveRoom] = useState(false);
  const gameSocket = useContext(GameSocketContext);
  const [game, setGame] = useContext(GameDataContext);

  useEffect(() => {
    if (!currentConv?.roomId) return;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/room/${currentConv.roomId}/members`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setRoomMembers(res.data);
      })
      .catch((err) => {
      });
  }, [currentConv, newMemberAdded, memberStatus]);

  useEffect(() => {
    if (!currentConv?.roomId || currentConv?.isDm) return;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/room/${currentConv.roomId}/friendstoadd`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setFriends(res.data);
      })
      .catch((err) => {
      });
  }, [currentConv, newMemberAdded]);

  useEffect(() => {
    setTreePoints(false);
  }, [lastBlockedId]);

  return (
    <div>
      <MenuNav menu={menu} setMenu={setMenu} />
      {leaveRoom && (
        <Modal
          content={
            <>
              <div className={styles_r_w.part_up}>
                <div className={styles_r_w.text}>LEAVE A CHAT ROOM</div>
                <div
                  className={styles_r_w.remove}
                  onClick={() => {
                    setLeaveRoom(false);
                  }}
                >
                  <CloseSharp color={"#ffffff"} height="40px" width="40px" />
                </div>
              </div>
              <div className={styles_r_w.part_up}>
                <div className={styles_r_w.leave_room_box}>
                  <div>
                    <AlertCircleOutline
                      color={"#ffffff"}
                      height="100px"
                      width="100px"
                    />
                  </div>
                  <div className={styles_r_w.leave_room}>
                    Are you sure you want to leave this room?
                  </div>
                </div>
              </div>
              <div className={styles_r_w.part_down}>
                <div
                  className={styles_r_w.cancel}
                  onClick={() => {
                    setLeaveRoom(false);
                  }}
                >
                  NO
                </div>
                <div
                  className={styles_r_w.create}
                  onClick={() => {
                    setLeaveRoom(false);
                    socket?.emit("leave_room", {
                      roomId: currentConv?.roomId,
                    });
                  }}
                >
                  YES
                </div>
              </div>
            </>
          }
        />
      )}
      {room && (
        <Modal
          content={
            <>
              <div className={styles_r_w.part_up}>
                {room && !creat_room && !protected_room && (
                  <div className={styles_r_w.text}>CREATE A CHAT ROOM</div>
                )}
                {creat_room && (
                  <div className={styles_r_w.text}>CREATE A CHAT ROOM</div>
                )}
                {protected_room && (
                  <div className={styles_r_w.text}>JOIN CHAT_PROTECTED</div>
                )}
                <div
                  className={styles_r_w.remove}
                  onClick={() => {
                    setCreat_room(false);
                    setRoom(false);
                    setProtected_room(false);
                  }}
                >
                  <CloseSharp color={"#ffffff"} height="40px" width="40px" />
                </div>
              </div>
              {room && !creat_room && !protected_room && (
                <div className={styles_r_w.creat_join_btn}>
                  <div
                    className={styles_r_w.create}
                    onClick={() => setCreat_room(true)}
                  >
                    CREATE ROOM
                  </div>
                </div>
              )}
              {protected_room && (
                <div
                  className={cn(
                    styles_r_w.creat_join_btn,
                    styles_r_w.join_box,
                    styles_r_w.join_protect
                  )}
                >
                  <label>PASSWORD</label>
                  <input
                    type="text"
                    placeholder="******"
                    maxLength={6}
                    value={value}
                    onChange={handleChange}
                  ></input>
                </div>
              )}
              <form onSubmit={handleSubmitGroup}>
                {creat_room && (
                  <div>
                    <label>group name</label>
                    <input
                      maxLength={16}
                      type="text"
                      value={chatroomInputs.groupName}
                      placeholder="pingpong"
                      required
                      onChange={(e) =>
                        setChatroomInputs({
                          ...chatroomInputs,
                          groupName: e.target.value.trim(),
                        })
                      }
                    ></input>
                  </div>
                )}
                {creat_room && (
                  <div>
                    <label>group type</label>
                    <select
                      required
                      value={chatroomInputs.groupType}
                      onChange={(e) =>
                        setChatroomInputs({
                          ...chatroomInputs,
                          groupType: e.target.value,
                        })
                      }
                    >
                      <option value="PUBLIC">public</option>
                      <option value="PROTECTED">protected</option>
                      <option value="PRIVATE">private</option>
                    </select>
                  </div>
                )}
                {chatroomInputs.groupType === "PROTECTED" && creat_room && (
                  <div>
                    <label>password</label>
                    <input
                      type="password"
                      placeholder="************"
                      required
                      value={chatroomInputs.password}
                      maxLength={16}
                      onChange={(e) =>
                        setChatroomInputs({
                          ...chatroomInputs,
                          password: e.target.value.trim(),
                        })
                      }
                    ></input>
                  </div>
                )}
                <div className={styles_r_w.part_down}>
                  {room && !creat_room && !protected_room && (
                    <div
                      className={styles_r_w.cancel}
                      onClick={() => {
                        setCreat_room(false);
                        setRoom(false);
                      }}
                    >
                      CANCEL
                    </div>
                  )}
                  {creat_room && (
                    <button className={styles_r_w.create} type="submit">
                      CREATE
                    </button>
                  )}
                </div>
              </form>
            </>
          }
        />
      )}
      <div
        className={cn(
          styles_box.container,
          (room || leaveRoom) && styles_r_w.room
        )}
      >
        <SettingsNav selected={"chat"} menu={menu} />
        <div className={styles_box.profile_details}>
          <Logout />
          <div className={styles.chat_box}>
            <div className={styles.chat_left}>
              <div className={styles.l_part_one}>
                <div className={styles.chat_plus}>
                  <p>CHATS</p>
                  <div
                    className={styles.plus_btn}
                    onClick={() => setRoom(true)}
                  >
                    +
                  </div>
                </div>
                <form
                  className={styles.search}
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <input
                    maxLength={16}
                    type="search"
                    placeholder="Search..."
                    onChange={(e) => setSearchInput(e.target.value.trim())}
                    value={searchInput}
                  ></input>
                </form>
              </div>
              <div className={styles.l_part_two}>
                <ConversationBox searchInput={searchInput} />
              </div>
              <div className={styles.l_part_tree}>
                {onlineFriends.map((friend: any, i: number) => {
                  return (
                    <div key={i} className={styles.online}>
                      <Image
                        src={friend?.avatar ?? "https://picsum.photos/300/300"}
                        alt="online_friend_img"
                        width={"34px"}
                        height={"34px"}
                        layout={"fixed"}
                        className={styles_p.profile_avatar}
                      ></Image>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.chat_right}>
              <div className={styles.conversation_head}>
                {Object.keys(currentConv).length !== 0 && (
                  <>
                    <p
                      onClick={() => {
                        if (currentConv.isDm) {
                          const userId = localStorage.getItem("userId");
                          const friendId = currentConv.members.find(
                            (member: any) => member.id != userId
                          )?.id;
                          router.push(`/profile/${friendId}`);
                        }
                      }}
                      className={cn(
                        styles_c_b.conversation_name,
                        styles_c_b.conversation_name_current
                      )}
                    >
                      {currentConv?.name}
                    </p>
                    <div
                      className={styles_tree_p.conversation_head_treepoints}
                      onClick={() => {
                        setTreePoints(!treePoints);
                        setAddPassToProtectedRoom(false);
                        setAddFriends(false);
                      }}
                    >
                      ...
                    </div>
                  </>
                )}
              </div>
              <div className={styles.body}>
                <ConversationBody />
                {
                  <ClickOutsidePoints
                    setTreePoints={setTreePoints}
                    setGroupBox={setGroupBox}
                    content={
                      (treePoints && currentConv.isDm) || group_box ? (
                        <>
                          {group_box && (
                            <div
                              className={styles.back_arrow}
                              onClick={() => {
                                setGroupBox(false);
                                setAddFriends(false);
                              }}
                            >
                              <ReturnUpBackOutline
                                color={"#ffffff"}
                                height="30px"
                                width="30px"
                              />
                              <p>go back</p>
                            </div>
                          )}
                          <TreePointsBox
                            members={currentConv.members}
                            group={{
                              setGroupBox: setGroupBox,
                              group_box: group_box,
                            }}
                            roomId={currentConv?.roomId}
                            roomUser={roomUser}
                            userStatus={userStatus}
                          />
                        </>
                      ) : (
                        treePoints &&
                        !group_box && (
                          <div className={styles.treePointsContent}>
                            <div className={styles_tree_p.treepoints_box}>
                              {!addFriends &&
                                roomMembers?.map(
                                  (member: any, i: number, arr: any) => {
                                    return (
                                      <div key={i}>
                                        <div
                                          className={styles.room_privacy_box}
                                        >
                                          {i === 0 && (
                                            <p
                                              className={cn(
                                                styles.room_privacy,
                                                `${
                                                  (currentConv.privacy ===
                                                    "PUBLIC" &&
                                                    styles.public_room) ||
                                                  (currentConv.privacy ===
                                                    "PROTECTED" &&
                                                    styles.protected_room) ||
                                                  (currentConv.privacy ===
                                                    "PRIVATE" &&
                                                    styles.private_room)
                                                }`
                                              )}
                                            >
                                              {currentConv.privacy} ROOM
                                            </p>
                                          )}
                                          {currentConv.privacy === "PUBLIC" &&
                                            member.role === "OWNER" &&
                                            localStorage.getItem("userId") ===
                                              member.userId && (
                                              <div
                                                className={
                                                  styles_tree_p.treepoints_settings
                                                }
                                                onClick={() =>
                                                  setAddPassToProtectedRoom(
                                                    true
                                                  )
                                                }
                                              >
                                                <BagAddSharp
                                                  color={"#ffffff"}
                                                  height="28px"
                                                  width="28px"
                                                />
                                              </div>
                                            )}
                                        </div>
                                        {addPassToProtectedRoom &&
                                          currentConv.privacy === "PUBLIC" &&
                                          member.role === "OWNER" &&
                                          localStorage.getItem("userId") ===
                                            member.userId && (
                                            <div
                                              className={styles.room_input_box}
                                            >
                                              <input
                                                required
                                                type="password"
                                                placeholder="******"
                                                maxLength={16}
                                                onChange={(e) =>
                                                  setPassValue(
                                                    e.target.value.trim()
                                                  )
                                                }
                                                value={passValue}
                                              ></input>
                                              {passValue && (
                                                <div
                                                  className={
                                                    styles_tree_p.treepoints_settings
                                                  }
                                                  onClick={() => {
                                                    socket?.emit(
                                                      "protect_room",
                                                      {
                                                        roomId:
                                                          currentConv?.roomId,
                                                        password: passValue,
                                                      }
                                                    );
                                                    setPassValue("");
                                                    setAddPassToProtectedRoom(
                                                      false
                                                    );
                                                  }}
                                                >
                                                  <ShieldCheckmarkSharp
                                                    color={"#ffffff"}
                                                    height="28px"
                                                    width="28px"
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        {member.role === "OWNER" &&
                                          localStorage.getItem("userId") ===
                                            member.userId && (
                                            <div
                                              className={styles.add_leave_btn}
                                              onClick={() => {
                                                setAddFriends(true);
                                              }}
                                            >
                                              <p>add members</p>
                                              <PersonAddOutline
                                                color={"#ffffff"}
                                                height="30px"
                                                width="30px"
                                              />
                                            </div>
                                          )}
                                        {(member.role === "MEMBER" ||
                                          member.role === "ADMIN") &&
                                          localStorage.getItem("userId") ===
                                            member.userId && (
                                            <div
                                              className={styles.add_leave_btn}
                                              onClick={() => {
                                                setLeaveRoom(true);
                                              }}
                                            >
                                              <p>leave room</p>
                                              <PersonRemoveOutline
                                                color={"#ffffff"}
                                                height="30px"
                                                width="30px"
                                              />
                                            </div>
                                          )}
                                        {member.role === "OWNER" &&
                                          arr[i - 1]?.role !== "OWNER" && (
                                            <p
                                              className={
                                                styles_tree_p.treepoints_owner
                                              }
                                            >
                                              Owner
                                            </p>
                                          )}
                                        {member.role === "ADMIN" &&
                                          arr[i - 1]?.role !== "ADMIN" && (
                                            <p
                                              className={
                                                styles_tree_p.treepoints_owner
                                              }
                                            >
                                              Admin
                                            </p>
                                          )}
                                        {member.role === "MEMBER" &&
                                          arr[i - 1]?.role !== "MEMBER" && (
                                            <p
                                              className={
                                                styles_tree_p.treepoints_owner
                                              }
                                            >
                                              Members
                                            </p>
                                          )}
                                        <div
                                          className={
                                            styles_tree_p.treepoints_box_row_users
                                          }
                                        >
                                          <div
                                            className={
                                              styles_tree_p.treePoints_box_avatar
                                            }
                                          >
                                            <Image
                                              src={
                                                member.user?.avatar ??
                                                "https://picsum.photos/300/300"
                                              }
                                              alt="friend_avatar"
                                              width={"40px"}
                                              height={"40px"}
                                              className={cn(
                                                styles_tree_p.treePoints_box_avatar,
                                                styles_p.profile_avatar
                                              )}
                                            />
                                          </div>
                                          <p>{member.user.username}</p>
                                          <div>
                                            {localStorage.getItem("userId") !==
                                            member.userId ? (
                                              <div
                                                className={
                                                  styles_tree_p.treepoints_settings
                                                }
                                                onClick={() => {
                                                  setGroupBox(true);
                                                  setUserStatus(
                                                    arr.find(
                                                      (item: any) =>
                                                        item.user.id ===
                                                        localStorage.getItem(
                                                          "userId"
                                                        )
                                                    ).role
                                                  );
                                                  setRoomUser(member);
                                                }}
                                              >
                                                <Image
                                                  src="/settings_icon.svg"
                                                  alt="invete_player_icon"
                                                  width={"20px"}
                                                  height={"20px"}
                                                />
                                              </div>
                                            ) : (
                                              <PersonSharp
                                                color={"#ffffff"}
                                                height="20px"
                                                width="20px"
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              {addFriends &&
                                friends?.map((friend: any, i: number) => {
                                  return (
                                    <div key={i}>
                                      <div
                                        className={
                                          styles_tree_p.treepoints_box_row
                                        }
                                        onClick={() => {
                                          socket?.emit("add_member", {
                                            userToAddId: friend?.id,
                                            roomId: currentConv?.roomId,
                                          });
                                        }}
                                      >
                                        <div
                                          className={
                                            styles_tree_p.treePoints_box_avatar
                                          }
                                        >
                                          <Image
                                            src={
                                              friend?.avatar ??
                                              "https://picsum.photos/300/300"
                                            }
                                            alt="friend_avatar"
                                            width={"40px"}
                                            height={"40px"}
                                            className={cn(
                                              styles_tree_p.treePoints_box_avatar,
                                              styles_p.profile_avatar
                                            )}
                                          />
                                        </div>
                                        <p>{friend?.username}</p>
                                        <AddOutline
                                          color={"#ffffff"}
                                          height="30px"
                                          width="30px"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              {addFriends && (
                                <div
                                  className={styles.add_leave_btn}
                                  onClick={() => {
                                    setGroupBox(false);
                                    setAddFriends(false);
                                  }}
                                >
                                  <ReturnUpBackOutline
                                    color={"#ffffff"}
                                    height="30px"
                                    width="30px"
                                  />
                                  <p>go back</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )
                    }
                  />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

export const getServerSideProps = requireAuthentication(async () => {
  return {
    props: {}, // will be passed to the page component as props
  };
});
