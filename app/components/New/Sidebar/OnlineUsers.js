import React from 'react';
import {observer} from 'mobx-react';
import online from 'stores/online';
import classNames from 'classnames';
import avatars from 'libs/avatars';

export default @observer class OnlineUsers extends React.Component {
  render() {
    const users = online.list || [];
    var usersList = users.map((user, i) => {
      var userPosClass = Number.isInteger(i / 2) ? "user-line-1" : "user-line-0";

      var modLevel;

      var userLineClasses = classNames('user-item', userPosClass); // class names for users <li> in list
      var usernameClasses = classNames("users-name", modLevel);

      setTimeout(() => avatars.loadAvatar(user.username));
      var avatar = avatars.users.get(user.username);

      return (
        <li key={i} className={userLineClasses}>
          <div className="users-avatar">
            <img src={avatar} className="users-avatarimg"/>
          </div>
          <div className="users-info">
            <span className={usernameClasses}>{user.username}</span>
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
