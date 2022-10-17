import cn from "classnames";
import styles from "../../../styles/chat.module.css";
import styles_box from "../../../styles/style_box.module.css";
import styles_s_l from "../../../styles/style_settings_nav.module.css";
import SettingsNav from "../../../components/settings_nav";

const History = () => {
  return (
    <div className={styles_box.container}>
      <SettingsNav selected={"statistics"} />
      <div className={styles_box.profile_details}></div>
    </div>
  );
};

export default History;
