
import React from 'react';
import classNames from 'classnames';

var OnlineUsers = React.createClass({

  render: function() {
    let users;
    let userPos = 0;
    users = this.props.userPresence.map(function(user, index) {
      let userPosClass = "";
      if (userPos == 0) {
        userPosClass = "user-line-1";
        userPos = 1;
      } else {
        userPosClass = "user-line-0";
        userPos = 0;
      }
      let userLineClasses = classNames('user-item', userPosClass); // class names for users <li> in list
      let userAvatar = "http://api.adorable.io/avatars/50/" + user['key'] + ".png";
      return (
        <li key={index} className={userLineClasses}>
          <div className="users-avatar">
            <img className="users-avatarimg" src={userAvatar}></img>
          </div>
          <div className="users-info">
            <span className="users-name">{user['key']}</span>
          </div>
        </li>
      )
    }, this);
    return (
      <div>
        {users}
      </div>
    );
  }

});

export default OnlineUsers;
