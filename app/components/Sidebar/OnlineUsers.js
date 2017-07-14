import React from "react";
import {observer} from "mobx-react";
import online from "stores/online";
import classNames from "classnames";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import profile from "stores/profile";
import fbase from "../../libs/fbase";

let usersList, lastUpdate;

@observer
export default class OnlineUsers extends React.Component {

  state = {
    liked: [],
    disliked: [],
    grabbed: []
  };

  componentDidMount() {
    fbase
      .database()
      .ref('playing')
      .child('feedback_users')
      .child('likes')
      .on('child_added', (snap) => {
        this.state.liked.push(snap.val());
        this.setState(this.state);
      });
    fbase
      .database()
      .ref('playing')
      .child('feedback_users')
      .child('likes')
      .on('child_removed', (snap) => {
        let index = this.state.liked.indexOf(snap.val());
        this.state.liked.splice(index, 1);
        this.setState(this.state);
      });
    fbase
      .database()
      .ref('playing')
      .child('feedback_users')
      .child('dislikes')
      .on('child_added', (snap) => {
        this.state.disliked.push(snap.val());
        this.setState(this.state);
      });
    fbase
      .database()
      .ref('playing')
      .child('feedback_users')
      .child('dislikes')
      .on('child_removed', (snap) => {
        let index = this.state.disliked.indexOf(snap.val());
        this.state.disliked.splice(index, 1);
        this.setState(this.state);
      });
    fbase
      .database()
      .ref('playing')
      .child('feedback_users')
      .child('grabs')
      .on('child_added', (snap) => {
        this.state.grabbed.push(snap.val());
        this.setState(this.state);
      });
    fbase
      .database()
      .ref('playing')
      .child('feedback_users')
      .child('grabs')
      .on('child_removed', (snap) => {
        let index = this.state.grabbed.indexOf(snap.val());
        this.state.grabbed.splice(index, 1);
        this.setState(this.state);
      });
    
  }
  render() {
    
    let users = online.listWithFeedback;
    
    users.sort(
        (a,b) => {
          return ( a.rank == b.rank ? 0 : ( a.rank > b.rank ? 1 : -1 ));
        }
    );

    usersList = users.map((user, i) => {
     
      let userRankCanSeeDislikes = profile.rankPermissions.canSeeDownvotes === true;
      let userCanSeeDislikes = profile.isAdmin || userRankCanSeeDislikes;
      
      return (
        <li key={i} className={ i%2 == 0 ? "user-line-1 user-item" : "user-line-0 user-item" }>
          <UserAvatar uid={user.uid} />
          <div className="users-info">
            <UserName className="users-username" uid={user.uid} username={user.username} />
            {" "}
            <i className={ this.state.liked.includes(user.uid) 
                            ? "fa fa-arrow-up users-upvote" 
                            : this.state.disliked.includes(user.uid) && userCanSeeDislikes 
                              ? "fa fa-arrow-down users-downvote" : "" } />
            {" "}
            <i className={ this.state.grabbed.includes(user.uid) 
                            ? "fa fa-bookmark users-grab" : "" } />
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
