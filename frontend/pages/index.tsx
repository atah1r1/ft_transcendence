import styles from "../styles/login_page.module.css";

const loginPage = () => {
  return (
    <div className={styles.container}>
      <p className={styles.welcom}>WELCOME TO</p>
      <p className={styles.pongify}>PONGIFY</p>
      <div>
        <button className={styles.loginBtn}>Login with</button>
      </div>
    </div>
  );
};

export default loginPage;
