import Link from "next/link";
import styles from "../styles/login_page.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "../components/Loading";
import cookie from "cookie";
import requireAuthentication from "../hooks/requiredAuthentication";
import axios from "axios";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // gha terqi3a :)
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    router.push("/profile");
  }, []);

  // temp code
  const handleLogin = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/temp`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res);
        router.push("/profile");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <div className={styles.container}>
      <p className={styles.welcom}>WELCOME TO</p>
      <p className={styles.pongify}>PONGIFY</p>
      <div>
        {/* <Link href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/temp`}> */}
        <button className={styles.loginBtn} onClick={handleLogin}>
          Login with
        </button>
        {/* </Link> */}
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  return {
    props: {}, // will be passed to the page component as props
  };
};

export default LoginPage;
