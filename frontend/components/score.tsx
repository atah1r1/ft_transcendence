import React from "react";
import styled from "styled-components";

const ScoreContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  width: 70%;
  margin: auto;
  margin-top: 0.5rem;
  padding: 0.4rem;
  background-color: #16213e;
  border-radius: 0.5rem;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5);
  @font-face {
    font-family: "street";
    src: url("Act_Of_Rejection.ttf") format("truetype");
  }
`;
const ScoreContainerP1 = styled.div`
  outline: none;
  background-color: #02cefc;
  color: #16213e;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  margin-right: 0.2rem;
  float: left;
  width: 100%;
  font-size: 30px;
  text-align: center;
  font-family: "street";
  justify-content: center;
  p {
    font-size: 20px;
    text-align: center;
    font-family: "street";
    justify-content: center;
  }
  h2 {
    margin: 0;
  }
`;
const ScoreContainerP2 = styled.div`
  outline: none;
  background-color: #ed006c;
  color: #ffffff;
  font-size: 30px;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  float: right;
  margin-left: 0.2em;
  width: 100%;
  text-align: center;
  font-family: "street";
  justify-content: center;
  p {
    font-size: 20px;
    text-align: center;
    font-family: "street";
    justify-content: center;
  }
  h2 {
    margin: 0;
  }
`;

export let is_score: boolean = false;
export let p1_points: number = 0;
export let p2_points: number = 0;

export function Score(props: {
  score1: number;
  score2: number;
  username1: string;
  username2: string;
}) {
  return (
    <>
      <ScoreContainer>
        <ScoreContainerP1>
          <p> {props.username1} </p>
          <h2> {props.score1}</h2>
        </ScoreContainerP1>

        <ScoreContainerP2>
          <p> {props.username2} </p>
          <h2> {props.score2} </h2>
        </ScoreContainerP2>
      </ScoreContainer>
    </>
  );
}
export default Score;
