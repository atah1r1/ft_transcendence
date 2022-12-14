import React, { useEffect, useRef, useState } from "react";
import paddle from "../paddle";
import styled from "styled-components";
import { io, Socket } from "socket.io-client";
import styles_box from "../../../../styles/style_box.module.css";
import requireAuthentication from "../../../../hooks/requiredAuthentication";
// export const socket = io('0.0.0.0:3001', {
//     query: {
//         userLogin: 'mougnou',
//     }
// }); //update this to mac pubic ip

//SCORE COMPONENT----------------
const ScoreContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    width: 70%;
    margin: auto;
    margin-top: .5rem;
    padding: .4rem;
    background-color: #16213E;
    border-radius: 0.5rem;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5);
    @font-face {
        font-family: 'street';
        src: url("Act_Of_Rejection.ttf") format("truetype");
    }
`;

const ScoreContainerP1 = styled.div`
    outline: none;
    background-color: #02CEFC;
    color: #16213E;
    border: 2px solid transparent;
    border-radius: .5rem;
    margin-right: 0.2rem;
    float : left;
    width: 100%;
    font-size: 30px;
    text-align: center;
    font-family: 'street';
    justify-content: center;
    p {
        font-size: 20px;
        text-align: center;
        font-family: 'street';
        justify-content: center;
    }
    h2 {
        margin: 0;
    }
`;
const ScoreContainerP2 = styled.div`
    outline: none;
    background-color: #ED006C;
    color: #ffffff;
    font-size: 30px;
    border: 2px solid transparent;
    border-radius: .5rem;
    float : right;
    margin-left: 0.2em;
    width :100%;
    text-align: center;
    font-family: 'street';
    justify-content: center;
    p {
        font-size: 20px;
        text-align: center;
        font-family: 'street';
        justify-content: center;
    }
    h2 {
        margin: 0;
    }
`;

//END OF SCORE--------------------------------

const BALL = {
    id: 0,
    x: 640,
    y: 350,
    dx: 4,
    dy: 4,
    rad: 10,
    speed: 10
};


const Container = styled.div`
    background-image:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
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
    padding: .4rem;
