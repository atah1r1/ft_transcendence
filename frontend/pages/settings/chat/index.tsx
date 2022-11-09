import cn from "classnames";
import styles from "../../../styles/chat.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import styles_r_w from "../../../styles/chatroom_window.module.css";
import styles_tree_p from "../../../styles/treeProints.module.css";
import SettingsNav from "../../../components/settings_nav";
import ConversationBox from "../../../components/conversation_box";
import styles_c_b from "../../../styles/conversation_box.module.css";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ClickOutsidePoints from "../../../components/clickOutsidePoints";
import TreePointsBox from "../../../components/treePoint_box";
import MenuNav from "../../../components/menuNav";

const Chat = () =>
{
  const [ menu, setMenu ] = useState( false );
  const [ group_box_index, set_g_b_i ] = useState( 0 );

  const [ currentConv, setCurrentConv ] = useState( { group_user: [] } );

  const [ conversationsBox, setConversationsBox ] = useState( [
    {
      group_user: [
        {
          image: "https://cdn.intra.42.fr/users/mokellat.jpg",
          fullName: "Mohammed Ali",
        },
        {
          image: "https://cdn.intra.42.fr/users/ojoubout.jpg",
          fullName: "Oussama JOUBOUTI",
        },
        {
          image: "https://cdn.intra.42.fr/users/atahiri.jpg",
          fullName: "Amine TAHIRI",
        },
        {
          image: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
          fullName: "Brahim SANAOUI",
        },
        {
          image: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
          fullName: "Ismail BOUHIRI",
        },
        {
          image: "https://cdn.intra.42.fr/users/mokellat.jpg",
          fullName: "Mohammed Ali",
        },
        {
          image: "https://cdn.intra.42.fr/users/ojoubout.jpg",
          fullName: "Oussama JOUBOUTI",
        },
        {
          image: "https://cdn.intra.42.fr/users/atahiri.jpg",
          fullName: "Amine TAHIRI",
        },
        {
          image: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
          fullName: "Brahim SANAOUI",
        },
        {
          image: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
          fullName: "Ismail BOUHIRI",
        },
      ],
      group_name: "Group TRANDANDANE",
      group_image: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      lastMessage: "wa fin a sat",
      lastTime: "3:16PM",
      messageNumber: "2",
      group: true,
    },
    {
      image: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "Yassine HADARI",
      lastMessage: "wa fin a sat",
      lastTime: "3:16PM",
      messageNumber: "2",
    },
    {
      image: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "Brahim SANAOUI",
      lastMessage: "wa fin a sat bikher",
      lastTime: "5:34PM",
      messageNumber: "1",
    },
    {
      image: "https://cdn.intra.42.fr/users/mbrija.jpg",
      fullName: "Mohammed BRIJA",
      lastMessage: "ach daro m3ak mazal",
      lastTime: "11:34PM",
      messageNumber: "6",
    },
    {
      image: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "Zakariya SIDKI",
      lastMessage: "wa fin a sat",
      lastTime: "3:16PM",
      messageNumber: "3",
    },
    {
      image: "https://cdn.intra.42.fr/users/ojoubout.jpg",
      fullName: "Oussama JOUBOUTI",
      lastMessage: "ach daro m3ak mazal",
      lastTime: "11:34PM",
      messageNumber: "6",
    },
    {
      image: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      fullName: "Ismail BOUHIRI",
      lastMessage: "ach daro m3ak mazal",
      lastTime: "11:34PM",
      messageNumber: "6",
    },
    {
      image: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "Amine tahiri",
      lastMessage: "ach daro m3ak mazal",
      lastTime: "11:34PM",
      messageNumber: "6",
    },
  ] );

  const getSenderInfo = ( senderInfo: any ) =>
  {
    setMessages( senderInfo );
  };

  const [ messages, setMessages ] = useState( [
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
  ] );

  const [ messageInput, setMessageInput ] = useState( "" );
  const handleSubmitMessages = ( e: any ) =>
  {
    e.preventDefault();
    if ( messageInput )
      setMessages( [
        ...messages,
        {
          sender: true,
          message: messageInput,
          time: "Today at 17:15",
          avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
          fullName: "Amine tahiri",
        },
      ] );
    setMessageInput( "" );
  };

  const [ chat_room, setChat_room ] = useState( false );

  const [ chatroomInputs, setChatroomInputs ] = useState( {
    groupName: "",
    groupType: "public",
    password: "",
  } );
  const handleSubmitGroup = ( e: any ) =>
  {
    e.preventDefault();
    console.log( chatroomInputs );
    setChatroomInputs( {
      groupName: "",
      groupType: "public",
      password: "",
    } );
    setChat_room( false );
  };

  const [ searchInput, setSearchInput ] = useState( "" );

  const [ treePoints, setTreePoints ] = useState( false );
  const [ group_box, setGroupBox ] = useState( false );

  return (
    <div>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      { chat_room && (
        <div className={ styles_r_w.add_btn_window }>
          <div className={ styles_r_w.part_up }>
            <div className={ styles_r_w.text }>CREATE A CHAT ROOM</div>
            <div
              className={ styles_r_w.remove }
              onClick={ () => setChat_room( false ) }
            >
              X
            </div>
          </div>
          <form onSubmit={ handleSubmitGroup }>
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
            { chatroomInputs.groupType === "protected" && (
              <div>
                <label>password</label>
                <input
                  type="password"
                  placeholder="************"
                  required
                  value={ chatroomInputs.password }
                  onChange={ ( e ) =>
                    setChatroomInputs( {
                      ...chatroomInputs,
                      password: e.target.value,
                    } )
                  }
                ></input>
              </div>
            ) }
            <div className={ styles_r_w.part_down }>
              <div
                className={ styles_r_w.cancel }
                onClick={ () => setChat_room( false ) }
              >
                CANCEL
              </div>
              <button className={ styles_r_w.create } type="submit">
                CREATE
              </button>
            </div>
          </form>
        </div>
      ) }
      <div
        className={ cn( styles_box.container, chat_room && styles_r_w.chat_room ) }
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
                    onClick={ () => setChat_room( true ) }
                  >
                    +
                  </div>
                </div>
                <form
                  className={ styles.search }
                  onSubmit={ ( e ) =>
                  {
                    e.preventDefault();
                  } }
                >
                  <input
                    type="search"
                    placeholder="Search..."
                    onChange={ ( e ) => setSearchInput( e.target.value ) }
                  ></input>
                </form>
              </div>
              <div className={ styles.l_part_two }>
                <ConversationBox
                  conversations={
                    searchInput
                      ? conversationsBox.filter( ( conv ) =>
                      {
                        if ( conv.hasOwnProperty( "group" ) )
                          return conv.group_name
                            ?.toLowerCase()
                            .includes( searchInput );
                        else
                          return conv.fullName
                            ?.toLowerCase()
                            .includes( searchInput );
                      } )
                      : conversationsBox
                  }
                  getSenderInfo={ getSenderInfo }
                  messages={ messages }
                  setCurrent_conv={ setCurrentConv }
                />
              </div>
              <div className={ styles.l_part_tree }>
                <div className={ styles.online }>
                  <Image
                    src="https://cdn.intra.42.fr/users/bsanaoui.jpg"
                    alt="online_friend_img"
                    width={ "34px" }
                    height={ "34px" }
                    layout={ "fixed" }
                  ></Image>
                </div>
              </div>
            </div>
            <div className={ styles.chat_right }>
              <ClickOutsidePoints
                setTreePoints={ setTreePoints }
                setGroupBox={ setGroupBox }
                content={
                  treePoints && !currentConv.hasOwnProperty( "group" ) ? (
                    <TreePointsBox />
                  ) : (
                    treePoints &&
                    currentConv.hasOwnProperty( "group" ) && (
                      <div>
                        <div className={ styles_tree_p.treepoints_box }>
                          { currentConv.group_user?.map(
                            ( user: any, i: number ) =>
                            {
                              return (
                                !user.hasOwnProperty( "me" ) && (
                                  <div
                                    key={ i }
                                    className={ styles_tree_p.treepoints_box_row }
                                    onClick={ () =>
                                    {
                                      setGroupBox( true );
                                      set_g_b_i( i );
                                    } }
                                  >
                                    <div
                                      className={
                                        styles_tree_p.treePoints_box_avatar
                                      }
                                    >
                                      <Image
                                        src={ user.image }
                                        alt="friend_avatar"
                                        width={ "40px" }
                                        height={ "40px" }
                                        className={
                                          styles_tree_p.treePoints_box_avatar
                                        }
                                      />
                                    </div>
                                    <p>{ user.fullName }</p>
                                    <Image
                                      src="/settings_icon.svg"
                                      alt="invete_player_icon"
                                      width={ "20px" }
                                      height={ "20px" }
                                    />
                                  </div>
                                )
                              );
                            }
                          ) }
                        </div>
                        { group_box && (
                          <TreePointsBox
                            group_box={ group_box }
                            group_box_i={ group_box_index }
                          />
                        ) }
                      </div>
                    )
                  )
                }
              />
              <div className={ styles.conversation_head }>
                <p
                  className={ cn(
                    styles_c_b.conversation_name,
                    styles_c_b.conversation_name_current
                  ) }
                >
                  { messages[ 0 ].fullName }
                </p>
                <div
                  className={ styles_tree_p.conversation_head_treepoints }
                  onClick={ () => setTreePoints( true ) }
                >
                  ...
                </div>
              </div>
              <div className={ styles.conversation_body }>
                <div className={ styles.message_part_content }>
                  { messages.map( ( message, i ) =>
                  {
                    return (
                      <div className={ styles.message_left } key={ i }>
                        <div className={ styles.message_box }>
                          <div className={ styles.message_avatar }>
                            <Image
                              src={ message.avatar }
                              alt="message_avatar"
                              width={ "42px" }
                              height={ "42px" }
                            />
                          </div>
                          <div style={ { width: "100%" } }>
                            <div className={ styles.message_nametime_box }>
                              <div className={ styles.message_fullName }>
                                { message.fullName }
                              </div>
                              <div className={ styles.message_time }>
                                { message.time }
                              </div>
                            </div>
                            <div className={ styles.message_text }>
                              { message.message }
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } ) }
                </div>
                <div className={ styles.message_part_send }>
                  <div className={ styles.message_box_sender }>
                    <form
                      className={ styles.message_form }
                      onSubmit={ handleSubmitMessages }
                    >
                      <input
                        type="search"
                        placeholder="Type a message here ."
                        onChange={ ( e ) => setMessageInput( e.target.value ) }
                        value={ messageInput }
                      ></input>
                    </form>
                  </div>
                  <div
                    className={ styles.message_send }
                    onClick={ handleSubmitMessages }
                  >
                    <Image
                      src="/send_icon.svg"
                      alt="send_message_icon"
                      width={ "20%" }
                      height={ "20%" }
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
