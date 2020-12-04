import React from "react";
import {observer} from "mobx-react";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import profile from "stores/profile";
import online from "stores/online";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
                    className={i % 2 === 0 ? "user-line-1 user-item" : "user-line-0 user-item"}
                >
                    <UserAvatar uid={user.uid}/>

                    <div className="users-info">
                      <span className="users-username">
                    <UserName className="users-username" uid={user.uid} username={user.username}/>{" "}</span>
                      <span className={user.feedback.likes
                                    ? "users-upvote"
                                    : user.feedback.dislikes === true && userCanSeeDislikes
                                    ? "users-downvote"
                                    : ""}>
                        { ( user.feedback.likes || user.feedback.dislikes ) &&
                            <FontAwesomeIcon icon={['fas', user.feedback.likes
                                    ? "arrow-up"
                                    : user.feedback.dislikes === true && userCanSeeDislikes
                                    ? "arrow-down"
                        : ""]} /> }</span>
                      <span className="users-grab">
                        { user.feedback.grabs && <FontAwesomeIcon icon={['fas', user.feedback.grabs ? "plus-square": "" ]} /> }
                      </span>
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
