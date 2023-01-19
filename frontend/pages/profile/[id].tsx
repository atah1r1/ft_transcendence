import cn from "classnames";
import styles from "../../styles/profile.module.css";
import styles_box from "../../styles/style_box.module.css";
import styles_st from "../../styles/statistics.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import MenuNav from "../../components/menuNav";
import SettingsNav from "../../components/settings_nav";
import { useRouter } from "next/router";
import axios from "axios";
import requireAuthentication from "../../hooks/requiredAuthentication";
import Logout from "../../components/logout";
import ErrorPage from 'next/error';
import Loading from '../../components/Loading';
import HistoryBox from "../../components/history_box";

const FriendProfile = () =>
{
  const [ history, setHistory ] = useState( [
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "20",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "1",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "20",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
    {
      avatar: "https://cdn.intra.42.fr/users/df0bbcb990c18df8514510c3ce52b34a/bsanaoui.jpg",
      numberGame: "2",
      score: "1250",
      points: "-15",
      achievements: [ "/ach1.png", "/ach2.png", "/ach3.png" ],
      victory: "2",
      defeat: "10",
      gameMode: "game Mode",
      time: "17:06PM 06/10/2022",
    },
  ] );
  const [ notFound, setNotFound ] = useState( true );
  const [ loading, setLoading ] = useState( true );
  const [ data, setData ] = useState(
    {
      avatar: "",
      createdAt: "",
      first_name: "",
      id: "",
      last_name: "",
      two_factor_auth: false,
      updateAt: "",
      username: "",
    }
  );
  const [ menu, setMenu ] = useState( false );
  const router = useRouter()
  const { id } = router.query;

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/user/${ id }`, {
      withCredentials: true,
    } ).then( ( res ) =>
    {
      setData( res.data );
      setNotFound( false );
    } ).catch( ( err ) =>
    {
      console.log( 'error', err );
    } ).finally( () =>
    {
      setLoading( false );
    } )
  }, [] )

  if ( loading )
  {
    return <Loading />
  }

  if ( notFound )
  {
    return (
      <ErrorPage statusCode={ 404 } />
    )
  }

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <div className={ styles.details }>
            <Logout />
            <div className={ styles.details_up }>
              <div className={ styles.details_level }>
                <p>LEVEL</p>
                <span> 2</span>
              </div>
              <div className={ styles.details_avatar }>
                <div className={ styles.profile_box }>
                  <Image
                    src={ data?.avatar || "https://picsum.photos/300/300" }
                    alt="avatar"
                    width="180px"
                    height="180px"
                    className={ styles.profile_avatar }
                  ></Image>
                </div>
                { <p>{ data?.username }</p> }
              </div>
            </div>
            <div className={ styles.details_down }>
              <div className={ styles.box }>
                <div className={ styles.fr_avatars }>
                  <p className={ styles.ach_text }>ACHIEVMENTS</p>
                  <div className={ styles.ach_medal }>
                    <div className={ styles.ach_medal_box }>
                      <div className={ styles.ach_goal }>first match</div>
                      <Image
                        src="/ach1.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                    <div className={ styles.ach_medal_box }>
                      <div className={ styles.ach_goal }></div>
                      <Image
                        src="/ach2.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                    <div className={ styles.ach_medal_box }>
                      <div className={ styles.ach_goal }></div>
                      <Image
                        src="/ach3.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                    <div className={ styles.ach_medal_box }>
                      <div className={ styles.ach_goal }></div>
                      <Image
                        src="/ach4.png"
                        alt="medal_img"
                        width="100%"
                        height="100%"
                      ></Image>
                    </div>
                  </div>
                </div>
                <div className={ styles.fr_statistic }>
                  <div className={ styles_st.right }>
                    <p className={ styles_st.title }>MATCH PLAYED</p>
                    <p className={ styles_st.match_number }>50</p>
                    <div className={ styles_st.def_vic_box }>
                      <div className={ styles_st.defeat_box }>
                        <p className={ styles_st.defeat_text }>DEFEAT</p>
                        <p className={ styles_st.defeat_number }>20</p>
                      </div>
                      <div className={ styles_st.victory_box }>
                        <p className={ styles_st.victory_text }>VICTORY</p>
                        <p className={ styles_st.victory_number }>30</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={ styles.fr_history }>
                <HistoryBox history={ history }></HistoryBox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendProfile;

export const getServerSideProps = requireAuthentication( async () =>
{
  return {
    props: {
    }, // will be passed to the page component as props
  }
} )