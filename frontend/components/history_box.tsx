import styles from "../styles/history.module.css";

const HistoryBox = ({ history }: any) => {
  return history.map((ele: any) => {
    return (
      <div className={styles.history_box}>
        <div className={styles.history_avatar}>
          <img src={ele.avatar} />
          <div className={styles.history_numberGame}>{ele.numberGame}</div>
        </div>
        <div className={styles.history_score_points}>
          <div>score {ele.score}</div>
          <div
            style={{
              color: `${
                Number(ele.victory) > Number(ele.defeat) ? "#3BA658" : "#EA4335"
              }`,
            }}
          >
            {ele.points}
          </div>
        </div>
        <div className={styles.history_achievements}>
          <img src={ele.achievements} />
          <img src={ele.achievements} />
          <img src={ele.achievements} />
        </div>
        <div className={styles.history_victory_defeat}>
          <div className={styles.history_victory_defeat_box}>
            <p
              style={{
                color: `${
                  Number(ele.victory) > Number(ele.defeat)
                    ? "#3BA658"
                    : "#EA4335"
                }`,
              }}
            >
              {Number(ele.victory) > Number(ele.defeat) ? "vectory" : "defeat"}
            </p>
            <div className={styles.victory_defeat_box}>
              <div>{ele.victory}</div>
              <p>-</p>
              <div>{ele.defeat}</div>
            </div>
          </div>
        </div>
        <div className={styles.history_gameMode_time}>
          <div>{ele.gameMode}</div>
          <div>{ele.time}</div>
        </div>
      </div>
    );
  });
};

export default HistoryBox;
