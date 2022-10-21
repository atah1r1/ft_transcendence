import cn from "classnames";
import styles from "../../../styles/chat.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import styles_h from "../../../styles/history.module.css";
import SettingsNav from "../../../components/settings_nav";
import Loader from "../../../components/Loading";
import HistoryBox from "../../../components/history_box";
import { useState } from "react";

const History = () => {
  const [history, setHistory] = useState([
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: "/medal.svg",
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/mbrija.jpg",
      numberGame: "5",
      score: "1250",
      points: "+15",
      achievements: "/medal.svg",
      victory: "10",
      defeat: "2",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/zsidki.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: "/medal.svg",
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/ojoubout.jpg",
      numberGame: "5",
      score: "1250",
      points: "+15",
      achievements: "/medal.svg",
      victory: "10",
      defeat: "2",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: "/medal.svg",
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      numberGame: "5",
      score: "1250",
      points: "+15",
      achievements: "/medal.svg",
      victory: "10",
      defeat: "2",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/zqadiri.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: "/medal.svg",
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: "/medal.svg",
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: "/medal.svg",
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
  ]);
  return (
    <div className={styles_box.container}>
      <SettingsNav selected={"history"} />
      <div className={styles_box.profile_details}>
        <div className={styles_h.history}>
          <HistoryBox history={history}></HistoryBox>
        </div>
      </div>
    </div>
  );
};

export default History;
