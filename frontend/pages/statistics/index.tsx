import styles from "../../styles/statistics.module.css";
import styles_p from "../../styles/profile.module.css";
import styles_box from "../../styles/style_box.module.css";
import SettingsNav from "../../components/settings_nav";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../components/menuNav";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";
import { DataContext } from "../_app";
import cn from "classnames";
import axios from "axios";

const History = () =>
{
  const [ data, setData ] = useContext( DataContext );
  const [ menu, setMenu ] = useState( false );
  const [ history, setHistory ] = useState( [] );

  useEffect( () =>
  {
    axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/game/${ data.id }/history`,
      { withCredentials: true } )
      .then( ( res ) =>
      {
        setHistory( res.data );
        console.log( 'history: ', res.data );
      } )
      .catch( ( error ) =>
      {
        console.log( 'error: ', error );
      } )
  }, [ data.id ] )

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "statistics" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <Logout />
          <div className={ styles.statistics_box }>
            <div className={ styles.part_one }>
              <div className={ styles.left }>
                <div className={ styles.avatar }>
                  <Image
                    src={ data?.avatar ?? "https://picsum.photos/300/300" }
                    alt="user_img"
                    width={ "100px" }
                    height={ "100px" }
                    className={ styles_p.profile_avatar }
                  ></Image>
                </div>
                <div>
                  <p className={ styles.user_name }>{ data.username }</p>
                  <div className={ styles.level_box }>
                    <div className={ styles.level_line }></div>
                    <div className={ styles.level_number_box }>
                      <p>LEVEL 2</p>
                      <p>LEVEL 3</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={ styles.right }>
                <p className={ styles.title }>MATCH PLAYED</p>
                <p className={ styles.match_number }>50</p>
                <div className={ styles.def_vic_box }>
                  <div className={ styles.defeat_box }>
                    <p className={ styles.defeat_text }>DEFEAT</p>
                    <p className={ styles.defeat_number }>20</p>
                  </div>
                  <div className={ styles.victory_box }>
                    <p className={ styles.victory_text }>VICTORY</p>
                    <p className={ styles.victory_number }>30</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={ styles.part_two }>
              <p className={ styles.ach_text }>ACHIEVMENTS</p>
              <div className={ styles.ach_medal }>
                <div className={ cn( styles.ach_medal_box, `${ !history.length && styles.non_medal }` ) }>
                  <div className={ styles.ach_goal }>first match</div>
                  <Image
                    src="/ach1.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
                <div className={ cn( styles.ach_medal_box, styles.non_medal ) }>
                  <div className={ styles.ach_goal }></div>
                  <Image
                    src="/ach2.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
                <div className={ cn( styles.ach_medal_box, styles.non_medal ) }>
                  <div className={ styles.ach_goal }></div>
                  <Image
                    src="/ach3.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
                <div className={ cn( styles.ach_medal_box, styles.non_medal ) }>
                  <div className={ styles.ach_goal }></div>
                  <Image
                    src="/ach4.png"
                    alt="medal_img"
                    width="150%"
                    height="150%"
                  ></Image>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;

export const getServerSideProps = requireAuthentication( async () =>
{
  return {
    props: {
    }, // will be passed to the page component as props
  }
} )