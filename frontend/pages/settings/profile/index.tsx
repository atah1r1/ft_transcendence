import cn from "classnames";
import styles from "../../../styles/profile.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Loader from "../../../components/Loading";

const Profile = () => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
    createdAt: "",
    first_name: "",
    id: "",
    last_name: "",
    two_factor_auth: false,
    updateAt: "",
    username: "",
  });

  const fetchData = async () => {
    console.log("here!\n");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`,
        {
          withCredentials: true,
        }
      );
      setUser(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles_box.container}>
      <SettingsNav selected={"profile"} user={user} />
      <div className={styles_box.profile_details}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className={styles.details_up}>
              <div className={styles.details_level}>
                <p>LEVEL</p>
                <span> 2</span>
              </div>
              <div className={styles.details_avatar}>
                <div className={styles.profile_box}>
                  <div className={styles.profile_slide}>change picture</div>
                  <input type="file"></input>
                  <Image
                    src={user.avatar}
                    alt="avatar"
                    width="180px"
                    height="180px"
                  ></Image>
                </div>
                <p>{user.username}</p>
              </div>
              <div className={styles.details_medals}>
                <div>
                  <Image
                    src="/silver.svg"
                    alt="medal_img"
                    width="100%"
                    height="100%"
                  ></Image>
                </div>
                <div>
                  <Image
                    src="/gold.svg"
                    alt="medal_img"
                    width="100%"
                    height="100%"
                  ></Image>
                </div>
                <div>
                  <Image
                    src="/bronze.svg"
                    alt="medal_img"
                    width="100%"
                    height="100%"
                  ></Image>
                </div>
              </div>
            </div>
            <div className={styles.details_info}>
              <form className={styles.details_form}>
                <div>
                  <label>FIRST NAME</label>
                  <input type="text" placeholder={user.first_name}></input>
                </div>
                <div>
                  <label>LAST NAME</label>
                  <input type="text" placeholder={user.last_name}></input>
                </div>
                <div>
                  <label>USERNAME</label>
                  <input type="text" placeholder={user.username}></input>
                </div>
              </form>
            </div>
            <div className={styles.details_two_factor_aut}>
              <p className={styles.two_factor_title}>
                TWO-FACTOR AUTHENTICATION
              </p>
              <p className={styles.two_factor_text}>
                Two-factor authentication adds an additional layer of security
                to your account by requiring more than just a password to sign
                in.
              </p>
              <label className={styles.switch}>
                <input type="checkbox"></input>
                <span className={cn(styles.slider, styles.round)}></span>
              </label>
              {/* <img src="/QR.png" width="15%" /> */}
            </div>
            <div className={styles.save_box}>
              <div className={cn(styles_s_l.setting_btn, styles.save_btn)}>
                SAVE
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
