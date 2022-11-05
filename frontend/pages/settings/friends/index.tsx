import cn from "classnames";
import styles from "../../../styles/friends.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import Image from "next/image";
import Friends_box from "../../../components/friend_box";
import { useEffect, useState } from "react";
import axios from "axios";

const History = () => {
  const [inputForm, setInputForm] = useState("");


  const [friends1, setFriends1] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:9000/api/user/all", {
      withCredentials: true,
    }).then((res) => {
      setFriends1(res.data);
      console.log(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  const [friends, setFriends] = useState([
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      fullName: "HADARI YASSINE",
      userName: "YHADARI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "AMINE TAHIRI",
      userName: "ATAHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "BRAHIM SANAOUI",
      userName: "BSANAOUI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      fullName: "ISMAIL BOUHIRI",
      userName: "IBOUHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      fullName: "HADARI YASSINE",
      userName: "YHADARI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "AMINE TAHIRI",
      userName: "ATAHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "BRAHIM SANAOUI",
      userName: "BSANAOUI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      fullName: "ISMAIL BOUHIRI",
      userName: "IBOUHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      fullName: "HADARI YASSINE",
      userName: "YHADARI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      fullName: "AMINE TAHIRI",
      userName: "ATAHIRI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      fullName: "BRAHIM SANAOUI",
      userName: "BSANAOUI",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/ibouhiri.jpg",
      fullName: "ISMAIL BOUHIRI",
      userName: "IBOUHIRI",
    },
  ]);

  return (
    <div className={styles_box.container}>
      <div className={cn(styles_s_l.setting_btn, styles_s_l.current_btn, styles_s_l.logout_btn)}>logout</div>
      <SettingsNav selected={"friends"} />
      <div className={styles_box.profile_details}>
        <form
          className={styles.search}
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            type="search"
            placeholder="Search..."
            onChange={(e) => {
              setInputForm(e.target.value);
            }}
            value={inputForm}
          ></input>
        </form>
        <div className={styles.friends}>
          <Friends_box
            // friends={friends.filter((ele) => {
            //   return ele.userName.toLowerCase().includes(inputForm);
            // })}
            friends={friends1}
          ></Friends_box>
        </div>
      </div>
    </div>
  );
};

export default History;
