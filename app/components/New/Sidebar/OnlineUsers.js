import React from 'react';
import {observer} from 'mobx-react';
import fbase from 'stores/fbase';
import classNames from 'classnames';

export default @observer class OnlineUsers extends React.Component {
  render() {
    const online = fbase.online || {};
    console.log(online);
    const users = online.onlineUsers || [];
    var usersList = users.map((user, i) => {
      var userPosClass = Number.isInteger(i / 2) ? "user-line-1" : "user-line-0";

      var modLevel;

      var userLineClasses = classNames('user-item', userPosClass); // class names for users <li> in list
      var usernameClasses = classNames("users-name", modLevel);

      var avatar = "//tr-avatars.herokuapp.com/avatars/50/" + user.user + ".png";

      return (
        <li key={i} className={userLineClasses}>
          <div className="users-avatar">
            {/* <ReactImageFallback
              className="users-avatarimg"
              src={userAvatar}
              fallbackImage={avatarFallback}
              initialImage="/img/no-avatar.gif"
            /> */}
            <img src={avatar} className="users-avatarimg"/>
          </div>
          <div className="users-info">
            <span className={usernameClasses}>{user.user}</span>
          </div>
        </li>
      );
    });
    return (
      <div className="users-scroll">
        <ul className="users-list">
          {usersList}
        </ul>
      </div>
    );
  }
}
