import React from "react";


import chat from "../../stores/chat";
import profile from "../../stores/profile";

import ChatContent from "./Chat/ChatContent";
import ChatSend from "./Chat/ChatSend";
import ChatLocked from "./Chat/ChatLocked";


const Chat = React.forwardRef((props, ref) =>
(
  <div id="chatcontainer" style={props.show ? {} : { display: "none" }}>
    <ChatContent goToChat={props.goToChat} />
    {chat.canChat ? (
      <ChatSend myref={ref} />
    ) : (
      <ChatLocked
        locked={chat.chatLocked}
        loggedIn={profile.loggedIn}
        secondsUntilUnlock={chat.secondsUntilUnlock}
      />
    )}
  </div>
));

Chat.displayName = "Chat";

export default Chat;
