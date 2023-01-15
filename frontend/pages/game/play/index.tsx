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

  let canvasRef = useRef<HTMLCanvasElement>(null);
  // let rightPaddle: any = {};
  // let leftPaddle: any = {};
  let animation_id: any;

  let getOpponentId = (gameData: any): string => {
    const userId = localStorage.getItem("userId");
    const opId = gameData.players.find(
      (playerId: string) => playerId !== userId
    );
    return opId;
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
      setGame(data);
      if (!data || data.status !== GameStatus.STARTED) {
        // show game finished popup with result
        // redirect to home
        router.back();
        return;
      }
      if (waitingPopup) setWaitingPopup(false);

      // data has started, update game object
      // leftPaddle = data.paddle[data.players[0]];
      // rightPaddle = data.paddle[data.players[1]];

      // update ball position
      render(
        data.ball,
        data.paddle[data.players[0]],
        data.paddle[data.players[1]]
      );
    });

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
      ctx!.fillStyle = "#ffffff";
      ctx!.strokeStyle = "#000000";
      ctx?.fill();
      ctx?.stroke();
      ctx?.closePath();
    };

    const render = (ballData: any, leftPaddle: any, rightPaddle: any) => {
      renderCanvas();
      renderPaddle(leftPaddle, rightPaddle);
      renderBall(ballData);
      canvasRef.current?.focus();
      //animation_id = requestAnimationFrame(render);
    };
    //requestAnimationFrame(render);
    canvasRef.current?.focus();

    return () => {
      if (!game || game.status === GameStatus.FINISHED) {
        setGame(null);
        return;
      }
      if (isPlaying === "true")
        socket.emit("leave_game", { userId: getOpponentId(game) });
      else socket.emit("stop_spectate_game", { gameId: game.id });
      setGame(null);
    };
  }, [socket]);

  // Rendering and emmiting events
  // useEffect(() => {
  // }, []);

  const keyboardevent = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key === "ArrowUp") {
      socket.emit("game_move", { gameId: game.id, move: "UP" });
    } else if (e.key === "ArrowDown") {
      socket.emit("game_move", { gameId: game.id, move: "DOWN" });
    }
  };

  return (
    <>
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
            />
          </Container>
        </div>
      </div>
    </>
  );
}
export default Game;

export const getServerSideProps = requireAuthentication(async () => {
  return {
    props: {}, // will be passed to the page component as props
  };
});
