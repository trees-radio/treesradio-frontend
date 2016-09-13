import React from 'react';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import classNames from 'classnames';

import fbase from 'stores/fbase';

import Chat from './New/Sidebar/Chat';
import OnlineUsers from './New/Sidebar/OnlineUsers';

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
        break;
      case 'ABOUT':
        aboutSelected = true;
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

    var online = fbase.online || {};

    return (
      <div id="sidebar">
        <div className="row sidebar-changer">
          <div className={chatBtnClass} ref="sel-chat" onClick={() => this.currentSidebar = 'CHAT'}>Chat</div>
          <div className={onlineBtnClass} ref="sel-online" onClick={() => this.currentSidebar = 'ONLINE'}>Online Ents <span className="online-count">{online.onlineCount}</span></div>
          <div className={waitlistBtnClass} ref="sel-waitlist" onClick={() => this.currentSidebar = 'WAITLIST'}>Waitlist <span className="waitlist-count">{0}</span></div>
          <div className={aboutBtnClass} ref="sel-about" onClick={() => this.currentSidebar = 'ABOUT'}>About</div>
        </div>
        <div id="chatcontainertop" className="">
          {sidebarComponent}
        </div>
      </div>

    );
  }
}
