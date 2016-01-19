/**
 *
 * Chat!
 *
 * Created by zachb on 2015-12-05.
 *
 */

import React from 'react';
import ChatContent from './ChatContent/ChatContent.js';
import ChatSend from './ChatSend/ChatSend.js';

var Chat = React.createClass({
    componentDidMount: function(){

    },
    render: function(){
        return (
              <div id="chatcontainer">
                  <ChatContent
                    chatData={this.props.chatData}
                    />
                  <ChatSend
                    sendMsg={this.props.sendMsg}
                    loginData={this.props.loginData}
                    loginState={this.props.loginState}
                    chatCommands={this.props.chatCommands}
                    />
              </div>
        )
    }
});

export default Chat;
