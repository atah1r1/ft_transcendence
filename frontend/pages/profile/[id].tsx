import cn from "classnames";
import styles from "../../styles/profile.module.css";
import styles_box from "../../styles/style_box.module.css";
import styles_s_l from "../../styles/style_settings_nav.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import MenuNav from "../../components/menuNav";
import SettingsNav from "../../components/settings_nav";
import { useRouter } from "next/router";
import axios from "axios";
import requireAuthentication from "../../hooks/requiredAuthentication";
import Logout from "../../components/logout";

const FriendProfile = () =>
{
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
    axios.get( `http://localhost:9000/api/user/${ id }`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setData( res.data );
    } ).catch( ( err ) =>
    {
      console.log( 'error', err );
    } )
  }, [] )

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "friends" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <div>
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
                  ></Image>
                </div>
                { <p>{ data?.username }</p> }
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