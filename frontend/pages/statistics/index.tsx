import styles from "../../styles/statistics.module.css";
import styles_p from "../../styles/profile.module.css";
import styles_box from "../../styles/style_box.module.css";
import SettingsNav from "../../components/settings_nav";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../components/menuNav";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";
import { AchievementsContext, DataContext } from "../_app";
import cn from "classnames";
import axios from "axios";

const History = () => {
  const [{ achievements }, { setAchievments }] = useContext(AchievementsContext);
  const [data, setData] = useContext(DataContext);
  const [menu, setMenu] = useState(false);

  // achievements
  const [history, setHistory] = useState([]);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game/${data.id}/history`,
      { withCredentials: true })
      .then((res) => {
        setHistory(res.data.reverse());
        console.log('history: ', res.data);
      })
      .catch((error) => {
        console.log('error: ', error);
      })
  }, [data.id])

  useEffect(() => {
    setAchievments({
      ach1: false,
      ach2: false,
      ach3: false,
      ach4: false,
    })
    if (history.length) {
      let winCount = 0;
      let score = 100;
      let points = 0;
      setAchievments((prev: any) => ({ ...prev, ach1: true }));
      history.map((ele: any, i: any, arr: any) => {
        console.log(arr[arr.length - 1 - i].winnerScore, arr[arr.length - 1 - i].loserScore);
        points = (arr[arr.length - 1 - i].winnerScore - arr[arr.length - 1 - i].loserScore) * 10;
        if (arr[arr.length - 1 - i].winnerId === data.id) {
          winCount += 1;
          score += points;
        }
        else if (arr[arr.length - 1 - i].loserId === data.id) {
          winCount = 0;
          score -= points;
        }
        ele.score = score;
        ele.points = points;
        if (winCount === 3) {
          setAchievments((prev: any) => ({ ...prev, ach3: true }));
        }
        if (score >= 350) {
          setAchievments((prev: any) => ({ ...prev, ach2: true }));
        }
        if (score >= 1000) {
          setAchievments((prev: any) => ({ ...prev, ach4: true }));
        }
      })
    }
  }, [history])

  const winnerMaches = history.filter((ele: any) => ele.winnerId === data.id).length;
  const loserMaches = history.filter((ele: any) => ele.loserId === data.id).length;

  return (
    <>
      <MenuNav menu={menu} setMenu={setMenu} />
      <div className={styles_box.container}>
        <SettingsNav selected={"statistics"} menu={menu} />
        <div className={styles_box.profile_details}>
          <Logout />
          <div className={styles.statistics_box}>
            <div className={styles.part_one}>
              <div className={styles.left}>
                <div className={styles.avatar}>
                  <Image
                    src={data?.avatar ?? "https://picsum.photos/300/300"}
                    alt="user_img"
                    width={"100px"}
                    height={"100px"}
                    className={styles_p.profile_avatar}
                  ></Image>
                </div>
                <div>
                  <p className={styles.user_name}>{data.username}</p>
                  <div className={styles.level_box}>
                    <div className={styles.level_line}></div>
                    <div className={styles.level_number_box}>
                      <p>LEVEL 2</p>
                      <p>LEVEL 3</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.right}>
                <p className={styles.title}>MATCH PLAYED</p>
                <p className={styles.match_number}>{history.length}</p>
                <div className={styles.def_vic_box}>
                  <div className={styles.defeat_box}>
                    <p className={styles.defeat_text}>DEFEAT</p>
                    <p className={styles.defeat_number}>{loserMaches}</p>
                  </div>
                  <div className={styles.victory_box}>
                    <p className={styles.victory_text}>VICTORY</p>
                    <p className={styles.victory_number}>{winnerMaches}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.part_two}>
              <p className={styles.ach_text}>ACHIEVEMENTS</p>
              <div className={styles.ach_medal}>
                <div className={cn(styles.ach_medal_box, `${achievements.ach1 && styles.medal}`)}>
                  <div className={styles.ach_goal}>First match</div>
                  <Image
                    className={`${!achievements.ach1 && styles.non_medal}`}
                    src="/ach1.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
                <div className={cn(styles.ach_medal_box, `${achievements.ach2 && styles.medal}`)}>
                  <div className={styles.ach_goal}>Reaching 350 points</div>
                  <Image
                    className={`${!achievements.ach2 && styles.non_medal}`}
                    src="/ach2.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
                <div className={cn(styles.ach_medal_box, `${achievements.ach3 && styles.medal}`)}>
                  <div className={styles.ach_goal}>Three consecutive wins</div>
                  <Image
                    className={`${!achievements.ach3 && styles.non_medal}`}
                    src="/ach3.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
                <div className={cn(styles.ach_medal_box, `${achievements.ach4 && styles.medal}`)}>
                  <div className={styles.ach_goal}>1000 Points</div>
                  <Image
                    className={`${!achievements.ach4 && styles.non_medal}`}
                    src="/ach4.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;

export const getServerSideProps = requireAuthentication(async () => {
  return {
    props: {
    }, // will be passed to the page component as props
  }
})