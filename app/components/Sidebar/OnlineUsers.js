import React from 'react';
import {observer} from 'mobx-react';
import online from 'stores/online';
import classNames from 'classnames';
import UserName from 'components/utility/User/UserName';
import UserAvatar from 'components/utility/User/UserAvatar';

export default @observer class OnlineUsers extends React.Component {
  render() {
    const users = online.sorted || [];
    var usersList = users.map((user, i) => {
      var userPosClass = Number.isInteger(i / 2) ? "user-line-1" : "user-line-0";

      var userLineClasses = classNames('user-item', userPosClass); // class names for users <li> in list

      return (
        <li key={i} className={userLineClasses}>
          <UserAvatar uid={user.uid}/>
          <div className="users-info">
            <UserName className="users-username" uid={user.uid} username={user.username}/>
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
