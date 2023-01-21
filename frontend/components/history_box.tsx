import styles from "../styles/history.module.css";
import styles_p from "../styles/profile.module.css";
import styles_f from "../styles/friends.module.css";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { achievmentsContext, ScoreContext } from "../pages/_app";

const HistoryBox = ({ history, id }: any) => {
  const [empty, setEmpty] = useState(false);
  var [score, setScore] = useContext(ScoreContext);
  const [achievments, setAchievments] = useContext(achievmentsContext);

  useEffect(() => {
    setTimeout(() => {
      !history.length && setEmpty(true);
    }, 100)
  }, [history])

  useEffect(() => {
    if (history.length) {
      let test = 0;
      let sc = 100;
      setAchievments((prev: any) => ({ ...prev, ach1: true }));
      history.map((ele: any) => {
        if (ele.winnerId === id) {
          test += 1;
          sc += 50;
        }
        if (ele.loserId === id) {
          test -= 1;
        }
        if (test === 3) {
          setAchievments((prev: any) => ({ ...prev, ach3: true }));
        }
        if (sc === 350) {
          setAchievments((prev: any) => ({ ...prev, ach2: true }));
        }
      })
    }
  }, [history])

  return history.length ?
    history.map((ele: any, i: any) => {
      return (
        <div className={styles.history_box} key={i}>
          <div className={styles.history_avatar}>
            <Image src={(id === ele.loserId ? (ele.winner.avatar ?? "https://picsum.photos/300/300") : (ele.loser.avatar ?? "https://picsum.photos/301/301"))} alt={"avatar"} width={54} height={54} layout="fixed" className={styles_p.profile_avatar} />
          </div>
          <div className={styles.history_score_points}>
            <div>score {id === ele.winnerId ? score += 50 : score -= 50}</div>
            <div
              style={{
                color: `${id === ele.winnerId ? "#3BA658" : "#EA4335"}`,
              }}
            >
              {`${id === ele.winnerId ? '+50' : '-50'}`}
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
