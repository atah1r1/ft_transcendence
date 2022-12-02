// import type { AppProps } from 'next/app'
// import React, { useState } from 'react';

// const initialChats: any[] = [];

// export const ChatContext = React.createContext<[any[], React.Dispatch<React.SetStateAction<any[]>>]>([initialChats, (value) => {
//     console.log("ChatContext DISPATCH", value);
// }]);

// const ChatStore = ({ children }: any) => {
//     const [chats, setChats] = useState(initialChats);

//     return (
//         <ChatContext.Provider value={[chats, setChats]}>{children}</ChatContext.Provider>
//         );
// };

// export default ChatStore;