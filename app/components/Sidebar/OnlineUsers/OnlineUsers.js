
import React from 'react';
import classNames from 'classnames';
import ReactImageFallback from 'react-image-fallback';

var OnlineUsers = React.createClass({

  render: function() {
    let users;
    let userPos = 0;
    users = this.props.userPresence.map(function(user, index) {
      if (user['online']) {
        let userPosClass = "";
        if (userPos == 0) {
          userPosClass = "user-line-1";
          userPos = 1;
        } else {
          userPosClass = "user-line-0";
          userPos = 0;
        }
        var userLineClasses = classNames('user-item', userPosClass); // class names for users <li> in list

        var modLevel = "username-user"; // level 0
        if (this.props.staff[user['uid']]) {
          var level = this.props.staff[user['uid']];
          switch (level) {
            case 1:
              modLevel = "username-mod";
            break;
            case 2:
              modLevel = "username-seniormod";
            break;
            case 3:
              modLevel = "username-admin";
            break;
          }
        }
        var usernameClasses = classNames("users-name", modLevel);


        var userAvatar;
        if (user['avatar']) {
          userAvatar = "//" + user['avatar'];
        } else {
          userAvatar = "http://api.adorable.io/avatars/50/" + user['key'] + ".png";
        }
        var avatarFallback = "http://api.adorable.io/avatars/50/" + user['key'] + ".png";

        return (
          <li key={index} className={userLineClasses}>
            <div className="users-avatar">
              <ReactImageFallback
                className="users-avatarimg"
                src={userAvatar}
                fallbackImage={avatarFallback}
                initialImage="/img/no-avatar.gif"
                />
            </div>
            <div className="users-info">
              <span className={usernameClasses}>{user['key']}</span>
            </div>
          </li>
        )
      } else {
        return "";
      }

    }, this);
    return (
      <div className="users-scroll">
        <ul className="users-list">
          {users}
        </ul>
      </div>
    );
  }

});

export default OnlineUsers;
