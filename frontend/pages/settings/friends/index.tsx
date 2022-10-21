import cn from "classnames";
import styles from "../../../styles/friends.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import Image from "next/image";
import Friends_box from "../../../components/friend_box";
import { useState } from "react";

const History = () => {
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
      <SettingsNav selected={"friends"} />
      <div className={styles_box.profile_details}>
        <form
          className={styles.search}
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input type="search" placeholder="Search..."></input>
        </form>
        <div className={styles.friends}>
          <Friends_box friends={friends}></Friends_box>
        </div>
      </div>
    </div>
  );
};

export default History;
