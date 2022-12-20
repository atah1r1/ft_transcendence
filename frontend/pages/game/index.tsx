import { useRouter } from "next/router";
import styles_box from "../../styles/style_box.module.css";
import React, { useState, } from "react";
import styled from "styled-components";
import MenuNav from "../../components/menuNav";
import SettingsNav from "../../components/settings_nav";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";

const Container = styled.div`
    background-image: url("/bg.jpeg");
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
    @font-face {
        font-family: 'street';
        src: url("/Act_Of_Rejection.ttf") format("truetype");
        
    }
    @font-face {
        font-family: 'spoopy';
        src: url("/SpoopyGhostPixel.ttf") format("truetype");
        font-size: 1.3rem;
    }
    form {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
`;

const JoinRoomButton = styled.button`
    box-shadow: rgba(0, 0, 0, 0.8) 0px 5px 15px;
    outline: none;
    background-color: #690759;
    color: #ffffff;
    font-size: 17px;
    border: 2px solid transparent;
    border-radius: 5px;
    padding: 4px 10px;
    transition: all 230ms ease-in-out;
    margin-top: 1em;
    margin-bottom: 12px;
    cursor: pointer;
    font-family: 'street';
    font-size: 50px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0.8em;

    &:hover {
        background-color: #ED006C;
        color: #ffd300;
        border: 2px solid #02CEFC;
        
    }
    p {
        font-size: 20px;
        margin: 0;
        font-family: 'spoopy';
        animation: blink 1.5s steps(3, start) infinite;
        padding-top: 10px;
        background: radial-gradient(circle at top right, #ffd300, #B9FDD5, #ffd300);
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

function Home ()
{
    const [ menu, setMenu ] = useState( false );
    const router = useRouter();

    const playGame = ( e: any ) =>
    {
        e.preventDefault();
        router.push( '/game/play' );
        // socket.emit('join_game');
        console.log( "join game" );
    }

    const singlePmode = ( e: any ) =>
    {
        e.preventDefault();
        router.push( '/game/play/vbot' );
    }



    return (
        <>
            <MenuNav menu={ menu } setMenu={ setMenu } />
            <div className={ styles_box.container }>
                <SettingsNav selected={ "game" } menu={ menu } />
                <div className={ styles_box.profile_details }>
                    <Logout />
                    <Container>
                        <form>
                            <JoinRoomButton
                                type="submit"
                                onClick={ playGame }
                            >PLAY
                                <p>PvP</p>
                            </JoinRoomButton>
                            <JoinRoomButton
                                type="submit"
                                onClick={ singlePmode }
                            >PLAY
                                <p>PvAI</p>
                            </JoinRoomButton>
                        </form>
                    </Container>
                </div>
            </div>
        </>
    );
}

export default Home;

export const getServerSideProps = requireAuthentication( async () =>
{
    return {
        props: {
        }, // will be passed to the page component as props
    }
} )