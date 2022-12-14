
import styles_box from "../../styles/style_box.module.css";
import styles_h from "../../styles/history.module.css";
import SettingsNav from "../../components/settings_nav";
import HistoryBox from "../../components/history_box";
import { useState } from "react";
import MenuNav from "../../components/menuNav";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";

const History = () =>
{
  const [ menu, setMenu ] = useState( false );
  const [ history, setHistory ] = useState( [
    {
      avatar: "https://cdn.intra.42.fr/users/atahiri.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png", "/ach4.png" ],
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
      achievements: [ "/ach1.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
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
      achievements: [ "/ach1.png", "/ach2.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
  ] );
  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "history" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <Logout />
          <div className={ styles_h.history }>
            <HistoryBox history={ history }></HistoryBox>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;

export const getServerSideProps = requireAuthentication( async () =>
{
  return {
    props: {
    }, // will be passed to the page component as props
  }
} )