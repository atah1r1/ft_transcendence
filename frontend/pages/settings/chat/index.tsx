import cn from "classnames";
import styles from "../../../styles/chat.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import styles_r_w from "../../../styles/chatroom_window.module.css";
import styles_tree_p from "../../../styles/treeProints.module.css";
import SettingsNav from "../../../components/settings_nav";
import ConversationBox from "../../../components/conversation_box";
import styles_c_b from "../../../styles/conversation_box.module.css";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import ClickOutsidePoints from "../../../components/clickOutsidePoints";
import TreePointsBox from "../../../components/treePoint_box";
import { CurrentConvContext, OnlineFriendsContext, SocketContext } from "../../_app";
import MenuNav from "../../../components/menuNav";
import { CloseSharp, LockClosedSharp } from "react-ionicons";
import ConversationBody from "../../../components/conversation_body";
import type { AppProps } from 'next/app'
import { withRouter } from "next/router";
import axios from "axios";
import { LastBlockedContext } from "../../../pages/_app";

const Chat = ( { router }: AppProps ) =>
{

  const socket = useContext( SocketContext );
  const [ onlineFriends, setOnlineFriends ] = useContext( OnlineFriendsContext );
  const [ group_box_index, set_g_b_i ] = useState( 0 );
  const [ currentConv, setCurrentConv ] = useContext( CurrentConvContext );
  const [ roomMembers, setRoomMembers ] = useState( [] );
  const [ value, setValue ] = useState( '' );
  const [ lastBlockedId, setLastBlockedId ] = useContext( LastBlockedContext );
  const handleChange = ( e: any ) =>
  {
    const result = e.target.value.replace( /\D/g, '' );
    setValue( result );
  };

  const [ room, setRoom ] = useState( false );
  const [ creat_room, setCreat_room ] = useState( false );
  const [ join_room, setJoin_room ] = useState( false );
  const [ protected_room, setProtected_room ] = useState( false );

  const [ chatroomInputs, setChatroomInputs ] = useState( {
    groupName: "",
    groupType: "PUBLIC",
    password: "",
  } );

  const handleSubmitGroup = ( e: any ) =>
  {
    e.preventDefault();
    socket?.emit( "create_room", {
      name: chatroomInputs.groupName,
      privacy: chatroomInputs.groupType,
      password: chatroomInputs.password,
      image: `https://ui-avatars.com/api/?name=${ chatroomInputs.groupName }`,
    } );
    setChatroomInputs( {
      groupName: "",
      groupType: "PUBLIC",
      password: "",
    } );
    setJoin_room( false );
    setRoom( false );
    setProtected_room( false );
    setCreat_room( false );
  };

  const [ searchInput, setSearchInput ] = useState( "" );

  const [ treePoints, setTreePoints ] = useState( false );
  const [ group_box, setGroupBox ] = useState( false );
  const [ menu, setMenu ] = useState( false );

  useEffect( () =>
  {
    if ( !currentConv?.roomId ) return;
    axios.get( `http://localhost:9000/api/chat/room/${ currentConv.roomId }/members`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setRoomMembers( res.data );
    } ).catch( ( err ) =>
    {
      console.log( 'error: ', err );
    } );
  }, [ currentConv ] );

  useEffect( () =>
  {
    setTreePoints( false );
  }, [ lastBlockedId ] );

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
                  <option value="PUBLIC">public</option>
                  <option value="PROTECTED">protected</option>
                  <option value="PRIVATE">private</option>
                </select>
              </div>
            }
            { chatroomInputs.groupType === "PROTECTED" && creat_room && (
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
                    } )
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
      ) }
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
                <ConversationBox />
              </div>
              <div className={ styles.l_part_tree }>
                {
                  onlineFriends.map( ( friend: any ) =>
                  {
                    return (
                      <div key={ friend } className={ styles.online }>
                        <Image
                          src={ friend?.avatar ?? "https://picsum.photos/300/300" }
                          alt="online_friend_img"
                          width={ "34px" }
                          height={ "34px" }
                          layout={ "fixed" }
                        ></Image>
                      </div>
                    )

                  } )
                }
              </div>
            </div>
            <div className={ styles.chat_right }>
              <div className={ styles.conversation_head }>
                {
                  Object.keys( currentConv ).length !== 0 &&
                  <>
                    <p
                      onClick={ () =>
                      {
                        if ( currentConv.isDm )
                        {
                          router.push( {
                            pathname: '/profile',
                            query: {
                              avatar: currentConv?.avatar,
                              username: currentConv?.name
                            }
                          } )
                        }
                      } }
                      className={ cn(
                        styles_c_b.conversation_name,
                        styles_c_b.conversation_name_current
                      ) }
                    >
                      { currentConv?.name }
                    </p>
                    <div
                      className={ styles_tree_p.conversation_head_treepoints }
                      onClick={ () => setTreePoints( !treePoints ) }
                    >
                      ...
                    </div>
                  </>
                }
              </div>
              <div className={ styles.test }>
                <ConversationBody />
                {
                  <ClickOutsidePoints
                    setTreePoints={ setTreePoints }
                    setGroupBox={ setGroupBox }
                    content={ treePoints && currentConv.isDm ? (
                      <TreePointsBox />
                    ) : (

                      treePoints &&
                      <div className={ styles.treePointsContent }>
                        <div className={ styles_tree_p.treepoints_box }>
                          { roomMembers?.map(
                            ( member: any, i: number ) =>
                            {
                              return (
                                <div
                                  key={ i }
                                >
                                  {
                                    member.user.id === localStorage.getItem( 'userId' ) &&
                                    <p className={ styles_tree_p.treepoints_owner }>Owner</p>
                                  }
                                  {
                                    i === 1 && <p className={ styles_tree_p.treepoints_owner }>Memebers</p>
                                  }

                                  <div className={ styles_tree_p.treepoints_box_row }>
                                    <div
                                      className={
                                        styles_tree_p.treePoints_box_avatar
                                      }
                                    >
                                      <Image
                                        src={ member.user?.avatar ?? "https://picsum.photos/300/300" }
                                        alt="friend_avatar"
                                        width={ "40px" }
                                        height={ "40px" }
                                        className={
                                          styles_tree_p.treePoints_box_avatar
                                        }
                                      />
                                    </div>
                                    <p>{ member.user.username }</p>
                                    <div onClick={ () =>
                                    {
                                      setGroupBox( true );
                                      set_g_b_i( i );
                                    } }
                                      className={ styles_tree_p.treepoints_settings }>
                                      <Image
                                        src="/settings_icon.svg"
                                        alt="invete_player_icon"
                                        width={ "20px" }
                                        height={ "20px" }
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          ) }
                        </div>
                      </div>
                    ) } />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter( Chat );
