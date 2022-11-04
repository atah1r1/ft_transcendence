import cn from "classnames";
import styles from "../../../styles/profile.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../_app";
import axios from "axios";
import Image from "next/image";
import Loader from "../../../components/Loading";
import { useRouter } from "next/router";
import cookie from 'cookie';
import requireAuthentication from "../../../hooks/requiredAuthentication";

const Profile = () => {

  const [data, setData] = useState(
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
  const [loader, setLoader] = useState(true);
  const [saveBtn, setSaveBtn] = useState(false);
  const [s_witch, setSwitch] = useState(false);


  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`,
        {
          withCredentials: true,
        }
      );
      setData(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error: any) {
    }
    finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  })

  return (
    <div className={styles_box.container}>
      <div className={cn(styles_s_l.setting_btn, styles_s_l.current_btn, styles_s_l.logout_btn)}>logout</div>
      <SettingsNav selected={"profile"} />
      <div className={styles_box.profile_details}>
        {
          loader ? <Loader /> :
          <div>
            <div className={styles.details_up}>
              <div className={styles.details_level}>
                <p>LEVEL</p>
                <span> 2</span>
              </div>
              <div className={styles.details_avatar}>
                <div className={styles.upload_avatar}>
                  <Image
                    src="/upload_avatar.png"
                    alt="upload_avatar_img"
                    width="100%"
                    height="100%"
                  ></Image>
                </div>
                <div className={styles.profile_box}>
                  <div className={styles.profile_slide}>change picture</div>
                  <input type="file"></input>
                  <Image
                    src={data.avatar}
                    alt="avatar"
                    width="180px"
                    height="180px"
                  ></Image>
                </div>
                <p>{data.username}</p>
              </div>
              <div className={styles.details_medals}>
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
            <div className={styles.details_info}>
              <form className={styles.details_form}>
                <div>
                  <label>FIRST NAME</label>
                  <input type="text" placeholder={data.first_name} maxLength={12} onChange={() => setSaveBtn(true)}></input>
                </div>
                <div>
                  <label>LAST NAME</label>
                  <input type="text" placeholder={data.last_name} maxLength={12} onChange={() => setSaveBtn(true)}></input>
                </div>
                <div>
                  <label>USERNAME</label>
                  <input type="text" placeholder={data.username} maxLength={12} onChange={() => setSaveBtn(true)}></input>
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
                <input type="checkbox" onClick={() => setSwitch(!s_witch)}></input>
                <span className={cn(styles.slider, styles.round)}></span>
              </label>
              {s_witch && <img src="/QR.png" width="15%" />}
            </div>
            {
              saveBtn &&
              <div className={styles.save_box}>
                <div className={cn(styles_s_l.setting_btn, styles.save_btn)}>
                  SAVE
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  );
};

export default Profile;

export const getServerSideProps = requireAuthentication(async (context: any) => {
  return {
    props: {
    }, // will be passed to the page component as props
  }
})