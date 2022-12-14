import React from "react";
import styled from "styled-components";

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

export let is_score: boolean = false;
export let p1_points: number = 0;
export let p2_points: number = 0;

export function JoinRoom ( props: any )
{
    const [ p1Score, setP1Score ] = React.useState( 0 );
    const [ p2Score, setP2Score ] = React.useState( 0 );

    // useEffect(() => {


    //     socket.on('player1_scored', data => {

    //         setP1Score(data);
    //         //console.log('player1 scored', data);
    //         p1_points = p1Score;
    //         // console.log(p1_points);
    //         // is_score = true;

    //     });

    //     socket.on('player2_scored', data => {

    //         setP2Score(data);
    //         // console.log('player2 scored');
    //         p2_points = p2Score;
    //         // console.log(p2_points);

    //     });
    //     return () => {
    //         socket.off('player1_scored');
    //         socket.off('player2_scored');
    //     }
    // }, [socket]);

    return (
        <>
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
        </>
    );
} export default JoinRoom;