import React, { useContext, useEffect, useRef, useState } from "react";
import paddle from "./paddle";
import { JoinRoom } from "../../../components/Joinroom";
import Score from "../../../components/score";
import styled from "styled-components";
import { io, Socket } from "socket.io-client";
import styles_box from "../../../styles/style_box.module.css";
import requireAuthentication from "../../../hooks/requiredAuthentication";
import { GameDataContext, GameSocketContext, GameStatus } from "../../_app";
import { useRouter } from "next/router";
import Modal from "../../../components/modal_dialog";
import styles_r_w from "../../../styles/chatroom_window.module.css";
import axios from "axios";
import Imag from "next/image";

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

function Game() {
  const router = useRouter();
  const { isPlaying } = router.query;
  const socket = useContext(GameSocketContext);
  const [game, setGame] = useContext(GameDataContext);
  const [menu, setMenu] = useState(false);
  const [waitingPopup, setWaitingPopup] = useState(false);
  let rightPaddle = {};
  let leftPaddle = {};
  let ball = {};
  let status: GameStatus = GameStatus.ACCEPTED;

  let canvasRef = useRef<HTMLCanvasElement>(null);

  const getOpponentId = (gameData: any): string => {
    const userId = localStorage.getItem("userId");
    const opId = gameData?.players.find(
      (playerId: string) => playerId !== userId
    );
    return opId;
  };

  const getMyId = (gameData: any): string => {
    const userId = localStorage.getItem("userId");
    const myId = gameData?.players.find(
      (playerId: string) => playerId === userId
    );
    return myId;
  };

  const getGameStatus = () => {
    console.log("STATUS: ", status);
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
    requestAnimationFrame(render);
  };

  // Listening on socket events
  useEffect(() => {
    setWaitingPopup(true);

    if (!game) {
      return;
      // show error, and redirect to home
    }

    if (isPlaying === "true" && game.status === GameStatus.ACCEPTED) {
      socket.emit("start_game", { userId: getOpponentId(game) });
    }

    socket.off("emit_game_data").on("emit_game_data", (data: any) => {
      setGame((prev: any) => {
        return { ...prev, score: data.score, status: data.status };
      });
      if (!data || data.status !== GameStatus.STARTED) {
        // show game finished popup with result
        // router.back();
        return;
      }
      if (waitingPopup) setWaitingPopup(false);
      // data has started, update game object
      leftPaddle = data.paddle[data.players[0]];
      rightPaddle = data.paddle[data.players[1]];
      ball = data.ball;
      status = data.status;
    });

    socket.off("emit_game_finish").on("emit_game_finish", (data: any) => {
      console.log("GAME FINISHED", data.status);
      setGame((prev: any) => {
        return { ...prev, score: data.score, status: data.status };
      });
      status = data.status;
    });

    return () => {
      if (getGameStatus() === GameStatus.FINISHED) {
        setGame(null);
        return;
      }
      if (isPlaying === "true")
        socket.emit("leave_game", { userId: getOpponentId(game) });
      else socket.emit("stop_spectate_game", { gameId: game.id });
      setGame(null);
    };
  }, []);

  // Rendering
  useEffect(() => {
    canvasRef.current?.focus();
    render();
  }, []);

  // Emitting events
  const keyboardevent = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPlaying === "false") return;
    if (e.key === "ArrowUp") {
      socket.emit("game_move", { gameId: game.id, move: "UP" });
    } else if (e.key === "ArrowDown") {
      socket.emit("game_move", { gameId: game.id, move: "DOWN" });
    }
  };

  const [myData, setMyData] = useState<any>(null);
  const [opData, setOpData] = useState<any>(null);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${getMyId(game)}`, {
      withCredentials: true,
    }).then((res) => {
      setMyData(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }, [game && game?.status === GameStatus.FINISHED]);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${getOpponentId(game)}`, {
      withCredentials: true,
    }).then((res) => {
      setOpData(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }, [game && game?.status === GameStatus.FINISHED]);

  return (
    <div>
      {game && game?.status === GameStatus.FINISHED && (
        <Modal
          content={
            <>
              <div className={styles_r_w.part_up}>
                <div className={styles_r_w.text}>Game Result</div>
              </div>
              <div className={styles_r_w.leave_room_box}>
                <div className={styles_r_w.leave_room}>
                  {game.score[getOpponentId(game)] > game.score[getMyId(game)]
                    ? `You Lost The Game: ${game.score[getOpponentId(game)]
                    } - ${game.score[getMyId(game)]}`
                    : `You Won The Game: ${game.score[getMyId(game)]} - ${game.score[getOpponentId(game)]
                    }`}
                </div>
                <div className={styles_r_w.game_avatars}>
                  <div>
                    <Imag
                      src={myData.avatar}
                      alt="avatar"
                      width="100"
                      height="100"
                    ></Imag>
                  </div>
                  <div>
                    <Imag
                      src={opData.avatar}
                      alt="avatar"
                      width="100"
                      height="100"
                    ></Imag>
                  </div>
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
      )}
      {!game && (
        <Modal
          content={
            <>
              <div className={styles_r_w.part_up}>
                <div className={styles_r_w.text}>Game Result</div>
              </div>
              <div className={styles_r_w.leave_room_box}>
                <div className={styles_r_w.leave_room}>
                  The Game has finished.
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
      )}
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
              <Score
                score1={game?.score[game.players[0]] ?? 0}
                score2={game?.score[game.players[1]] ?? 0}
                username1={game?.usernames[game.players[0]] ?? "Player 1"}
                username2={game?.usernames[game.players[1]] ?? "Player 2"}
              />
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
