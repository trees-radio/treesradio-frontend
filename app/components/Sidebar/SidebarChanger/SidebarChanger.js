
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
    let chatSelected;
    let onlineSelected;
    let waitlistSelected;
    let aboutSelected;

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
      <div className="row sidebar-changer">
        <div className={chatBtnClass} ref="sel-chat" onClick={this.switchChat}>Chat</div>
        <div className={onlineBtnClass} ref="sel-online" onClick={this.switchOnline}>Online Ents</div>
        <div className={waitlistBtnClass} ref="sel-waitlist" onClick={this.switchWaitlist}>Waitlist</div>
        <div className={aboutBtnClass} ref="sel-about" onClick={this.switchAbout}>About</div>
      </div>
    )
  }

});

export default SidebarChanger;

// sidebar-selected
