import cn from "classnames";
import styles from "../../../styles/friends.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import Rooms_box from "../../../components/rooms_box";
import { useEffect, useState } from "react";
import MenuNav from "../../../components/menuNav";
import axios from "axios";

const History = () =>
{
  const [ menu, setMenu ] = useState( false );
  const [ inputForm, setInputForm ] = useState( "" );
  const [ rooms, setRooms ] = useState( [] );

  useEffect( () =>
  {
    axios.get( 'http://localhost:9000/api/chat/rooms', {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setRooms( res.data );
    } ).catch( ( err ) =>
    {
      console.log( err )
    } )
  }, [] )
  console.log( 'rooms is: ', rooms );
  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "rooms" } menu={ menu } />
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
            <Rooms_box rooms={ rooms }>
            </Rooms_box>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
