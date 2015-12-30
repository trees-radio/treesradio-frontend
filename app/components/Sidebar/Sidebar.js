import React from 'react';
import SidebarChanger from './SidebarChanger/SidebarChanger';
import Chat from './Chat/Chat';


var Sidebar = React.createClass({
  render: function() {
    let currentSidebar;
    switch(this.props.currentSidebar) {
      case 0:
        currentSidebar = (
          <Chat
            loginData={this.props.loginData}
            chatData={this.props.chatData}
            sendMsg={this.props.sendMsg}
            loginState={this.props.loginState}
            />
        )
        break;
      case 1:
        currentSidebar = (
          <div>Online Ents</div>
        )
        break;
      case 2:
      currentSidebar = (
        <div>Waitlist</div>
      )
        break;
      case 3:
        currentSidebar = (
          <div>About</div>
        )
        break;
      default:
    }


    return (
      <div id="sidebar">
        <SidebarChanger
          changeSidebar={this.props.changeSidebar}
          currentSidebar={this.props.currentSidebar}
          />
        <div id="chatcontainertop" className="">
          {currentSidebar}
        </div>
      </div>
    );
  }

});

export default Sidebar;
