import cn from "classnames";
import styles from "../../../styles/friends.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import Image from "next/image";
import Friends_box from "../../../components/friend_box";
import { useState } from "react";
import MenuNav from "../../../components/menuNav";

const History = () =>
{
  const [ menu, setMenu ] = useState( false );
  const [ inputForm, setInputForm ] = useState( "" );

  const [ friends, setFriends ] = useState( [
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      fullName: "HADARI YASSINE",
      userName: "YHADARI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "AMINE TAHIRI",
      userName: "ATAHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "BRAHIM SANAOUI",
      userName: "BSANAOUI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      fullName: "ISMAIL BOUHIRI",
      userName: "IBOUHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      fullName: "HADARI YASSINE",
      userName: "YHADARI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "AMINE TAHIRI",
      userName: "ATAHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "BRAHIM SANAOUI",
      userName: "BSANAOUI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      fullName: "ISMAIL BOUHIRI",
      userName: "IBOUHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      fullName: "HADARI YASSINE",
      userName: "YHADARI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "AMINE TAHIRI",
      userName: "ATAHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "BRAHIM SANAOUI",
      userName: "BSANAOUI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      fullName: "ISMAIL BOUHIRI",
      userName: "IBOUHIRI",
    },
  ] );

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
              friends={ friends.filter( ( ele ) =>
              {
                return ele.userName.toLowerCase().includes( inputForm );
              } ) }
            ></Friends_box>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
