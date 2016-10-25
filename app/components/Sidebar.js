import React from 'react';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import classNames from 'classnames';

import online from 'stores/online';
import waitlist from 'stores/waitlist';

import Chat from './Sidebar/Chat';
import OnlineUsers from './Sidebar/OnlineUsers';
import About from './Sidebar/About';
import Waitlist from './Sidebar/Waitlist';

export default @observer class Sidebar extends React.Component {
  @observable currentSidebar = 'CHAT';

  render() {
    var chatSelected, onlineSelected, waitlistSelected, aboutSelected, sidebarComponent;
    switch (this.currentSidebar) {
      case 'CHAT':
        chatSelected = true;
        sidebarComponent = <Chat/>;
        break;
      case 'ONLINE':
        onlineSelected = true;
        sidebarComponent = <OnlineUsers/>;
        break;
      case 'WAITLIST':
        waitlistSelected = true;
        sidebarComponent = <Waitlist/>;
        break;
      case 'ABOUT':
        aboutSelected = true;
        sidebarComponent = <About/>;
        break;
      default:
    }

    let chatBtnClass = classNames(
      'show-chat-btn',
      'col-lg-3',
      { 'sidebar-selected': chatSelected }
    );
    let onlineBtnClass = classNames(
      'show-ousers-btn',
      'col-lg-3',
      { 'sidebar-selected': onlineSelected }
    );
    let waitlistBtnClass = classNames(
      'show-waitlist-btn',
      'col-lg-3',
      { 'sidebar-selected': waitlistSelected }
    );
    let aboutBtnClass = classNames(
      'show-about-btn',
      'col-lg-3',
      { 'sidebar-selected': aboutSelected }
    );

    return (
      <div id="sidebar">
        <div className="row sidebar-changer">
          <div className={chatBtnClass} ref="sel-chat" onClick={() => this.currentSidebar = 'CHAT'}>Chat</div>
          <div className={onlineBtnClass} ref="sel-online" onClick={() => this.currentSidebar = 'ONLINE'}>Online Ents <span className="online-count">{online.onlineCount}</span></div>
          <div className={waitlistBtnClass} ref="sel-waitlist" onClick={() => this.currentSidebar = 'WAITLIST'}>Waitlist <span className="waitlist-count">{waitlist.count}</span></div>
          <div className={aboutBtnClass} ref="sel-about" onClick={() => this.currentSidebar = 'ABOUT'}>About</div>
        </div>
        <div id="chatcontainertop" className="">
          {sidebarComponent}
        </div>
      </div>

    );
  }
}
