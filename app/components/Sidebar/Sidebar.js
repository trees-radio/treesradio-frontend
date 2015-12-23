import React from 'react';
import Chat from './Chat/Chat';

var Sidebar = React.createClass({

  render: function() {
    return (
      <Chat
        loginData={this.props.loginData}
        chatData={this.props.chatData}
        sendMsg={this.props.sendMsg}
        loginState={this.props.loginState}
        />
    );
  }

});

module.exports = Sidebar;
