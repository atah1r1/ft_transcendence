import styles from "../styles/menu_nav.module.css"
import cn from "classnames"
import { MenuOutline, CloseOutline } from 'react-ionicons'

const MenuNav = ({menu, setMenu}: any) =>
{
  return (
    <>
      <div className={ styles.nav }>
        <div className={ styles.menu_btn } onClick={ () => setMenu( !menu ) }>
          {
            !menu &&
            <MenuOutline
              color={ '#fffff' }
              height="50px"
              width="50px"
            />
          }
          {
            menu &&
            <CloseOutline
              color={ '#fffff' }
              height="50px"
              width="50px"
            />
          }
        </div>
      </div>
      <div className={ cn( styles.menuNav, `${ menu && styles.navOpen }` ) }></div>
    </>
  )
}

export default MenuNav;