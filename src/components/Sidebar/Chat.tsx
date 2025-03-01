import React, { RefObject } from "react";
import chat from "../../stores/chat";
import profile from "../../stores/profile";

import ChatContent from "./Chat/ChatContent";
import ChatSend from "./Chat/ChatSend";
import ChatLocked from "./Chat/ChatLocked";

interface ChatProps {
  show: boolean;
  goToChat: () => void;
  chatInputRef: RefObject<HTMLInputElement | null>;
}

const Chat: React.FC<ChatProps> = (props) => (
  <div id="chatcontainer" 
       className="flex flex-col flex-1 overflow-hidden" 
       style={props.show ? {} : { display: "none" }}>
    <ChatContent goToChat={props.goToChat} />
    <div className="flex-shrink-0">
      {chat.canChat ? (
        <ChatSend myref={props.chatInputRef} />
      ) : (
        <ChatLocked
          locked={chat.chatLocked}
          loggedIn={profile.loggedIn}
          secondsUntilUnlock={chat.secondsUntilUnlock}
        />
      )}
    </div>
  </div>
);

export default Chat;