import {observable, computed, autorunAsync} from "mobx";
import fbase from "libs/fbase";
import getUsername from "libs/username";
import playing from "stores/playing";
import {getRank, getAllRanks} from "libs/rank";

export default new class Online {
  constructor() {
    this.fbase = fbase;

    fbase.database().ref("presence").on("value", snap => {
      let list = [];
      const user = snap.val();

      for (let uid in user) {
        list.push({uid});
      }

      this.list = list;
    });

    autorunAsync(() => {
      // async list updates
      this.usernames = [];
      this.list.forEach(async user => {
        this.usernames.push(await getUsername(user.uid));
      });
    }, 5000);
  }

  @observable list = [];
  @observable usernames = [];

  @computed
  get listWithFeedback() {
    // let feedbackUsers =
    //   fbase
    //     .database()
    //     .ref('playing')
    //     .child('feedback_users')
    //     .on('value', (snap) => { snap.val(); } );
    
    // //console.log(playing.data.feedback_users);
    let userlist = [];
    // console.log(feedbackUsers);
    getAllRanks(allRanks => {
      return this.list.forEach(u => {
        let user = {...u};
        user.liked = playing.theselikes.includes(user.uid);
        user.disliked = playing.thesedislikes.includes(user.uid);
        user.grabbed = playing.thesegrabs.includes(user.uid);
        user.rank = allRanks[user.uid] || "User";
        userlist.push(user);
      });
    });
    console.log(userlist);
    return userlist;
  }

  @computed
  get onlineCount() {
    return this.list.length;
  }

  @computed
  get uids() {
    return this.list.map(u => u.uid);
  }
}();
