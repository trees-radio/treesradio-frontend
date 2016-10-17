import React from 'react';
import {observer} from 'mobx-react';
import waitlist from 'stores/waitlist';
import avatars from 'libs/avatars';
import classNames from 'classnames';

export default @observer class Waitlist extends React.Component {
  render() {
    var list = waitlist.list.map((u, i) => {
      setTimeout(() => avatars.loadAvatar(u.username));
      var avatar = avatars.users.get(u.username);

      return (
        <li key={i} className={classNames("waitlist-item", Number.isInteger(i / 2) ? "waitlist-line-1" : "waitlist-line-0")}>
          <div className="waitlist-position">
            <span>#{i+1}</span>
          </div>
          <div className="waitlist-avatar">
            <img src={avatar} className="waitlist-avatarimg"/>
          </div>
          <div className="waitlist-name-top">
            <span className="waitlist-name">{u.username}</span>
          </div>
        </li>
      );
    })

    return (
      <div className="waitlist-scroll">
        <ul className="waitlist-list">
          {list}
        </ul>
      </div>
    );
  }
}
