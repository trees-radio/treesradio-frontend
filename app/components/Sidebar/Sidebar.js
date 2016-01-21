import React from 'react';
import SidebarChanger from './SidebarChanger/SidebarChanger';
import Chat from './Chat/Chat';
import OnlineUsers from './OnlineUsers/OnlineUsers';
import Waitlist from './Waitlist/Waitlist';
import About from './About/About';


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
            userPresence={this.props.userPresence}
            />
        )
        break;
      case 1:
        currentSidebar = (
          <OnlineUsers
            userPresence={this.props.userPresence}
            />
        )
        break;
      case 2:
      currentSidebar = (
        <Waitlist
          waitlist={this.props.waitlist}
          />
      )
        break;
      case 3:
        currentSidebar = (
          <About/>
        )
        break;
      default:
    }


    return (
      <div id="sidebar">
        <SidebarChanger
          changeSidebar={this.props.changeSidebar}
          currentSidebar={this.props.currentSidebar}
          userPresence={this.props.userPresence}
          waitlist={this.props.waitlist}
          />
        <div id="chatcontainertop" className="">
          {currentSidebar}
        </div>
      </div>
    );
  }

});

export default Sidebar;
