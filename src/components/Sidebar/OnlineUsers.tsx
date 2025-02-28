import React from "react";
import { observer } from "mobx-react";
import UserName from "../utility/User/UserName";
import UserAvatar from "../utility/User/UserAvatar";
import profile, {Profile} from "../../stores/profile";
import online, { OnlineEnt } from "../../stores/online";
import getUsername from "../../libs/username";

interface OnlineUsersProps {
  show: boolean;
  goToChat: () => void;
}

class OnlineUsers extends React.Component {

  selectUser(user: OnlineEnt) {
    $("#chatinput").val($("#chatinput").val() + " @" + user.username + " ");
    this.props.goToChat();
  }
  
  props: OnlineUsersProps;

  constructor(props: OnlineUsersProps) {
    super(props);
    this.props = props;
    this.selectUser = this.selectUser.bind(this);
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
            {online.online.map((user: OnlineEnt, i: number) => {
              return (
                <li title={`Member Since: ${user.memberSince}`}
                key={user.uid}
                onClick={() => this.selectUser(user)}
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