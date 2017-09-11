import React from "react";
import {observer} from "mobx-react";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import profile from "stores/profile";
import fbase from "../../libs/fbase";

@observer
export default class OnlineUsers extends React.Component {

  items = [];

  constructor(props) {
    super(props);
    this.state = {
      liked: [],
      disliked: [],
      grabbed: [],
      users: []
    };

    this.items = [];
  }

  componentDidMount() {
    let me = this;
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

      fbase
      .database()
      .ref('presence')
      .on('child_added',
        (snap) => {
          let thisuser = snap.val();

          let keys = [];

          for ( let key in thisuser ) {
            keys.push(key);
          }

          let user = {};
          user.uid = keys[0];

              fbase
                .database()
                .ref('ranks')
                .child(user.uid)
                .on('value', (rank) => {
                  let thisrank = rank.val();

                  if ( !thisrank || !thisrank[user.uid] ) {
                    user.rank = 'User';
                  } else {
                    user.rank = thisrank[user.uid];
                  }
                  
                  
                  fbase
                    .database()
                    .ref('username')
                    .child(user.uid)
                    .on('value', (username) => {
                      let name = username.snap();
                      if ( name ) {
                        user.username = name[user.uid];
                      }
                      me.items.push(user);
                      
                      
                      // Yeah yeah, this might get expensive, we'll see.
                      me.items.sort( (a, b) => {
                        return ( a.rank > b.rank ? 1 : a.rank < b.rank ? -1 : 0 );
                      });

                      me.state.users = [];
                      
                      let flags = [];

                      for ( let i = 0; i < me.items.length; i++ ) {
                        if ( flags[me.items[i].uid] ) continue;
                        flags[me.items[i].uid] = true;
                        me.state.users.push(me.items[i]);
                      }
                      me.setState({users: me.items });

                      me.items = me.state.users; // write back clean list
                    })
                })
            }
          );

  fbase
      .database()
      .ref('presence')
      .on('child_removed',
        (snap) => {
          let user = snap.val();
          let keys = [];

          for ( let key in user ) {
            keys.push(key);
          }
          
          me.items.filter( (user) => {
            return user.uid !== keys[0];
          });
          me.setState({ users: me.items });
        });
  }
  
  render() {
    let me = this;
    fbase
      .database()
      .ref('presence')
      .on('value',
        (snap) => {

          let users = snap.val();
          let keys = [];

          for ( let key in users ) {
            keys.push(key);
          }

          if ( users ) 
          keys.forEach(
            function (thiskey) {
              let user = {};
              user.uid = thiskey;
              fbase
                .database()
                .ref('ranks')
                .child(user.uid)
                .on('value', (rank) => {
                  let thisrank = rank.val();

                  if ( !thisrank ) {
                    user.rank = 'User';
                  } else {
                    user.rank = thisrank;
                  }
                  fbase
                    .database()
                    .ref('usernames')
                    .child(user.uid)
                    .on('value', (username) => {
                      let name = username.val();

                      if ( name ) {
                        user.username = name;
                      }
                      
                      me.items.push(user);
                  
                      // Yeah yeah, this might get expensive, we'll see.
                      me.items.sort( (a, b) => {
                        return ( a.rank > b.rank ? 1 : a.rank < b.rank ? -1 : 0 );
                      });
                      let flags = [];
                      me.state.users = [];
                      
                      for ( let i = 0; i < me.items.length; i++ ) {
                        if ( flags[me.items[i].uid] ) continue;
                        flags[me.items[i].uid] = true;
                        me.state.users.push(me.items[i]);
                      }
                      me.items = me.state.users; // write back clean list
                      
                    })
                })
            }
          )
        });
    
    let userRankCanSeeDislikes = profile.rankPermissions.canSeeDownvotes === true;
    let userCanSeeDislikes = profile.isAdmin || userRankCanSeeDislikes;

    return (
      <div className="users-scroll" style={this.props.show ? {} : {display: "none"}}>
        <ul className="users-list">
          {
            this.state.users.map((user, i) => {
             
             return ( <li key={i} className={ i%2 == 0 ? "user-line-1 user-item" : "user-line-0 user-item" }>
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
                </li> );
            })  }
        </ul>
      </div>
    );
  }
}
