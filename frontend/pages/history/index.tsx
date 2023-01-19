import styles_box from "../../styles/style_box.module.css";
import styles from "../../styles/friends.module.css";
import styles_h from "../../styles/history.module.css";
import SettingsNav from "../../components/settings_nav";
import HistoryBox from "../../components/history_box";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../components/menuNav";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";
import axios from "axios";
import { DataContext } from "../_app";

const History = () =>
{
  const [ inputForm, setInputForm ] = useState( "" );
  const [ data, setData ] = useContext( DataContext );
  const [ menu, setMenu ] = useState( false );
  const [ history, setHistory ] = useState( [
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
  ] );

  // useEffect( () =>
  // {
  //   axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/game/${ data.id }/history`,
  //     { withCredentials: true } )
  //     .then( ( res ) =>
  //     {
  //       setHistory( res.data );
  //       console.log( 'res: ', res );
  //     } )
  //     .catch( ( error ) =>
  //     {
  //       console.log( 'error: ', error );
  //     } )
  // }, [] )

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "history" } menu={ menu } />
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
                setInputForm( e.target.value.trim() );
              } }
              value={ inputForm }
              maxLength={ 16 }
            ></input>
          </form>
          <div className={ styles.friends }>
            <HistoryBox history={ history }></HistoryBox>
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