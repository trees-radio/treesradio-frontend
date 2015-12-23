
import React from 'react';

var SidebarChanger = React.createClass({

  render: function() {
    return (
      <div className="row sidebar-changer">
        <div className="show-chat-btn col-lg-3">Chat</div>
        <div className="show-ousers-btn col-lg-3">Online Users</div>
        <div className="show-waitlist-btn col-lg-3">Waitlist</div>
        <div className="show-about-btn col-lg-3">About</div>
      </div>
    )
  }

});

module.exports = SidebarChanger;
