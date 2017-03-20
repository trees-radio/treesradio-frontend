import {observable, computed, autorunAsync} from 'mobx';
import fbase from 'libs/fbase';
import getUsername from 'libs/username';
import playing from 'stores/playing';

export default new class Online {
  constructor() {
    this.fbase = fbase;
    
    fbase.database().ref('presence').on('value', (snap) => {
      var list = [];
      var user = snap.val();

      for ( var key in user ) {
        console.log(key);

          list.push({
              username: user.username,
              uid: key
          });
      }

      this.list = list;

      });


    autorunAsync(() => { // async list updates
      this.usernames = [];
      this.list.forEach(async (user) => {
        this.usernames.push(await getUsername(user.uid));
      });
    }, 5000);
  }

  @observable list = [];
  @observable usernames = [];

  @computed get listWithFeedback() {
    const feedbackUsers = playing.data.feedback_users;
    return this.list.map(u => {
      let user = {...u};
      if (feedbackUsers) {
        if (feedbackUsers.likes && feedbackUsers.likes.includes(user.uid)) {
          user.liked = true;
        }
        if (feedbackUsers.dislikes && feedbackUsers.dislikes.includes(user.uid)) {
          user.disliked = true;
        }
        if (feedbackUsers.grabs && feedbackUsers.grabs.includes(user.uid)) {
          user.grabbed = true;
        }
      }
      return user;
    });
  }

  @computed get onlineCount() {
    return this.list.length;
  }

  @computed get uids() {
    return this.list.map(u => u.uid);
  }

  @computed get sorted() {
    return this.listWithFeedback.sort((a, b) => {
      return a.rank - b.rank;
    });
  }
}
