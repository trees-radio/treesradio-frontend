
import React from 'react';
import classNames from 'classnames';

var SidebarChanger = React.createClass({
  switchChat: function() {
    this.props.changeSidebar(0);
  },
  switchOnline: function() {
    this.props.changeSidebar(1);
  },
  switchWaitlist: function() {
    this.props.changeSidebar(2);
  },
  switchAbout: function() {
    this.props.changeSidebar(3);
  },
  render: function() {
    let chatSelected = false;
    let onlineSelected = false;
    let waitlistSelected = false;
    let aboutSelected = false;
    switch (this.props.currentSidebar) {
      case 0:
        chatSelected = true;
        break;
      case 1:
        onlineSelected = true;
        break;
      case 2:
        waitlistSelected = true;
        break;
      case 3:
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
    var onlineCount = this.props.userPresence.length;
    var waitlistCount = this.props.waitlist.length;
    return (
      <div className="row sidebar-changer">
        <div className={chatBtnClass} ref="sel-chat" onClick={this.switchChat}>Chat</div>
        <div className={onlineBtnClass} ref="sel-online" onClick={this.switchOnline}>Online Ents <span class="online-count">{onlineCount}</span></div>
        <div className={waitlistBtnClass} ref="sel-waitlist" onClick={this.switchWaitlist}>Waitlist <span class="waitlist-count">{waitlistCount}</span></div>
        <div className={aboutBtnClass} ref="sel-about" onClick={this.switchAbout}>About</div>
      </div>
    )
  }

});

export default SidebarChanger;

// sidebar-selected
