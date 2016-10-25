import React from 'react';

import ChatContent from './Chat/ChatContent';
import ChatSend from './Chat/ChatSend';

export default class Chat extends React.Component {
  render() {
    return (
      <div id="chatcontainer">
        <ChatContent/>
        <ChatSend/>
        {/* <ChatContent
          chatData={this.props.chatData}
          />
          <ChatSend
          sendMsg={this.props.sendMsg}
          loginData={this.props.loginData}
          loginState={this.props.loginState}
          userPresence={this.props.userPresence}
          chatlock={p.chatlock}
        /> */}
      </div>
    );
  }
}
