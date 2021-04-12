import React from "react";
import { observer } from "mobx-react";

import chat from "stores/chat";
import profile from "stores/profile";

import ChatContent from "./Chat/ChatContent";
import ChatSend from "./Chat/ChatSend";
import ChatLocked from "./Chat/ChatLocked";

@observer
export default class Chat extends React.Component {
  render() {
    return (
      <div id="chatcontainer" style={this.props.show ? {} : { display: "none" }}>
        <ChatContent />
        {chat.canChat ? (
          <ChatSend />
        ) : (
          <ChatLocked
            locked={chat.chatLocked}
            loggedIn={profile.loggedIn}
            secondsUntilUnlock={chat.secondsUntilUnlock}
          />
        )}
      </div>
    );
  }
}
