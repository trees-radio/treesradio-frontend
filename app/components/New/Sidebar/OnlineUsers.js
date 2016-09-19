import React from 'react';
import {observer} from 'mobx-react';
import online from 'stores/online';
import classNames from 'classnames';
import Avatars from 'libs/avatars';

export default @observer class OnlineUsers extends React.Component {
  render() {
    const users = online.onlineUsers || [];
    var usersList = users.map((user, i) => {
      var userPosClass = Number.isInteger(i / 2) ? "user-line-1" : "user-line-0";

      var modLevel;

      var userLineClasses = classNames('user-item', userPosClass); // class names for users <li> in list
      var usernameClasses = classNames("users-name", modLevel);

      var avatar = new Avatars(user.user).avatar;

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
