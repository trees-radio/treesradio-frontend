
import React from 'react';

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
    return (
      <div className="row sidebar-changer">
        <div className="show-chat-btn col-lg-3 sidebar-selected" ref="sel-chat" onClick={this.switchChat}>Chat</div>
        <div className="show-ousers-btn col-lg-3" ref="sel-online" onClick={this.switchOnline}>Online Ents</div>
        <div className="show-waitlist-btn col-lg-3" ref="sel-waitlist" onClick={this.switchWaitlist}>Waitlist</div>
        <div className="show-about-btn col-lg-3" ref="sel-about" onClick={this.switchAbout}>About</div>
      </div>
    )
  }

});

export default SidebarChanger;

// sidebar-selected
