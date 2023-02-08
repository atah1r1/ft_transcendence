import React, { useContext, useEffect, useRef, useState } from "react";
import paddle from "../../../components/paddle";
import Score from "../../../components/score";
import styled from "styled-components";
import styles_box from "../../../styles/style_box.module.css";
import requireAuthentication from "../../../hooks/requiredAuthentication";
import { GameDataContext, GameSocketContext, GameStatus } from "../../_app";
import { useRouter } from "next/router";
import Modal from "../../../components/modal_dialog";
import styles_r_w from "../../../styles/chatroom_window.module.css";
import Imag from "next/image";
import cn from "classnames";

const Container = styled.div`
  background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3),
      rgba(0, 0, 0, 0.3)
    ),
    url("/bg.jpeg");
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border-radius: 2.2rem;
`;

const GameContainer = styled.canvas`
  outline: 1px solid #ffd300;
  align-content: center;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 80%;
  margin: auto auto 0 auto;
  padding: 0.4rem;
`;

let rightPaddle = {};
let leftPaddle = {};
let ball = {};
let waitingPopup = false;
let status: GameStatus = GameStatus.ACCEPTED;
let animationId: number = -1;
let intervalId: any;

function Game() {
  const router = useRouter();
  const socket = useContext(GameSocketContext);
  const [game, setGame] = useContext(GameDataContext);
  const [menu, setMenu] = useState(false);
  //const [waitingPopup, setWaitingPopup] = useState(false);

  let canvasRef = useRef<HTMLCanvasElement>(null);

  const isPlaying = (gameData: any): boolean => {
    const userId = localStorage.getItem("userId");
    return gameData?.players && gameData?.players?.includes(userId);
  };

  const getOpponentId = (gameData: any): string => {
    const userId = localStorage.getItem("userId");
    const opId = gameData?.players?.find(
      (playerId: string) => playerId !== userId
    );
    return opId;
  };

  const getMyId = (gameData: any): string => {
    const userId = localStorage.getItem("userId");
    const myId = gameData?.players?.find(
      (playerId: string) => playerId === userId
    );
    return myId;
  };

  const getGameStatus = () => {
    return status;
  };

  const renderCanvas = () => {
    const canvasBG = canvasRef.current;
    const ctxBG = canvasBG?.getContext("2d");
    const bg = new Image();
    bg.src = "/splash.png";
    bg.onload = function () {
      ctxBG?.drawImage(bg, 0, 0, canvasBG!.width, canvasBG!.height);
    };
  };

  const renderPaddle = (leftPaddle: any, rightPaddle: any) => {
    const paddleC = canvasRef.current;
    const ctx = paddleC?.getContext("2d");
    paddle(ctx, paddleC, leftPaddle);
    paddle(ctx, paddleC, rightPaddle);
  };

  const renderBall = (ballData: any) => {
    const ballC = canvasRef.current;
    const ctx = ballC?.getContext("2d");
    ctx?.beginPath();
    ctx?.arc(ballData.x, ballData.y, ballData.rad, 0, Math.PI * 2, false);
    if (ctx) {
      ctx!.fillStyle = "#ffffff";
      ctx!.strokeStyle = "#000000";
    }

    ctx?.fill();
    ctx?.stroke();
    ctx?.closePath();
  };

  const render = () => {
    renderCanvas();
    renderPaddle(leftPaddle, rightPaddle);
    renderBall(ball);
    canvasRef.current?.focus();
  };

  // Listening on socket events
  useEffect(() => {
    // setWaitingPopup(true);
    waitingPopup = true;

    if (!game || !game.players) {
      router.replace("/game");
      return;
    }

    if (isPlaying(game) && game.status === GameStatus.ACCEPTED) {
      socket.emit("start_game", { userId: getOpponentId(game) });
    }

    socket.off("emit_game_data").on("emit_game_data", (data: any) => {
      setGame((prev: any) => {
        return { ...prev, score: data.score, status: data.status };
      });
      if (!data || data.status !== GameStatus.STARTED) {
        return;
      }
      if (waitingPopup) waitingPopup = false; //setWaitingPopup(false);
      // data has started, update game object
      leftPaddle = data.paddle[data.players[0]];
      rightPaddle = data.paddle[data.players[1]];
      ball = data.ball;
      status = data.status;
    });

    socket.off("emit_game_finish").on("emit_game_finish", (data: any) => {
      setGame((prev: any) => {
        return { ...prev, score: data.score, status: data.status };
      });
      status = data.status;
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
    });

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
      if (getGameStatus() === GameStatus.FINISHED) {
        setGame(null);
        return;
      }
      if (isPlaying(game)) {
        socket.emit("leave_game", { userId: getOpponentId(game) });
        setGame(null);
      }
      else {
        socket.emit("stop_spectate_game", { gameId: game.id });
        setGame(null);
      }
    };
  }, []);

  // Rendering
  useEffect(() => {
    canvasRef.current?.focus();
    intervalId = setInterval(() => {
      animationId = requestAnimationFrame(render);
    }, 1000 / 80);
  }, []);

  // Emitting events
  const keyboardevent = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!isPlaying(game)) return;
    if (getGameStatus() !== GameStatus.STARTED) return;
    if (e.key === "ArrowUp") {
      socket.emit("game_move", { gameId: game.id, move: "UP" });
    } else if (e.key === "ArrowDown") {
      socket.emit("game_move", { gameId: game.id, move: "DOWN" });
    }
  };

  const getResultPopup = () => (
    <div>
      {game && game?.status === GameStatus.FINISHED && (
        <Modal
          content={
            <>
              <div className={styles_r_w.part_up}>
                <div className={styles_r_w.text}>Game Result</div>
              </div>
              {game?.players && (
                <div className={styles_r_w.leave_room_box}>
                  <div className={styles_r_w.game_avatars}>
                    <div className={styles_r_w.avatar_b}>
                      <div>
                        <Imag
                          src={game.avatars[game.players[0]]}
                          alt="avatar"
                          width="100"
                          height="100"
                        ></Imag>
                      </div>
                      {game.usernames[game.players[0]]}
                    </div>
                    <div className={styles_r_w.game_result}>
                      {`${game.score[game.players[0]]} - ${game.score[game.players[1]]
                        }`}
                    </div>
                    <div className={styles_r_w.avatar_b}>
                      <div>
                        <Imag
                          src={game.avatars[game.players[1]]}
                          alt="avatar"
                          width="100"
                          height="100"
                        ></Imag>
                      </div>
                      {game.usernames[game.players[1]]}
                    </div>
                  </div>
                </div>
              )}
              <div className={styles_r_w.part_down}>
                <button
                  className={styles_r_w.create}
                  type="submit"
                  onClick={() => {
                    router.back();
                  }}
                >
                  HOME
                </button>
              </div>
            </>
          }
        />
      )}
    </div>
  );

  const getGameFinishedPopup = () => {
    return (
      !game && (
        <Modal
          content={
            <>
              <div className={styles_r_w.part_up}>
                <div className={styles_r_w.text}>Game Result</div>
              </div>
              <div className={styles_r_w.leave_room_box}>
                <div className={styles_r_w.leave_room}>
                  You disconnected from the game.
                </div>
              </div>
              <div className={styles_r_w.part_down}>
                <button
                  className={styles_r_w.create}
                  type="submit"
                  onClick={() => {
                    router.back();
                  }}
                >
                  HOME
                </button>
              </div>
            </>
          }
        />
      )
    );
  };

  const getWaitingPopup = () => {
    return (
      <div>
        {waitingPopup && (
          <Modal
            content={
              <>
                <div className={styles_r_w.part_up}>
                  <div className={styles_r_w.text}>Starting game</div>
                </div>
                <div className={styles_r_w.leave_room_box}>
                  <div
                    className={cn(styles_r_w.leave_room, styles_r_w.dot_box)}
                  >
                    Waiting for other player to join
                    <span className={styles_r_w.dot_pulse}></span>
                  </div>
                </div>
                <div className={styles_r_w.part_down}></div>
              </>
            }
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {getWaitingPopup()}
      {getResultPopup()}
      {getGameFinishedPopup()}
      <div
        className={
          ((game && game?.status === GameStatus.FINISHED) || !game) &&
          styles_r_w.room
        }
      >
        {/* <MenuNav menu={ menu } setMenu={ setMenu } /> */}
        <div className={styles_box.container}>
          {/* <SettingsNav selected={ "home" } menu={ menu } /> */}
          <div className={styles_box.profile_details}>
            {/* {<JoinRoom />} */}
            <Container>
              <GameContainer
                id="game"
                ref={canvasRef}
                tabIndex={0}
                onKeyDown={keyboardevent}
                width="1280"
                height="720"
              ></GameContainer>
              {game?.players && (
                <Score
                  score1={game?.score[game.players[0]] ?? 0}
                  score2={game?.score[game.players[1]] ?? 0}
                  username1={game?.usernames[game.players[0]] ?? "Player 1"}
                  username2={game?.usernames[game.players[1]] ?? "Player 2"}
                />
              )}
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Game;

export const getServerSideProps = requireAuthentication(async () => {
  return {
    props: {}, // will be passed to the page component as props
  };
});
