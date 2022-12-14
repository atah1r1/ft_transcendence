import { useRouter } from "next/router";
import React from "react";
import styled from "styled-components";

const ContainerBaground = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top : 0;
    left: 0;
`;
const JoinRoomcontainer = styled.div`
    width: 20em;
    align-items: center;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    background: linear-gradient(112.85deg, #16213E 0.53%, rgba(15, 52, 96, 0.81) 39.36%, rgba(120, 52, 131, 0.85) 63.75%, rgba(233, 69, 96, 0.7) 99.58%, rgba(233, 69, 96, 0.7) 99.58%);;
    border-radius: 0.5rem;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    font-size: 1.5rem;
    font-weight: bold;
    z-index: 999;
    @font-face {
        font-family: 'PsBold';
        src: url("PsBold.ttf") format("truetype");
        font-size: 1.3rem;
    }
    @font-face {
        font-family: 'spoopy';
        src: url("SpoopyGhostPixel.ttf") format("truetype");
        font-size: 1.3rem;
    }
    @font-face {
        font-family: 'street';
        src: url("Act_Of_Rejection.ttf") format("truetype");
        font-size: 1.3rem;
    }
   
    h4 {
        font-size: 2rem;
        margin : 0;
        margin-top: 1rem;
        margin-bottom: 2rem;
        justify-content: center;
        align-items: center;
        color: white;
        z-index: 2;
        animation: blink 1.5s steps(3, start) infinite;
        padding-top: 10px;
        background: radial-gradient(circle at top right, #02E0B9, #B9FDD5, #55C595);
        -webkit-background-clip: text;
	    -webkit-text-fill-color: transparent;
        font-family: 'spoopy';
        @keyframes blink {
            to {
                visibility: hidden;
            }
        }
    }
    
`;

const RoomIDInput = styled.input`
    height: 30px;
    width: 20em;
    font-size: 17px;
    outline: none;
    border: 1px solid #000000;
    border-radius: 3px;
    padding: 0 10px;
    margin-top: 0.5rem;

`;

const LoadingImg = styled.div`

  position: relative;
  height: 50px;
  width: 6px;
  background-color: transparent;
  animation: paddles 0.75s ease-out infinite;
  transform: translate3d(0,0,0);
  margin-bottom: 2rem;

  
  &:before {
    content: "";
    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 15px;
    width: 10px;
    height: 10px;
    background-color: #fff;
    border-radius: 100%;
    animation: ballbounce 0.6s ease-out infinite;
  }

@keyframes paddles {
  0% {
    box-shadow: -25px -10px 0px #02CEFC, 25px 10px 0px #ED006C;
  }
  50% {
    box-shadow: -25px 8px 0px #fff, 25px -10px 0px #fff;
  }
  100% {
    box-shadow: -25px -10px 0px #02CEFC, 25px 10px 0px #ED006C;
  }
}

@keyframes ballbounce {
    0%{
        transform: translateX(-20px) scale(1,1.2);
    }
    25%{
        transform: scale(1.2,1);
    }
    50% {
        transform: translateX(15px) scale(1,1.2);
    }
    75% {
        transform: scale(1.2,1);
    }
    100% {
        transform: translateX(-20px);
    }
}
`;


const JoinRoomButton = styled.button`
    outline: none;
    background-color: transparent;
    color: #ffd300;
    font-size: 17px;
    border: 2px solid transparent;
    border-radius: 5px;
    padding: 4px 10px;
    transition: all 230ms ease-in-out;
    margin-top: 1em;
    margin-bottom: 12px;
    cursor: pointer;
    font-family: 'street';
    font-size: 25px;
    border: 1px solid #02CEFC;
    padding-bottom: 0;
    margin-top: 0;

    &:hover {
        background-color: trasparent;
        color: #ED006C;
        border: 2px solid #690759;
        
    }

`;


export function JoinRoom ( props: any )
{

    const router = useRouter();
    const userCancelQueue = ( e: any ) =>
    {

        e.preventDefault();
        // socket.emit("cancelQueue");
        router.back();
    }

    return (
        <>
            <form>
                <ContainerBaground>
                    <JoinRoomcontainer>
                        <h4>* IN QUEUE *</h4>
                        <LoadingImg />
                        <JoinRoomButton onClick={ userCancelQueue }>Cancel</JoinRoomButton>
                    </ JoinRoomcontainer>
                </ContainerBaground>
            </form>
        </>
    );
}