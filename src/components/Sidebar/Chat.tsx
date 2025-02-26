import React, { RefObject } from "react";


import chat from "../../stores/chat";
import profile from "../../stores/profile";

import ChatContent from "./Chat/ChatContent";
import ChatSend from "./Chat/ChatSend";
import ChatLocked from "./Chat/ChatLocked";

interface ChatProps {
  show: boolean;
  goToChat: () => void;
}

const Chat = React.forwardRef<RefObject<HTMLInputElement>, ChatProps>((props, ref) =>
(
  <>
  <div id="chatcontainer" style={props.show ? {} : { display: "none" }}>
    <ChatContent goToChat={props.goToChat} />
    <div>
    {chat.canChat ? (
      <ChatSend myref={ref as unknown as React.RefObject<HTMLInputElement>} />
    ) : (
      <ChatLocked
        locked={chat.chatLocked}
        loggedIn={profile.loggedIn}
        secondsUntilUnlock={chat.secondsUntilUnlock}
      />
    )}
  </div>
  </div>
  
  </>
));

Chat.displayName = "Chat";

export default Chat;
