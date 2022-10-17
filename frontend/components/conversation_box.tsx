import styles from "../styles/conversation_box.module.css";
import cn from "classnames";
import { useEffect, useState } from "react";

const ConversationBox = ({ conversations, getSenderInfo, messages }: any) => {
  const [currentConv, setCurrentConv] = useState(conversations[0]?.fullName);

  const [newMessage, setNewMessage] = useState(
    conversations.map((ele: any, i: number) => ele === ele && i != 0)
  );

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
                msg.avatar = conv.image;
                msg.fullName = conv.fullName;
              }
            });
            getSenderInfo([...messages]);
          }}
          className={cn(
            styles.conversation,
            currentConv === conv.fullName && styles.current_conv
          )}
        >
          <div className={styles.conversation_img}>
            <img src={conv.image}></img>
          </div>
          <div>
            <p className={styles.conversation_name}>{conv.fullName}</p>
            <p className={styles.conversation_text}>{conv.lastMessage}</p>
          </div>
          <div>
            <p className={styles.conversation_time}>{conv.lastTime}</p>
            <p
              className={cn(
                currentConv !== conv.fullName &&
                  newMessage[i] &&
                  styles.conversation_number
              )}
            >
              {currentConv !== conv.fullName &&
                newMessage[i] &&
                conv.messageNumber}
            </p>
          </div>
        </div>
      </div>
    );
  });
};

export default ConversationBox;
