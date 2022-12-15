import styles from "../../styles/friends.module.css";
import styles_box from "../../styles/style_box.module.css";
import SettingsNav from "../../components/settings_nav";
import Rooms_box from "../../components/rooms_box";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../components/menuNav";
import axios from "axios";
import { NewRoomContext } from "../_app";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";

const History = () =>
{
  const [ menu, setMenu ] = useState( false );
  const [ inputForm, setInputForm ] = useState( "" );
  const [ rooms, setRooms ] = useState( [] );
  const [ newRoom, setNewRoom ] = useContext( NewRoomContext );

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
  }, [ newRoom ] )

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "rooms" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <Logout />
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
            <Rooms_box rooms={ rooms.filter( ( room: any ) => room.name.toLowerCase().includes( inputForm ) ) }>
            </Rooms_box>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;

export const getServerSideProps = requireAuthentication( async () =>
{
  return {
    props: {
    }, // will be passed to the page component as props
  }
} )