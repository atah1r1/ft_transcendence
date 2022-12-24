import styles from "../../styles/friends.module.css";
import styles_box from "../../styles/style_box.module.css";
import SettingsNav from "../../components/settings_nav";
import Friends_box from "../../components/friend_box";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../components/menuNav";
import axios from "axios";
import { LastBlockedContext } from "../_app";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";

const History = () =>
{

  const [ menu, setMenu ] = useState( false );
  const [ inputForm, setInputForm ] = useState( "" );
  const [ lastBlockedId, setLastBlockedId ] = useContext( LastBlockedContext );
  const [ friends, setFriends ] = useState( [] );

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/all`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setFriends( res.data );
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
            <Friends_box
              friends={ friends.filter( ( friend: any ) => friend.username.toLowerCase().includes( inputForm ) ) }
            ></Friends_box>
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