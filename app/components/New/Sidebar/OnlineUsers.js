import React from 'react';
import {observer} from 'mobx-react';
import online from 'stores/online';
import classNames from 'classnames';
import avatars from 'libs/avatars';

export default @observer class OnlineUsers extends React.Component {
  render() {
    const users = online.sorted || [];
    var usersList = users.map((user, i) => {
      var userPosClass = Number.isInteger(i / 2) ? "user-line-1" : "user-line-0";

      var userClass = 'username-user';
      switch (user.title) {
        case 'Admin':
        userClass = 'username-admin';
        break;
        case 'Senior Mod':
        userClass = 'username-seniormod';
        break;
        case 'Mod':
        userClass = 'username-mod';
        break;
      }
      // TODO
      // var modLevel = "username-user"; // level 0
      // switch (msg['level']) {
      //   case 1:
      //     modLevel = "username-mod";
      //   break;
      //   case 2:
      //     modLevel = "username-seniormod";
      //   break;
      //   case 3:
      //     modLevel = "username-admin";
      //   break;
      // }

      var userLineClasses = classNames('user-item', userPosClass); // class names for users <li> in list
      var usernameClasses = classNames("users-name", userClass);

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
