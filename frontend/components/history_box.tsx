import styles from "../styles/history.module.css";
import styles_p from "../styles/profile.module.css";
import styles_f from "../styles/friends.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";

const HistoryBox = ( { history }: any ) =>
{

  const [ empty, setEmpty ] = useState( false );

  useEffect( () =>
  {
    setTimeout( () =>
    {
      !history.length && setEmpty( true );
    }, 100 )
  } )

  return history.length ?
    history.map( ( ele: any, i: any ) =>
    {
      return (
        <div className={ styles.history_box } key={ i }>
          <div className={ styles.history_avatar }>
            <Image src={ ele?.avatar ?? "https://picsum.photos/300/300" } alt={ "avatar" } width={ 54 } height={ 54 } layout="fixed" className={ styles_p.profile_avatar } />
            <div className={ styles.history_numberGame }>{ ele.numberGame }</div>
          </div>
          <div className={ styles.history_score_points }>
            <div>score { ele.score }</div>
            <div
              style={ {
                color: `${ Number( ele.victory ) > Number( ele.defeat ) ? "#3BA658" : "#EA4335"
                  }`,
              } }
            >
              { ele.points }
            </div>
          </div>
          <div className={ styles.history_achievements }>
            { ele.achievements.map( ( ele: string, i: number ) =>
            {
              return ( <Image
                key={ i.toString() }
                src={ ele }
                alt={ "achivement" }
                width={ "28%" }
                height={ "28%" }
              /> )
            } ) }
          </div>
          <div className={ styles.history_victory_defeat }>
            <div className={ styles.history_victory_defeat_box }>
              <p
                style={ {
                  color: `${ Number( ele.victory ) > Number( ele.defeat )
                    ? "#3BA658"
                    : "#EA4335"
                    }`,
                } }
              >
                { Number( ele.victory ) > Number( ele.defeat ) ? "vectory" : "defeat" }
              </p>
              <div className={ styles.victory_defeat_box }>
                <div>{ ele.victory }</div>
                <p>-</p>
                <div>{ ele.defeat }</div>
              </div>
            </div>
          </div>
          <div className={ styles.history_gameMode_time }>
            <div>{ ele.gameMode }</div>
            <div>{ ele.time }</div>
          </div>
        </div>
      );
    } ) :
    empty && <div className={ styles_f.noresult }>
      <Image
        src={ "/noresult.png" }
        alt="no_result_img"
        width="220"
        height="220"
      ></Image>
    </div>;
};

export default HistoryBox;
