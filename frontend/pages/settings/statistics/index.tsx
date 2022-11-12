import cn from "classnames";
import styles from "../../../styles/statistics.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../../components/menuNav";


const History = () =>
{

  const [ menu, setMenu ] = useState( false );
  const [ data, setData ] = useState(
    {
      avatar: "https://cdn.intra.42.fr/users/yhadari.jpg",
      createdAt: "",
      first_name: "",
      id: "",
      last_name: "",
      two_factor_auth: false,
      updateAt: "",
      username: "",
    }
  )

  useEffect( () =>
  {
    const user = JSON.parse( localStorage.getItem( "user" ) as string );
    setData( user );
  }, [] )

  return (
    <>
      <MenuNav menu={ menu } setMenu={ setMenu } />
      <div className={ styles_box.container }>
        <SettingsNav selected={ "statistics" } menu={ menu } />
        <div className={ styles_box.profile_details }>
          <div className={ cn( styles_s_l.setting_btn, styles_s_l.current_btn, styles_box.logout_btn ) }>logout</div>
          <div className={ styles.statistics_box }>
            <div className={ styles.part_one }>
              <div className={ styles.left }>
                <div className={ styles.avatar }>
                  <Image
                    src={ data.avatar }
                    alt="user_img"
                    width={ "100px" }
                    height={ "100px" }
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
                <div className={ styles.ach_medal_box }>
                  <div className={ styles.ach_goal }>first match</div>
                  <Image
                    src="/ach1.png"
                    alt="medal_img"
                    width="180%"
                    height="180%"
                  ></Image>
                </div>
                <div className={ styles.ach_medal_box }>
                  <div className={ styles.ach_goal }></div>
                  <Image
                    src="/ach2.png"
                    alt="medal_img"
                    width="180%"
                    height="180%"
                  ></Image>
                </div>
                <div className={ styles.ach_medal_box }>
                  <div className={ styles.ach_goal }></div>
                  <Image
                    src="/ach3.png"
                    alt="medal_img"
                    width="180%"
                    height="180%"
                  ></Image>
                </div>
                <div className={ styles.ach_medal_box }>
                  <div className={ styles.ach_goal }></div>
                  <Image
                    src="/ach4.png"
                    alt="medal_img"
                    width="180%"
                    height="180%"
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
