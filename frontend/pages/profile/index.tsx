import cn from "classnames";
import styles from "../../styles/profile.module.css";
import styles_box from "../../styles/style_box.module.css";
import styles_s_l from "../../styles/style_settings_nav.module.css";
import SettingsNav from "../../components/settings_nav";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import requireAuthentication from "../../hooks/requiredAuthentication";
import MenuNav from "../../components/menuNav";
import Logout from "../../components/logout";
import { CameraOutline } from "react-ionicons";
import { DataContext } from "../_app";

const Profile = () =>
{
  const [ data, setData ] = useContext( DataContext );
  console.log( 'data avatar: ', data.avatar );
  const [ s_witch, setSwitch ] = useState( false );
  const [ value, setValue ] = useState( {
    firstName: "",
    lastName: "",
    username: "",
  } );
  const [ usernameError, setUsernameError ] = useState( "" );
  const [ menu, setMenu ] = useState( false );
  const [ selectedFile, setSelectedFile ] = useState<Blob>();

  const handleFirstName = ( e: any ) =>
  {
    setValue( { ...value, firstName: e.target.value } );
  };
  const handleLastName = ( e: any ) =>
  {
    setValue( { ...value, lastName: e.target.value } );
  };
  const handleUsername = ( e: any ) =>
  {
    setValue( { ...value, username: e.target.value } );
  };

  const userToPatch: {
    first_name?: string;
    last_name?: string;
    username?: string;
  } = {
    first_name: value.firstName,
    last_name: value.lastName,
    username: value.username,
  };

  !value.firstName && delete userToPatch.first_name;
  !value.lastName && delete userToPatch.last_name;
  !value.username && delete userToPatch.username;

  const handleClick = async () =>
  {
    await axios( {
      method: "patch",
      url: `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/profile`,
      withCredentials: true,
      data: userToPatch,
    } )
      .then( ( res ) =>
      {
        setUsernameError( "" );
        setData( res.data );
        console.log( 'res', res );
      } )
      .catch( ( error ) =>
      {
        if ( error.response.data.message === "Username already exists" )
          setUsernameError( "Username already exists" );
        if (
          error.response.data.message[ 0 ] ===
          "username must be longer than or equal to 4 characters"
        )
          setUsernameError( "Username too short" );
      } );
    setValue( { firstName: "", lastName: "", username: "" } );
  };

  useEffect( () =>
  {
    const formData = new FormData();
    formData.append( "image", selectedFile as Blob );
    axios( {
      method: "post",
      url: `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/upload`,
      withCredentials: true,
      data: formData,
    } )
      .then( ( response ) =>
      {
        setData( ( prev: any ) =>
        {
          return { ...prev, avatar: response.data.avatar };
        } );
      } )
      .catch( ( error ) =>
      {
        console.log( "error: ", error );
      } )
  }, [ selectedFile ] );

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        { <SettingsNav selected={ "profile" } menu={ menu } /> }
        <div className={ styles_box.profile_details }>
          { (
            <div>
              <Logout />
              <div className={ styles.details_up }>
                <div className={ styles.details_level }>
                  <p>LEVEL</p>
                  <span>2</span>
                </div>
                <div className={ styles.details_avatar }>
                  <div className={ styles.upload_avatar }>
                    <CameraOutline
                      color={ "#ffffff" }
                      height="36px"
                      width="36px"
                    />
                  </div>
                  <form>
                    <div className={ styles.profile_box }>
                      <div className={ styles.profile_slide }>change picture</div>
                      <input
                        type="file"
                        onChange={ ( e: any ) =>
                          setSelectedFile( e.target.files[ 0 ] )
                        }
                      ></input>
                      <Image
                        className={ styles.profile_avatar }
                        src={
                          data?.avatar
                            ? data.avatar
                            : "https://picsum.photos/300/300"
                        }
                        alt="avatar_profile"
                        width="180px"
                        height="180px"
                      ></Image>
                    </div>
                  </form>
                  <p>{ data.username }</p>
                </div>
                <div className={ styles.details_medals }>
                  <div>
                    <Image
                      src="/ach1.png"
                      alt="medal_img"
                      width="30px"
                      height="30px"
                    ></Image>
                  </div>
                  <div>
                    <Image
                      src="/ach2.png"
                      alt="medal_img"
                      width="30px"
                      height="30px"
                    ></Image>
                  </div>
                  <div>
                    <Image
                      src="/ach3.png"
                      alt="medal_img"
                      width="30px"
                      height="30px"
                    ></Image>
                  </div>
                  <div>
                    <Image
                      src="/ach4.png"
                      alt="medal_img"
                      width="30px"
                      height="30px"
                    ></Image>
                  </div>
                </div>
              </div>
              <div className={ styles.details_info }>
                <form className={ styles.details_form }>
                  <div>
                    <label>FIRST NAME</label>
                    <input
                      type="text"
                      placeholder={ data.first_name }
                      maxLength={ 12 }
                      value={ value.firstName }
                      onChange={ handleFirstName }
                    ></input>
                  </div>
                  <div>
                    <label>LAST NAME</label>
                    <input
                      type="text"
                      placeholder={ data.last_name }
                      maxLength={ 12 }
                      value={ value.lastName }
                      onChange={ handleLastName }
                    ></input>
                  </div>
                  <div>
                    <label>USERNAME</label>
                    <input
                      type="text"
                      placeholder={ data.username }
                      maxLength={ 12 }
                      value={ value.username }
                      onChange={ handleUsername }
                    ></input>
                    { usernameError && (
                      <div className={ styles.error_box }>
                        <Image
                          src="/input_exist.svg"
                          alt="medal_img"
                          width="20px"
                          height="20px"
                        ></Image>
                        <p className={ styles.error_msg }>{ usernameError }</p>
                      </div>
                    ) }
                  </div>
                </form>
              </div>
              <div className={ styles.details_two_factor_aut }>
                <p className={ styles.two_factor_title }>
                  TWO-FACTOR AUTHENTICATION
                </p>
                <p className={ styles.two_factor_text }>
                  Two-factor authentication adds an additional layer of security
                  to your account by requiring more than just a password to sign
                  in.
                </p>
                <label className={ styles.switch }>
                  <input
                    type="checkbox"
                    onClick={ () => setSwitch( !s_witch ) }
                  ></input>
                  <span className={ cn( styles.slider, styles.round ) }></span>
                </label>
                { s_witch && <img src="/QR.png" width="15%" /> }
              </div>
              <div className={ styles.save_box } onClick={ handleClick }>
                <div
                  className={ cn(
                    styles_s_l.setting_btn,
                    styles.save_btn,
                    `${ !value.firstName &&
                    !value.lastName &&
                    !value.username &&
                    styles.save_unclick
                    }`
                  ) }
                >
                  SAVE
                </div>
              </div>
            </div>
          ) }
        </div>
      </div>
    </>
  );
};

export default Profile;

export const getServerSideProps = requireAuthentication( async () =>
{
  return {
    props: {}, // will be passed to the page component as props
  };
} );
