import cn from "classnames";
import styles from "../../../styles/chat.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import styles_r_w from "../../../styles/chatroom_window.module.css";
import styles_tree_p from "../../../styles/treeProints.module.css";
import SettingsNav from "../../../components/settings_nav";
import ConversationBox from "../../../components/conversation_box";
import styles_c_b from "../../../styles/conversation_box.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ClickOutsidePoints from "../../../components/clickOutsidePoints";
import TreePointsBox from "../../../components/treePoint_box";
import axios from "axios";
import { ChatContext } from "../../../stores/chat_store";
import { SocketContext } from "../../_app";
import MenuNav from "../../../components/menuNav";
import { CloseSharp, LockClosedSharp } from "react-ionicons";

const Chat = () => {
  const [chats, setChats] = useContext(ChatContext);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/chats`, {
      withCredentials: true,
    }).then((res) => {
      setChats(res.data);
      console.log(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  useEffect(() => {

  }, []);

  const socket = useContext(SocketContext);

  const [group_box_index, set_g_b_i] = useState(0);

  const [currentConv, setCurrentConv] = useState({ group_user: [] });

  const [ value, setValue ] = useState( '' );
  const handleChange = ( e: any ) =>
  {
    const result = e.target.value.replace( /\D/g, '' );

    setValue( result );
  };

  const getSenderInfo = ( senderInfo: any ) =>
  {
    setMessages( senderInfo );
  };

  const [messages, setMessages] = useState([
    {
      sender: false,
      message: "..",
      time: "Today at 17:15",
      avatar: "",
      fullName: "",
    },
    {
      sender: false,
      message:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum unde exceptuchite",
      time: "Today at 17:15",
      avatar: "",
      fullName: "",
    },
  ]);

  const [messageInput, setMessageInput] = useState("");
  const handleSubmitMessages = (e: any) => {
    e.preventDefault();
    if (messageInput)
      setMessages([
        ...messages,
        {
          sender: true,
          message: messageInput,
          time: "Today at 17:15",
          avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
          fullName: "Amine tahiri",
        },
      ]);
    setMessageInput("");
  };

  const [chat_room, setChat_room] = useState(false);
  const [ room, setRoom ] = useState( false );
  const [ creat_room, setCreat_room ] = useState( false );
  const [ join_room, setJoin_room ] = useState( false );
  const [ protected_room, setProtected_room ] = useState( false );

  const [chatroomInputs, setChatroomInputs] = useState({
    groupName: "",
    groupType: "PUBLIC",
    password: "",
  });

  const handleSubmitGroup = (e: any) => {
    e.preventDefault();
    console.log(chatroomInputs);
    // do something with the data
    socket?.emit("create_room", {
      name: chatroomInputs.groupName,
      privacy: chatroomInputs.groupType,
      password: chatroomInputs.password,
      image: `https://ui-avatars.com/api/?name=${chatroomInputs.groupName}`,
    });
    setChatroomInputs({
      groupName: "",
      groupType: "PUBLIC",
      password: "",
    });
    setChat_room(false);
  };

  const [searchInput, setSearchInput] = useState("");

  const [treePoints, setTreePoints] = useState(false);
  const [group_box, setGroupBox] = useState(false);

  const [menu, setMenu] = useState(false);

  return (
    <div>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      { room && (
        <div className={ styles_r_w.add_btn_window }>
          <div className={ styles_r_w.part_up }>
            { room && !creat_room && !join_room && !protected_room && <div className={ styles_r_w.text }>CREATE/JOIN A CHAT ROOM</div> }
            { creat_room && <div className={ styles_r_w.text }>CREATE A CHAT ROOM</div> }
            { join_room && !protected_room && <div className={ styles_r_w.text }>JOIN A CHAT ROOM</div> }
            { protected_room && <div className={ styles_r_w.text }>JOIN CHAT_PROTECTED</div> }
            <div
              className={ styles_r_w.remove }
              onClick={ () => { setCreat_room( false ); setJoin_room( false ); setRoom( false ); setProtected_room( false ) } }
            >
              <CloseSharp
                color={ '#ffffff' }
                height="40px"
                width="40px"
              />
            </div>
          </div>
          {
            room && !creat_room && !join_room && !protected_room &&
            <div className={ styles_r_w.creat_join_btn }>
              <div className={ styles_r_w.create } onClick={ () => setCreat_room( true ) }>CREAT A CHAT ROOM</div>
              <div className={ styles_r_w.create } onClick={ () => setJoin_room( true ) }>JOIN A CHAT ROOM</div>
            </div>
          }
          {
            join_room && !protected_room &&
            <div className={ cn( styles_r_w.creat_join_btn, styles_r_w.join_box ) }>
              <div className={ styles_r_w.create }
                onClick={ () => setProtected_room( true ) }>CHAT_PROTECTED
                <LockClosedSharp
                  color={ '#00000' }
                  height="30px"
                  width="30px"
                /></div>
              <div className={ styles_r_w.create }>CHAT_PUBLIC</div>
            </div>
          }
          {
            protected_room &&
            <div className={ cn( styles_r_w.creat_join_btn, styles_r_w.join_box, styles_r_w.join_protect ) }>
              <label>PASSWORD</label>
              <input type="text" placeholder="******" maxLength={ 6 } value={ value } onChange={ handleChange }></input>
            </div>
          }
          <form onSubmit={ handleSubmitGroup }>
            {
              creat_room &&
              <div>
                <label>group name</label>
                <input
                  type="text"
                  value={ chatroomInputs.groupName }
                  placeholder="pingpong"
                  required
                  onChange={ ( e ) =>
                    setChatroomInputs( {
                      ...chatroomInputs,
                      groupName: e.target.value,
                    } )
                  }
                ></input>
              </div>
            }
            {
              creat_room &&
              <div>
                <label>group type</label>
                <select
                  required
                  value={ chatroomInputs.groupType }
                  onChange={ ( e ) =>
                    setChatroomInputs( {
                      ...chatroomInputs,
                      groupType: e.target.value,
                    } )
                  }
                >
                  <option value="public">public</option>
                  <option value="protected">protected</option>
                  <option value="private">private</option>
                </select>
              </div>
            }
            { chatroomInputs.groupType === "protected" && creat_room && (
              <div>
                <label>password</label>
                <input
                  type="password"
                  placeholder="************"
                  required
                  value={ chatroomInputs.password }
                  maxLength={ 16 }
                  onChange={ ( e ) =>
                    setChatroomInputs( {
                      ...chatroomInputs,
                      password: e.target.value,
                    })
                  }
                ></input>
              </div>
            ) }
            <div className={ styles_r_w.part_down }>
              {
                room && !creat_room && !join_room && !protected_room &&
                <div
                  className={ styles_r_w.cancel }
                  onClick={ () => { setCreat_room( false ); setRoom( false ) } }
                >
                  CANCEL
                </div>
              }
              {
                ( creat_room || join_room || protected_room ) &&
                <div
                  className={ styles_r_w.cancel }
                  onClick={ () =>
                  {
                    creat_room && setCreat_room( false );
                    join_room && !protected_room && setJoin_room( false );
                    protected_room && setProtected_room( false )
                  } }
                >
                  BACK
                </div>
              }
              {
                creat_room &&
                <button className={ styles_r_w.create } type="submit">
                  CREATE
                </button>
              }
              {
                protected_room &&
                <button className={ styles_r_w.create }>
                  JOIN
                </button>
              }
            </div>
          </form>
        </div>
      )}
      <div
        className={ cn( styles_box.container, room && styles_r_w.room ) }
      >
        <SettingsNav selected={ "chat" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <div className={ cn( styles_s_l.setting_btn, styles_s_l.current_btn, styles_box.logout_btn ) }>logout</div>
          <div className={ styles.chat_box }>
            <div className={ styles.chat_left }>
              <div className={ styles.l_part_one }>
                <div className={ styles.chat_plus }>
                  <p>CHATS</p>
                  <div
                    className={ styles.plus_btn }
                    onClick={ () => setRoom( true ) }
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
                    type="search"
                    placeholder="Search..."
                    onChange={(e) => setSearchInput(e.target.value)}
                  ></input>
                </form>
              </div>
              <div className={styles.l_part_two}>
                <ConversationBox
                  conversations={chats}
                  getSenderInfo={getSenderInfo}
                  messages={messages}
                  setCurrent_conv={setCurrentConv}
                />
              </div>
              <div className={styles.l_part_tree}>
                <div className={styles.online}>
                  <Image
                    src="https://cdn.intra.42.fr/users/bsanaoui.jpg"
                    alt="online_friend_img"
                    width={"34px"}
                    height={"34px"}
                    layout={"fixed"}
                  ></Image>
                </div>
              </div>
            </div>
            <div className={styles.chat_right}>
              <ClickOutsidePoints
                setTreePoints={setTreePoints}
                setGroupBox={setGroupBox}
                content={
                  treePoints && !currentConv.hasOwnProperty("group") ? (
                    <TreePointsBox />
                  ) : (
                    treePoints &&
                    currentConv.hasOwnProperty("group") && (
                      <div>
                        <div className={styles_tree_p.treepoints_box}>
                          {currentConv.group_user?.map(
                            (user: any, i: number) => {
                              return (
                                !user.hasOwnProperty("me") && (
                                  <div
                                    key={i}
                                    className={styles_tree_p.treepoints_box_row}
                                    onClick={() => {
                                      setGroupBox(true);
                                      set_g_b_i(i);
                                    }}
                                  >
                                    <div
                                      className={
                                        styles_tree_p.treePoints_box_avatar
                                      }
                                    >
                                      <Image
                                        src={user.image}
                                        alt="friend_avatar"
                                        width={"40px"}
                                        height={"40px"}
                                        className={
                                          styles_tree_p.treePoints_box_avatar
                                        }
                                      />
                                    </div>
                                    <p>{user.fullName}</p>
                                    <Image
                                      src="/settings_icon.svg"
                                      alt="invete_player_icon"
                                      width={"20px"}
                                      height={"20px"}
                                    />
                                  </div>
                                )
                              );
                            }
                          )}
                        </div>
                        {group_box && (
                          <TreePointsBox
                            group_box={group_box}
                            group_box_i={group_box_index}
                          />
                        )}
                      </div>
                    )
                  )
                }
              />
              <div className={styles.conversation_head}>
                <p
                  className={cn(
                    styles_c_b.conversation_name,
                    styles_c_b.conversation_name_current
                  )}
                >
                  {messages[0].fullName}
                </p>
                <div
                  className={styles_tree_p.conversation_head_treepoints}
                  onClick={() => setTreePoints(true)}
                >
                  ...
                </div>
              </div>
              <div className={styles.conversation_body}>
                <div className={styles.message_part_content}>
                  {messages.map((message, i) => {
                    return (
                      <div className={styles.message_left} key={i}>
                        <div className={styles.message_box}>
                          <div className={styles.message_avatar}>
                            <Image
                              src={message.avatar}
                              alt="message_avatar"
                              width={"42px"}
                              height={"42px"}
                            />
                          </div>
                          <div style={{ width: "100%" }}>
                            <div className={styles.message_nametime_box}>
                              <div className={styles.message_fullName}>
                                {message.fullName}
                              </div>
                              <div className={styles.message_time}>
                                {message.time}
                              </div>
                            </div>
                            <div className={styles.message_text}>
                              {message.message}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.message_part_send}>
                  <div className={styles.message_box_sender}>
                    <form
                      className={styles.message_form}
                      onSubmit={handleSubmitMessages}
                    >
                      <input
                        type="search"
                        placeholder="Type a message here ."
                        onChange={(e) => setMessageInput(e.target.value)}
                        value={messageInput}
                      ></input>
                    </form>
                  </div>
                  <div
                    className={styles.message_send}
                    onClick={handleSubmitMessages}
                  >
                    <Image
                      src="/send_icon.svg"
                      alt="send_message_icon"
                      width={"20%"}
                      height={"20%"}
                    ></Image>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
