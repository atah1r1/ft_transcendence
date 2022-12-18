import cn from "classnames";
import { useRouter } from "next/router";
import styles from "../styles/profile.module.css";
import styles_box from "../styles/style_box.module.css";
import styles_s_l from "../styles/style_settings_nav.module.css";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { DataContext, UploadAvatarContext } from "../pages/_app";

const SettingsNav = ( { selected, menu }: any ) =>
{

  const [ data, setData ] = useContext( DataContext );
  const sections = [ "home", "profile", "chat", "history", "statistics", "friends", "rooms" ];
  const router = useRouter();

  // const [ user, setUser ] = useState(
  //   {
  //     avatar: "",
  //     createdAt: "",
  //     first_name: "",
  //     id: "",
  //     last_name: "",
  //     two_factor_auth: false,
  //     updateAt: "",
  //     username: "",
  //   }
  // )

  // useEffect( () =>
  // {
  //   const user = JSON.parse( localStorage.getItem( "user" ) as string );
  //   console.log( 'data avatar is: ', data.avatar );
  //   console.log( 'user avatar is: ', user.avatar )
  //   setUser( user );
  // }, [] )

  return (
    <div className={ cn( styles_box.profile_setting, `${ menu && styles_box.navOpen }` ) }>
      <div className={ styles_s_l.profile_info }>
        <div className={ styles_s_l.profile_image_wrap }>
          <Image
            src={ data?.avatar }
            alt="avatar"
            width="100px"
            height="100px"
            className={ cn( styles_s_l.profile_image, styles.profile_avatar ) }
          ></Image>
        </div>
        <p className={ styles_s_l.profile_info_login }>{ data?.username }</p>
        <p className={ styles_s_l.profile_info_full_name }>{ `${ data?.last_name } 
        ${ data?.first_name }` }</p>
      </div>
      <div className={ styles_s_l.setting_btns }>
        { sections.map( ( section, i ) =>
        {
          return (
            <div
              key={ i }
              onClick={ () => router.push( `/${ section }` ) }
              className={ cn(
                styles_s_l.setting_btn,
                selected === section && styles_s_l.current_btn
              ) }
            >
              { section }
            </div>
          );
        } ) }
      </div>
    </div>
  );
};

export default SettingsNav;
