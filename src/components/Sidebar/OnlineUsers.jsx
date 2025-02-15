import React from "react";
import { observer } from "mobx-react";
import UserName from "../utility/User/UserName";
import UserAvatar from "../utility/User/UserAvatar";
import profile from "../../stores/profile";
import online from "../../stores/online";
import getUsername from "../../libs/username";

class OnlineUsers extends React.Component {

  selectUser(user) {

  }

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
                <li title={`Member Since: ${user.memberSince}`}
                  key={i}
                  className={i % 2 === 0 ? "user-line-1 user-item" : "user-line-0 user-item"}
                >
                  <UserAvatar uid={user.uid} />
                  <div className="users-info">
                    <UserName className="users-username" uid={user.uid} onClick={async () => {
                      const username = await getUsername(user.uid);
                      $("#chatinput").val($("#chatinput").val() + " @" + username + " ");
                      this.props.goToChat();
                    }} />
                    <i
                      className={
                        user.feedback.likes === true
                          ? "fa fa-arrow-up users-upvote"
                          : user.feedback.dislikes === true && userCanSeeDislikes
                            ? "fa fa-arrow-down users-downvote"
                            : ""
                      }
                    />
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

export default observer(OnlineUsers);