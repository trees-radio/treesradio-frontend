import React from "react";
import {observer} from "mobx-react";
import online from "stores/online";
import classNames from "classnames";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import profile from "stores/profile";

let usersList, lastUpdate;

@observer
export default class OnlineUsers extends React.Component {
  render() {

    let users = online.listWithFeedback;
    
    users.sort(
        (a,b) => {
          return ( a.rank == b.rank ? 0 : ( a.rank > b.rank ? 1 : -1 ));
        }
    );

    usersList = users.map((user, i) => {
      var userPosClass = i%2 == 0 ? "user-line-1" : "user-line-0";

      var userLineClasses = classNames("user-item", userPosClass);
      // class names for users <li> in list
      let icon, grabIcon;

      if (user.liked) {
        icon = <i className="fa fa-arrow-up users-upvote" />;
      }

      if (user.grabbed) {
        grabIcon = <i className="fa fa-bookmark users-grab" />;
      }

      const userRankCanSeeDislikes = profile.rankPermissions.canSeeDownvotes === true;
      const userCanSeeDislikes = profile.isAdmin || userRankCanSeeDislikes;

      if (user.disliked && userCanSeeDislikes) {
        icon = <i className="fa fa-arrow-down users-downvote" />;
      }
      
      return (
        <li key={i} className={userLineClasses}>
          <UserAvatar uid={user.uid} />
          <div className="users-info">
            <UserName className="users-username" uid={user.uid} username={user.username} />
            {" "}
            {icon}
            {" "}
            {grabIcon}
          </div>
        </li>
      );
    });

    return (
      <div className="users-scroll" style={this.props.show ? {} : {display: "none"}}>
        <ul className="users-list">
          {usersList}
        </ul>
      </div>
    );
  }
}
