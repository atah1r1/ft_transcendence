import Link from "next/link";
import styles from "../styles/login_page.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";

const loginPage = () =>
{
  const router = useRouter();

  useEffect( () =>
  {
    router.push( '/profile' );
  }, [] )

  return (
    <div className={ styles.container }>
      <p className={ styles.welcom }>WELCOME TO</p>
      <p className={ styles.pongify }>PONGIFY</p>
      <div>
        <Link href={ `${ process.env.NEXT_PUBLIC_BACKEND_URL }/auth/login` }>
          <button className={ styles.loginBtn }>Login with</button>
        </Link>
      </div>
    </div>
  );
};

export default loginPage;
