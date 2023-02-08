import styles_box from "../../styles/style_box.module.css";
import styles_h from "../../styles/history.module.css";
import SettingsNav from "../../components/settings_nav";
import HistoryBox from "../../components/history_box";
import { useContext, useEffect, useState } from "react";
import MenuNav from "../../components/menuNav";
import Logout from "../../components/logout";
import requireAuthentication from "../../hooks/requiredAuthentication";
import axios from "axios";
import { DataContext } from "../_app";

const History = () => {
  const [inputForm, setInputForm] = useState("");
  const [data, setData] = useContext(DataContext);
  const [menu, setMenu] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game/${data.id}/history`, {
        withCredentials: true,
      })
      .then((res) => {
        setHistory(res.data.reverse());
      })
      .catch((error) => {
      });
  }, [data.id]);

  return (
    <>
      <MenuNav menu={menu} setMenu={setMenu} />
      <div className={styles_box.container}>
        <SettingsNav selected={"history"} menu={menu} />
        <div className={styles_box.profile_details}>
          <Logout />
          <div className={styles_h.history}>
            <HistoryBox history={history} id={data.id}></HistoryBox>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;

export const getServerSideProps = requireAuthentication(async () => {
  return {
    props: {}, // will be passed to the page component as props
  };
});
