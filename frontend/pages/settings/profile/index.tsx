import cn from "classnames";
import styles from "../../../styles/profile.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";

const Profile = () => {
  return (
    <div className={styles_box.container}>
      <SettingsNav selected={"profile"} />
      <div className={styles_box.profile_details}>
        <div className={styles.details_up}>
          <div className={styles.details_level}>
            <p>LEVEL</p>
            <span> 2</span>
          </div>
          <div className={styles.details_avatar}>
            <div className={styles.profile_box}>
              <div className={styles.profile_slide}>change picture</div>
              <input type="file"></input>
              <img src="https://cdn.intra.42.fr/users/yhadari.jpg"></img>
            </div>
            <p>YHADARI</p>
          </div>
          <div className={styles.details_medals}>
            <img src="/medal.png" width="12%"></img>
            <img src="/medal.png" width="12%"></img>
            <img src="/medal.png" width="12%"></img>
          </div>
        </div>
        <div className={styles.details_info}>
          <form className={styles.details_form}>
            <div>
              <label>FIRST NAME</label>
              <input type="text" placeholder="HADARI"></input>
            </div>
            <div>
              <label>LAST NAME</label>
              <input type="text" placeholder="YASSINE"></input>
            </div>
            <div>
              <label>USERNAME</label>
              <input type="text" placeholder="YHADARI"></input>
            </div>
          </form>
        </div>
        <div className={styles.details_two_factor_aut}>
          <p className={styles.two_factor_title}>TWO-FACTOR AUTHENTICATION</p>
          <p className={styles.two_factor_text}>
            Two-factor authentication adds an additional layer of security to
            your account by requiring more than just a password to sign in.
          </p>
          <label className={styles.switch}>
            <input type="checkbox"></input>
            <span className={cn(styles.slider, styles.round)}></span>
          </label>
          <img src="/QR.png" width="15%" />
        </div>
        <div className={styles.save_box}>
          <div className={cn(styles_s_l.setting_btn, styles.save_btn)}>
            SAVE
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
