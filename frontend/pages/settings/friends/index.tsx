import cn from "classnames";
import styles from "../../../styles/friends.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import Image from "next/image";
import Friends_box from "../../../components/friend_box";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../../components/menuNav";
import axios from "axios";
import { useRouter } from "next/router";
import { LastBlockedContext } from "../../_app";

const History = () =>
{

  const [ menu, setMenu ] = useState( false );
  const [ inputForm, setInputForm ] = useState( "" );
  const [ lastBlockedId, setLastBlockedId ] = useContext( LastBlockedContext );
  const [ friends, setFriends ] = useState( [] );

  useEffect( () =>
  {
    axios.get( "http://localhost:9000/api/user/all", {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setFriends( res.data );
      console.log( 'friends: ', res.data );
    } ).catch( ( err ) =>
    {
      console.log( err );
    } );
  }, [ lastBlockedId ] );

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "friends" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <div className={ cn( styles_s_l.setting_btn, styles_s_l.current_btn, styles_box.logout_btn ) }>logout</div>
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
              onChange={ ( e ) =>
              {
                setInputForm( e.target.value );
              } }
              value={ inputForm }
            ></input>
          </form>
          <div className={ styles.friends }>
            <Friends_box
              friends={ friends.filter( ( ele: any ) =>
              {
                return ele.username.toLowerCase().includes( inputForm );
              } ) }
            ></Friends_box>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
