import styles from "../styles/history.module.css";
import Image from "next/image";

const HistoryBox = ( { history }: any ) =>
{
  return history.map( ( ele: any, i: any ) =>
  {
    return (
      <div className={ styles.history_box } key={ i }>
        <div className={ styles.history_avatar }>
          <Image src={ ele.avatar } alt={ "avatar" } width={ 54 } height={ 54 } />
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
              width={ "34%" }
              height={ "34%" }
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
  } );
};

export default HistoryBox;
