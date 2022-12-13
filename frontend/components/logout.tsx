import styles_box from "../styles/style_box.module.css";
import styles_s_l from "../styles/style_settings_nav.module.css";
import cn from "classnames";
import { useRouter } from "next/router";
import Link from "next/link";

const Logout = () =>
{
  const router = useRouter();

  return <Link href={ `${ process.env.NEXT_PUBLIC_BACKEND_URL }/auth/logout` }>
    <div className={ cn( styles_s_l.setting_btn, styles_s_l.current_btn, styles_box.logout_btn ) } onClick={ () => router.push( '/' ) }>logout</div>
  </Link>
}

export default Logout;