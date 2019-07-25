import React from "react";
import {observer} from "mobx-react";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import profile from "stores/profile";
import online from "stores/online";

@observer
export default class OnlineUsers extends React.Component {
  render() {
    let userRankCanSeeDislikes = profile.rankPermissions.canSeeDownvotes === true;
    let userCanSeeDislikes = profile.isAdmin || userRankCanSeeDislikes;
    if (!online.online) {
      return <div>Fetching Users</div>;
    } else {
      return (
        <div
          className="users-scroll"
          style={
            this.props.show
              ? {}
              : {
                  display: "none"
                }
          }
        >
          <ul className="users-list">
            {online.online.map((user, i) => {
              return (
                <li
                  key={i}
                  className={i % 2 == 0 ? "user-line-1 user-item" : "user-line-0 user-item"}
                >
                  <UserAvatar uid={user.uid} />
                  <div className="users-info">
                    <UserName className="users-username" uid={user.uid} username={user.username} />{" "}
                    <i
                      className={
                        user.feedback.likes === true
                          ? "fa fa-arrow-up users-upvote"
                          : user.feedback.dislikes === true && userCanSeeDislikes
                          ? "fa fa-arrow-down users-downvote"
                          : ""
                      }
                    />{" "}
                    <i
                      className={
                        user.feedback.grabs === true ? "fa fa-plus-square-o users-grab" : ""
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
  }
}
