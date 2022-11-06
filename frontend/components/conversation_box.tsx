import styles from "../styles/conversation_box.module.css";
import cn from "classnames";
import { useEffect, useState } from "react";
import Image from "next/image";

const ConversationBox = ({
  conversations,
  getSenderInfo,
  messages,
  setCurrent_conv,
}: any) => {
  const [currentConv, setCurrentConv] = useState(conversations[0]?.fullName);

  const [newMessage, setNewMessage] = useState(
    conversations.map((ele: any, i: number) => ele === ele && i != 0)
  );

  // format date
  const formatDateAndTime = (date: string) => {
    if (!date) return;
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();
    return `${dateStr} ${timeStr}`;
  }

  return conversations.map((conv: any, i: number) => {
    return (
      <div key={i}>
        <div
          onClick={() => {
            setCurrentConv(conv.fullName);
            newMessage[i] = false;
            setNewMessage(newMessage);
            messages.forEach((msg: any) => {
              if (!msg.sender) {
                msg.avatar = conv.hasOwnProperty("group")
                  ? conv.group_image
                  : conv.image;
                msg.fullName = conv.hasOwnProperty("group")
                  ? conv.group_name
                  : conv.fullName;
              }
            });
            getSenderInfo([...messages]);
            setCurrent_conv(conv);
          }}
          className={cn(
            styles.conversation,
            currentConv === conv.fullName && styles.current_conv
          )}
        >
          {conv.hasOwnProperty("group") ? (
            <div className={styles.conversation_group_img}>
              {conv.group_user.map((conv: any, i: number) => {
                return (
                  i < 3 && (
                    <div key={i}>
                      <Image
                        src={conv.image === null ? "https://ui-avatars.com/api/?name=John+Doe" : conv.image}
                        alt="conversation_image"
                        width={"30px"}
                        height={"30px"}
                      ></Image>
                    </div>
                  )
                );
              })}
            </div>
          ) : (
            <div className={styles.conversation_img}>
              <Image
                src={conv.image === null ? "https://ui-avatars.com/api/?name=John+Doe" : conv.image}
                alt="conversation_image"
                width={"42px"}
                height={"42px"}
              ></Image>
            </div>
          )}
          <div>
            <p className={styles.conversation_name}>
              {conv.name}
            </p>
            <p className={styles.conversation_text}>{conv.lastMessage?.message}</p>
          </div>
          <div>
            <p className={styles.conversation_time}>{formatDateAndTime(conv.lastMessage?.createdAt)}</p>
            <p
              className={cn(
                currentConv !== conv.fullName &&
                  newMessage[i] &&
                  styles.conversation_number
              )}
            >
              {conv.wasRead ? "" : "1"}
            </p>
          </div>
        </div>
      </div>
    );
  });
};

export default ConversationBox;
