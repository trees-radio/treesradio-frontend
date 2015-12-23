import React from 'react';
import SidebarChanger from './SidebarChanger/SidebarChanger';
import Chat from './Chat/Chat';


var Sidebar = React.createClass({

  render: function() {
    return (
      <div id="sidebar">
        <SidebarChanger/>
        <div id="chatcontainertop" className="">
          <Chat
            loginData={this.props.loginData}
            chatData={this.props.chatData}
            sendMsg={this.props.sendMsg}
            loginState={this.props.loginState}
            />
        </div>
      </div>
    );
  }

});

module.exports = Sidebar;
