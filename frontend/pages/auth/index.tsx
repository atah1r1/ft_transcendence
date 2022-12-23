import styles_login from "../../styles/login_page.module.css";
import styles from "../../styles/auth_page.module.css";
import Image from "next/image";
import cn from "classnames";
import styles_s_l from "../../styles/style_settings_nav.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import requireAuthentication from "../../hooks/requiredAuthentication";
import Loader from "../../components/Loading";

const AuthPage = () => {
  const [value, setValue] = useState('');

  const handleChange = ( e: any ) =>
  {
    const result = e.target.value.replace( /\D/g, '' );

    setValue(result);
  };

  // code added for verification of 2fa authentication

  const [ loading, setLoading ] = useState( true );
  const router = useRouter();


  // gha terqi3a :)
  useEffect( () =>
  {
    setTimeout( () =>
    {
      setLoading( false );
    }, 1000 )
    router.push( '/profile' );
  }, [] )

  if ( loading )
  {
    return <Loader />
  }

  const HandleSubmit = () =>
  {
    axios( {
      method: 'post',
      url: `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/2fa/verify`,
      data: {
        code: value
      },
      withCredentials: true
    } ).then( ( resp ) =>
    {
      console.log( resp.data );
      window.location.replace( '/profile' );
    } ).catch( ( err ) =>
    {
      console.log( err );
    } )
  }

  return (
    <div className={styles.box}>
      <p className={styles_login.welcom}>WELCOME TO</p>
      <p className={styles_login.pongify}>PONGIFY</p>
      <div className={styles.container}>
        <div className={styles.auth_text_box}>
          <p className={styles.auth_title}>Please enter 2fa code</p>
          <p className={styles.auth_text}>Two-factor authentication (2FA) is enabled
            for account please enter a code to login</p>
        </div>
        <div className={styles.auth_image}>
          <Image
            src="/auth_image.png"
            alt="auth_image"
            width="360px"
            height="322px"
          ></Image>
        </div>
        <div className={styles.code_box}>
          <form className={styles.details_form}>
            <div>
              <label>Code</label>
              <input type="text" placeholder="******" maxLength={6} value={value}
                onChange={handleChange} ></input>
            </div>
          </form>
        </div>
        <div className={ styles.verify_box }>
          <div className={ cn( styles_s_l.setting_btn, styles.verify_btn, `${ value.length !== 6 && styles.verify_unclick }` ) } onClick={ HandleSubmit }>
            Verify
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

export const getServerSideProps = async () =>
{
  return {
    props: {}, // will be passed to the page component as props
  };
};