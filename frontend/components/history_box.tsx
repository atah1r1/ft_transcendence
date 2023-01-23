import styles from "../styles/history.module.css";
import styles_p from "../styles/profile.module.css";
import styles_f from "../styles/friends.module.css";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { achievementsContext } from "../pages/_app";

const HistoryBox = ({ history, id }: any) => {
  const [empty, setEmpty] = useState(false);
  const [{ Opachievements }, { setOpAchievments }] = useContext(achievementsContext);

  useEffect(() => {
    setTimeout(() => {
      !history.length && setEmpty(true);
    }, 100)
  }, [history])

  useEffect(() => {
    setOpAchievments({
      ach1: false,
      ach2: false,
      ach3: false,
      ach4: false,
    })
    if (history.length) {
      let winCount = 0;
      let score = 100;
      let points = 0;
      setOpAchievments((prev: any) => ({ ...prev, ach1: true }));
      history.map((ele: any, i: any, arr: any) => {
        console.log(arr[arr.length - 1 - i].winnerScore, arr[arr.length - 1 - i].loserScore);
        points = (arr[arr.length - 1 - i].winnerScore - arr[arr.length - 1 - i].loserScore) * 10;
        if (arr[arr.length - 1 - i].winnerId === id) {
          winCount += 1;
          score += points;
        }
        else if (arr[arr.length - 1 - i].loserId === id) {
          winCount = 0;
          score -= points;
        }
        ele.score = score;
        ele.points = points;
        if (winCount === 3) {
          setOpAchievments((prev: any) => ({ ...prev, ach3: true }));
        }
        if (score >= 350) {
          console.log("ach2");
          setOpAchievments((prev: any) => ({ ...prev, ach2: true }));
        }
        if (score >= 1000) {
          setOpAchievments((prev: any) => ({ ...prev, ach4: true }));
        }
      })
    }
  }, [history])

  const getIntraName = (obj: any) => {
    if (id === obj.winnerId) {
      return obj.loser.username;
    }
    return obj.winner.username;
  }

  return history.length ?
    history.map((ele: any, i: number, arr: any) => {
      return (
        <div className={styles.history_box} key={i}>
          <div className={styles.history_avatar}>
            <Image src={(id === ele.loserId ? (ele.winner.avatar ?? "https://picsum.photos/300/300") : (ele.loser.avatar ?? "https://picsum.photos/301/301"))} alt={"avatar"} width={54} height={54} layout="fixed" className={styles_p.profile_avatar} />
          </div>
          <div className={styles.history_userName}>{getIntraName(ele)}</div>
          <div className={styles.history_score_points}>
            <div>score {arr[arr.length - 1 - i].score}</div>
            <div
              style={{
                color: `${id === ele.winnerId ? "#3BA658" : "#EA4335"}`,
              }}
            >
              {`${id === ele.winnerId ? `+${arr[arr.length - 1 - i].points}` : `-${arr[arr.length - 1 - i].points}`}`}
            </div>
          </div>
          <div className={styles.history_victory_defeat}>
            <div className={styles.history_victory_defeat_box}>
              <p
                style={{
                  color: `${id === ele.winnerId ? "#3BA658" : "#EA4335"}`,
                }}
              >
                {id === ele.winnerId ? "vectory" : "defeat"}
              </p>
              <div className={styles.victory_defeat_box}>
                <div>{ele.winnerScore}</div>
                <p>-</p>
                <div>{ele.loserScore}</div>
              </div>
            </div>
          </div>
          <div className={styles.history_gameMode_time}>
            <div>{ele.createdAt.split("T")[1].split(".")[0]}</div>
          </div>
        </div>
      );
    }) :
    empty && <div className={styles_f.noresult}>
      <Image
        src={"/noresult.png"}
        alt="no_result_img"
        width="220"
        height="220"
      ></Image>
    </div>;
};

export default HistoryBox;