`;

let rightPaddle: any = {
    x: 1264,
    y: 0,
    width: 8,
    height: 100,
    colour: '#ED006C',
    side: 'right',
    points: 1,
};

let leftPaddle: any = {
    x: 4,
    y: 0,
    width: 8,
    height: 100,
    colour: "#02CEFC",
    side: "left",
    points: 1,
};


function Bot_game ()
{
    const [ menu, setMenu ] = useState( false );

    const canvasRef = useRef<HTMLCanvasElement>( null );
    const [ p1Score, setP1Score ] = React.useState( 0 );
    const [ p2Score, setP2Score ] = React.useState( 0 );

    let animation_id: any;
    // let gameOn: boolean = false;;
    // const audio = new Audio('touch.wav');



    useEffect( () =>
    {

        const renderCanvas = () =>
        {
            const canvasBG = canvasRef.current;
            const ctxBG = canvasBG?.getContext( '2d' );
            const bg = new Image();
            bg.src = '/splash.png';
            bg.onload = function ()
            {
                ctxBG?.drawImage( bg, 0, 0, canvasBG!.width, canvasBG!.height );
            }
        }

        const renderPaddle = () =>
        {
            const paddleC = canvasRef.current;
            const ctx = paddleC?.getContext( '2d' );
            paddle( ctx, paddleC, leftPaddle );
        }

        const aiIQ100 = () =>
        {

            const paddleC = canvasRef.current;
            const ctx = paddleC?.getContext( '2d' );
            paddle( ctx, paddleC, rightPaddle );

            let Vy = Math.abs( BALL.dy ) - 0.48;
            if ( BALL.y < rightPaddle.y + rightPaddle.height / 2 )
            {
                rightPaddle.y = rightPaddle.y - Vy;
            }
            else
            {
                rightPaddle.y = rightPaddle.y + Vy;
            }
            // if (rightPaddle.x < rightPaddle.y && rightPaddle.y < paddleC?.height! - rightPaddle.height - rightPaddle.x){
            //     rightPaddle.y = rightPaddle.y;
            // }
        }

        const moveBall = () =>
        {
            const ballC = canvasRef.current;
            const ctx = ballC?.getContext( '2d' );
            ctx?.beginPath();
            ctx?.arc( BALL.x, BALL.y, BALL.rad, 0, Math.PI * 2, false );
            ctx!.fillStyle = '#ffffff';
            ctx!.strokeStyle = '#000000';
            ctx?.fill();
            ctx?.stroke();
            ctx?.closePath();


            // BALL MOVEMENT
            if ( BALL.y < 0 || BALL.y + BALL.rad > ballC!.height )
            {
                BALL.dy = -BALL.dy;
            }

            function collision ( objPlayer: any, objBall: any )
            {
                if (
                    objPlayer.x + objPlayer.width > objBall.x &&
                    objPlayer.x < objBall.x + objBall.rad &&
                    objPlayer.y + objPlayer.height > objBall.y &&
                    objPlayer.y < objBall.y + objBall.rad )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

            //Paddle collision

            if ( collision( leftPaddle, BALL ) && BALL.dx < 0 )
            {
                BALL.dx = -BALL.dx;
                // audio.play();
            }

            if ( collision( rightPaddle, BALL ) && BALL.dx > 0 )
            {
                BALL.dx = -BALL.dx;
                // audio.play();
            }

            // Score
            if ( BALL.x + BALL.rad > ballC!.width )
            {
                setP1Score( leftPaddle.points++ );
                BALL.x = ballC!.width / 2;
                BALL.y = ballC!.height / 2;
                BALL.dx = 5;
                BALL.dy = 5;
            }
            if ( BALL.x < 0 )
            {
                setP2Score( rightPaddle.points++ );
                BALL.x = ballC!.width / 2;
                BALL.y = ballC!.height / 2;
                BALL.dx = -5;
                BALL.dy = -5;
            }

            BALL.x += BALL.dx;
            BALL.y += BALL.dy;
        }
        const render = () =>
        {

            renderCanvas();
            renderPaddle();
            moveBall();
            aiIQ100();

            canvasRef.current!.focus();
            animation_id = requestAnimationFrame( render );
        };
        requestAnimationFrame( render );
        render();
        canvasRef.current?.focus();
    }, [] );


    const keyboardevent = ( e: React.KeyboardEvent<HTMLCanvasElement> ) =>
    {
        if ( e.key === "ArrowUp" && leftPaddle.y > 0 )
        {
            leftPaddle.y -= 40;
            console.log( leftPaddle.y );
        }
        else if ( e.key === "ArrowDown" && leftPaddle.y < 620 )
        {
            leftPaddle.y += 40;
        }
    }
    // function api_updates() {
    //     socket.on('player_moved', data => {
    //         if (data.side === 'left') {
    //             leftPaddle = data;
    //         }
    //         else if (data.side === 'right') {
    //             rightPaddle = data;
    //         }
    //     });
    //     keypress = false;

    // }
    // socket.off('play_sound').on('play_sound', () => {
    //     audio.play();
    // });

    return (
        <>
            {/* <MenuNav menu={ menu } setMenu={ setMenu } /> */ }
            <div className={ styles_box.container }>
                {/* <SettingsNav selected={ "home" } menu={ menu } /> */ }
                <div className={ styles_box.profile_details }>
                    <Container>
                        <GameContainer id="game" ref={ canvasRef }
                            tabIndex={ 0 }
                            onKeyDown={ keyboardevent }
                            width="1280" height="720">
                        </GameContainer>
                        <ScoreContainer>
                            <ScoreContainerP1>
                                <p> SENKO </p>
                                <h2> { p1Score }</h2>
                            </ScoreContainerP1>

                            <ScoreContainerP2>
                                <p> PUNK </p>
                                <h2> { p2Score } </h2>
                            </ScoreContainerP2>
                        </ScoreContainer>
                    </Container>
                </div>
            </div>
        </>
    );
}
export default Bot_game;

export const getServerSideProps = requireAuthentication( async () =>
{
    return {
        props: {
        }, // will be passed to the page component as props
    }
} )