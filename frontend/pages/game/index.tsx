import { useRouter } from "next/router";
import styles_box from "../../styles/style_box.module.css";
import React, { useContext, useEffect, useState } from "react";
import MenuNav from "../../components/menuNav";
import SettingsNav from "../../components/settings_nav";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";
import styles from "../../styles/GameStyle.module.css";
import {
  GamesCountContext,
  GameSocketContext,
  LiveGamesContext,
} from "../_app";
import axios from "axios";

function Home() {
  const gameSocket = useContext(GameSocketContext);
  const [gamesCount, setGamesCount] = useContext(GamesCountContext);
  const [liveGames, setLiveGames] = useContext(LiveGamesContext);
  const [menu, setMenu] = useState(false);
  const router = useRouter();

  const playGame = () => {
    gameSocket.emit("play_queue", {});
  };

  const singlePmode = () => {
    router.push("/game/play/vbot");
  };

  const spectateGame = (gameId: string) => {
    gameSocket.emit("spectate_game", {
      gameId: gameId,
    });
  };

  useEffect(() => {
    // send get request to /api/game/live to get list of live games and call setLiveGames
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game/live`, {
        withCredentials: true,
      })
      .then((res) => {
        setLiveGames(res.data);
      })
      .catch((err) => {
      });
  }, [gamesCount]);

  return (
    <>
      <MenuNav menu={menu} setMenu={setMenu} />
      <div className={styles_box.container}>
        <SettingsNav selected={"game"} menu={menu} />
        <div className={styles_box.profile_details}>
          <Logout />
          <div className={styles.container}>
            <div className={styles.gameBtns}>
              <button className={styles.queue} onClick={playGame}>
                QUEUE
              </button>
              <button className={styles.bot} onClick={singlePmode}>
                VS BOT
              </button>
            </div>
            <h1 className={styles.games_header}>LIVE GAMES</h1>
            <div className={styles.games}>
              {liveGames.map((game: any) => {
                return (
                  <div
                    className={styles.cardContainer}
                    key={game.id}
                  >
                    <div className={styles.players}>
                      <div className={styles.player}>
                        <a href={`/profile/${game?.players[0].id}`}>
                          <img
                            src={
                              game?.players[0].avatar ??
                              `https://api.dicebear.com/5.x/bottts/svg?seed=${game?.players[0].username ?? "Player 1"
                              }`
                            }
                            width="40"
                            height="40"
                          ></img>
                        </a>
                        <h1>{game?.players[0].username ?? "Player 1"}</h1>
                        <div className={styles.score}>
                          {game?.players[0].score}
                        </div>
                      </div>
                      <div className={styles.vs}>VS</div>
                      <div className={styles.player}>
                        <a href={`/profile/${game?.players[1].id}`}>
                          <img
                            src={
                              game?.players[1].avatar ??
                              `https://api.dicebear.com/5.x/bottts/svg?seed=${game?.players[1].username ?? "Player 2"
                              }`
                            }
                            width="40"
                            height="40"
                          ></img>
                        </a>
                        <h1>{game?.players[1].username ?? "Player 2"}</h1>
                        <div className={styles.score}>
                          {game?.players[1].score}
                        </div>
                      </div>
                    </div>
                    <div className={styles.watch_btn_cont}>
                      <button className={styles.watch_btn} type="button"
                        onClick={() => spectateGame(game.id)}>WATCH</button>
                    </div>
                    <div className={styles.watchers}>
                      {game.spectators.map((spect: any) => {
                        return (
                          <a href={localStorage.getItem('userId') === spect.id ? '/profile' : `/profile/${spect.id}`}>
                            <img className={styles.watcher_image} key={spect.id} src={spect.avatar}></img>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

export const getServerSideProps = requireAuthentication(async () => {
  return {
    props: {}, // will be passed to the page component as props
  };
});
