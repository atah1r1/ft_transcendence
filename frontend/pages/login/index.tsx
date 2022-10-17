import type { NextPage } from "next";
import styles from "../../styles/Login.module.css";

const Login: NextPage = () => {
  return (
    <div className={styles.loginCard}>
      <h1>Login</h1>
      <form>
        <input type="text" name="" id="" />
        <input type="password" name="" id="" />
      </form>
    </div>
  );
};

export default Login;
