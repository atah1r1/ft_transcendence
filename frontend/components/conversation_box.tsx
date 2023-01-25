import styles from "../styles/conversation_box.module.css";
import styles_p from "../styles/profile.module.css";
import styles_f from "../styles/friends.module.css";
import cn from "classnames";
import { useContext, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { ChatContext, CurrentConvContext } from "../pages/_app";

const ConversationBox = ({ searchInput }: any) => {
  const bottomRef = useRef<null | HTMLDivElement>(null);
  // format date
  const formatDateAndTime = (date: string) => {
    if (!date) return;
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();
    return `${dateStr} ${timeStr}`;
  };

  const [chats, setChats] = useContext(ChatContext);
  const [currentConv, setCurrentConv] = useContext(CurrentConvContext);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/chats`, {
        withCredentials: true,
      })
      .then((res) => {
        setChats(res.data);
      })
      .catch((err) => {
        // console.log( err );
      });
  }, []);

  useEffect(() => {
    // bottomRef.current?.scrollIntoView( { behavior: 'smooth' } )
  }, [chats]);

  const find = chats
    ? chats?.filter((chat: any) =>
        chat.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    : [];

  return chats.length ? (
    find.length ? (
      find.map((conv: any, i: number, arr: any) => {
        return (
          <div key={i}>
            <div
              onClick={() => {
                setCurrentConv(conv);
              }}
              className={cn(
                styles.conversation,
                ` ${conv.roomId === currentConv.roomId && styles.current_conv}`
              )}
            >
              <div className={styles.conversation_img}>
                <Image
                  src={
                    conv.image === null
                      ? "https://avatars.dicebear.com/api/bottts/test.svg"
                      : conv.image
                  }
                  alt="conversation_image"
                  width={"42px"}
                  height={"42px"}
                  className={styles_p.profile_avatar}
                ></Image>
              </div>
              <div>
                <p className={styles.conversation_name}>{conv.name}</p>
                <p className={styles.conversation_text}>
                  {conv.lastMessage?.message &&
                    conv.lastMessage?.message.slice(0, 24) +
                      (conv.lastMessage?.message?.length > 24 ? "..." : "")}
                </p>
              </div>
              <div>
                <p className={styles.conversation_time}>
                  {formatDateAndTime(conv.lastMessage?.createdAt)}
                </p>
                {conv.wasRead !== true && (
                  <p className={cn(styles.conversation_number)}>
                    {conv.wasRead ? "" : ""}
                  </p>
                )}
              </div>
            </div>
            <div ref={bottomRef} />
          </div>
        );
      })
    ) : (
      <div className={styles_f.noresult}>
        <Image
          src={"/noresult1.png"}
          alt="no_result_img"
          width="80"
          height="80"
        ></Image>
      </div>
    )
  ) : (
    <div className={styles_f.noresult}>
      <Image
        src={"/noresult.png"}
        alt="no_result_img"
        width="80"
        height="80"
      ></Image>
    </div>
  );
};

export default ConversationBox;
