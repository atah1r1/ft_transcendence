import cn from "classnames";
import styles from "../../styles/profile.module.css";
import styles_f from "../../styles/friends.module.css";
import styles_box from "../../styles/style_box.module.css";
import styles_st from "../../styles/statistics.module.css";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import MenuNav from "../../components/menuNav";
import SettingsNav from "../../components/settings_nav";
import { useRouter } from "next/router";
import axios from "axios";
import requireAuthentication from "../../hooks/requiredAuthentication";
import Logout from "../../components/logout";
import ErrorPage from 'next/error';
import Loading from '../../components/Loading';
import HistoryBox from "../../components/history_box";
import { AddCircleOutline, ChatbubbleOutline, GameControllerOutline, PersonCircleOutline, RemoveCircleOutline } from "react-ionicons";
import { LastBlockedContext, SocketContext } from "../_app";

const FriendProfile = () =>
{
  const socket = useContext( SocketContext );
  const [ lastBlockedId, setLastBlockedId ] = useContext( LastBlockedContext );
  const [ friends, setFriends ] = useState( [] );
  const [ profileFriend, setProfileFriend ] = useState(
    {
      avatar: null,
      code_verified: false,
      createdAt: "",
      first_name: "",
      id: "",
      intra_name: "",
      isFriend: true,
      last_name: "",
      two_factor_auth: false,
      two_factor_auth_uri: null,
      updatedAt: "",
      username: "",
    }
  );
  const [ history, setHistory ] = useState( [] );
  const [ friendHistory, setFriendHistory ] = useState( [] );
  const [ notFound, setNotFound ] = useState( true );
  const [ loading, setLoading ] = useState( true );
  const [ data, setData ] = useState(
    {
      avatar: "",
      createdAt: "",
      first_name: "",
      id: "",
      last_name: "",
      two_factor_auth: false,
      updateAt: "",
      username: "",
    }
  );
  const [ menu, setMenu ] = useState( false );
  const router = useRouter()
  const { id } = router.query;

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/game/${ data.id }/history`,
      { withCredentials: true } )
      .then( ( res ) =>
      {
        setHistory( res.data );
        console.log( 'history: ', res.data );
      } )
      .catch( ( error ) =>
      {
        console.log( 'error: ', error );
      } )
  }, [ data.id ] )

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/game/${ id }/history`,
      { withCredentials: true } )
      .then( ( res ) =>
      {
        setFriendHistory( res.data );
        console.log( 'fr_history: ', res.data );
      } )
      .catch( ( error ) =>
      {
        console.log( 'error: ', error );
      } )
  }, [ id ] )

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/${ id }`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setData( res.data );
      setNotFound( false );
    } ).catch( ( err ) =>
    {
      console.log( 'error', err );
    } ).finally( () =>
    {
      setLoading( false );
    } )
  }, [] )

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/all`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setProfileFriend( res.data.filter( ( ele: any ) => ele.id === id )[ 0 ] );
      setFriends( res.data );
    } ).catch( ( err ) =>
    {
      console.log( err );
    } );
  }, [ lastBlockedId ] );
  console.log( profileFriend )

  if ( loading )
  {
    return <Loading />
  }

  if ( notFound )
  {
    return (
      <ErrorPage statusCode={ 404 } />
    )
  }

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <div className={ styles.details }>
            <Logout />
            <div className={ styles.details_up }>
              <div className={ styles.details_level }>
                <p>LEVEL</p>
                <span> 2</span>
              </div>
              <div className={ styles.details_avatar }>
                <div className={ styles.profile_box }>
                  <Image
                    src={ data?.avatar || "https://picsum.photos/300/300" }
                    alt="avatar"
                    width="180px"
                    height="180px"
                    className={ styles.profile_avatar }
                  ></Image>
                </div>
                { <p>{ data?.username }</p> }
              </div>
              <div className={ cn( styles_f.friends_options, styles_f.left ) }>
                <div onClick={ () =>
                {
                  socket?.emit( "play_against", { targetUserId: id } );
                } }>
                  <GameControllerOutline
                    color={ '#ffffff' }
                    height="36px"
                    width="36px"
                  />
                </div>
                {
                  profileFriend.isFriend === false &&
                  <div onClick={ () =>
                  {
                    socket?.emit( "create_dm", { otherUserId: id } );
                  } }>
                    <AddCircleOutline
                      color={ '#ffffff' }
                      height="36px"
                      width="36px"
                    />
                  </div>
                }
                {
                  profileFriend.isFriend === true &&
                  <div onClick={ () =>
                  {
                    socket?.emit( "create_dm", { otherUserId: id } );
                  } }>
                    <ChatbubbleOutline
                      color={ '#ffffff' }
                      height="36px"
                      width="36px"
                    />
                  </div>
                }
                <div onClick={ () =>
                {
                  socket?.emit( "block_user", { targetUserId: id } );
                } }>
                  <RemoveCircleOutline
                    color={ '#ffffff' }
                    height="36px"
                    width="36px"
                  />
                </div>
              </div>
            </div>
            <div className={ styles.details_down }>
              <div className={ styles.box }>
                <div className={ styles.fr_avatars }>
                  <p className={ styles.ach_text }>ACHIEVMENTS</p>
                  <div className={ styles.ach_medal }>
                    <div className={ cn( styles.ach_medal_box, `${ !friendHistory.length && styles_st.non_medal }` ) }>
                      <div className={ styles.ach_goal }>first match</div>
                      <Image
                        src="/ach1.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                    <div className={ cn( styles.ach_medal_box, styles_st.non_medal ) }>
                      <div className={ styles.ach_goal }></div>
                      <Image
                        src="/ach2.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                    <div className={ cn( styles.ach_medal_box, styles_st.non_medal ) }>
                      <div className={ styles.ach_goal }></div>
                      <Image
                        src="/ach3.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                    <div className={ cn( styles.ach_medal_box, styles_st.non_medal ) }>
                      <div className={ styles.ach_goal }></div>
                      <Image
                        src="/ach4.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                  </div>
                </div>
                <div className={ styles.fr_statistic }>
                  <div className={ styles_st.right }>
                    <p className={ styles_st.title }>MATCH PLAYED</p>
                    <p className={ styles_st.match_number }>50</p>
                    <div className={ styles_st.def_vic_box }>
                      <div className={ styles_st.defeat_box }>
                        <p className={ styles_st.defeat_text }>DEFEAT</p>
                        <p className={ styles_st.defeat_number }>20</p>
                      </div>
                      <div className={ styles_st.victory_box }>
                        <p className={ styles_st.victory_text }>VICTORY</p>
                        <p className={ styles_st.victory_number }>30</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={ styles.fr_history }>
                <HistoryBox history={ history } id={ data.id }></HistoryBox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendProfile;

export const getServerSideProps = requireAuthentication( async () =>
{
  return {
    props: {
    }, // will be passed to the page component as props
  }
} )