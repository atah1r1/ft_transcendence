import Link from "next/link";
import styles from "../styles/login_page.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "../components/Loading";
import cookie from 'cookie';
import requireAuthentication from "../hooks/requiredAuthentication";

const loginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);


  // gha terqi3a :)
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000)
    router.push('/profile');
  }, [])

  if (loading) {
    return <Loader />
  }
  return (
    <div className={styles.container}>
      <p className={styles.welcom}>WELCOME TO</p>
      <p className={styles.pongify}>PONGIFY</p>
      <div>
        <Link href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`}>
          <button className={styles.loginBtn}>Login with</button>
        </Link>
      </div>
    </div>
  );
};

export const getServerSideProps = (async () => {
  return {
    props: {
    }, // will be passed to the page component as props
  }
})

export default loginPage;
