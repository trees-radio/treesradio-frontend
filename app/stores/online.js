import {observable, computed, autorun} from "mobx";
import fbase from "libs/fbase";
import getUsername from "libs/username";
import {getUserRank} from "libs/rank";
import {getUserLike, getUserDislike, getUserGrab} from "libs/feedback";

export default new class Online {
    constructor() {

        fbase
            .database()
            .ref('playing')
            .child('feedback_users')
            .child('likes')
            .on('child_added', (snap) => {
   
                let user = this.online[snap.val()];
                if (user) {
                    user.liked = true;
                    this.online[snap.val()] = user;
                }
            });
        fbase
            .database()
            .ref('playing')
            .child('feedback_users')
            .child('likes')
            .on('child_removed', (snap) => {
                let user = this.online[snap.val()];
                if (user) {
                    user.liked = false;
                    this.online[snap.val()] = user;
                }
            });
        fbase
            .database()
            .ref('playing')
            .child('feedback_users')
            .child('dislikes')
            .on('child_added', (snap) => {
   
                let user = this.online[snap.val()];
                if (user) {
                    user.disliked = true;
                    this.online[snap.val()] = user;
                }
            });
        fbase
            .database()
            .ref('playing')
            .child('feedback_users')
            .child('dislikes')
            .on('child_removed', (snap) => {
   
                let user = this.online[snap.val()];
                if (user) {
                    user.disliked = false;
                    this.online[snap.val()] = user;
                }
            });
        fbase
            .database()
            .ref('playing')
            .child('feedback_users')
            .child('grabs')
            .on('child_added', (snap) => {
   
                let user = this.online[snap.val()];
                if (user) {
                    user.grabbed = false;
                    this.online[snap.val()] = user;
                }
            });
        fbase
            .database()
            .ref('playing')
            .child('feedback_users')
            .child('grabs')
            .on('child_removed', (snap) => {
   
                let user = this.online[snap.val()];
                if (user) {
                    user.grabbed = false;
                    this.online[snap.val()] = user;
                }
            });

        fbase
            .database()
            .ref('presence')
            .on('child_removed', (snap) => {
                let keys = Object.keys(snap.val()['connections']);
                let thisuid = snap.val()['connections'][keys[0]]['uid'];
   
                if (this.online[thisuid]) {
                    for (var i = this.usernames.length - 1; i >= 0; i--) {
                        if (this.usernames[i] === this.online[thisuid]['username']) {
                            
                            this
                                .usernames
                                .splice(i, 1);
                        }
                    }
   
                    delete this.online[thisuid];
                }
            });
        fbase
            .database()
            .ref('presence')
            .on('child_added', (snap) => {
                let keys = Object.keys(snap.val()['connections']);
                
                for ( let i = 0; i < keys.length; i++ ) {
                    let thisuid = snap.val()['connections'][keys[i]]['uid'];
                    
                    let user = {};
                
                    user.liked = getUserLike(thisuid).then(val => val);
                    user.disliked = getUserDislike(thisuid).then(val => val);
                    user.grabbed = getUserGrab(thisuid).then(val => val);
                    user.rank = getUserRank(thisuid).then(val => val);
                    user.username = getUsername(thisuid).then(val => val);
                    this
                        .usernames
                        .push(user.username);
                    user.uid = thisuid;
                    this.online[thisuid] = user;
                
                }
            });
        autorun( () => {
            setInterval(
                () => {

                    //Autocomplete userlist.
                    this.userlist = [];
                    this.sorted = [];
                    let sorts = [];
                    let ranks = ['Admin', 'Dev', 'Senior Mod', 'Mod', 'VIP', 'User'];
                    let me = this;
                    let uids = Object.keys(this.online);
                    for ( let i = 0; i < uids.length; i++ ) {
                        getUsername(uids[i]).then( un => {
                           me.userlist.push(un);
                           getUserRank(uids[i]).then( rank => {
                           me.sorted.push({ uid: uids[i], username: un, rank: rank });
                               
                           })
                        });

                    }

                }, 5000 );
        });
    }

    @observable online = {};
    @observable userlist = [];
    @observable sorted = [];

    @computed
    get usernames() {
        let uids = this.uids;
        let usernames = [];
        for ( let i = 0; i < uids.length; i++ ) {
            usernames.push(getUsername(uids[i]));
        }
        return usernames;
    }
    @observable usernames = [];

    @computed
    get onlineCount() {
        return Object
            .keys(this.online)
            .length;
    }

    @computed
    get uids() {
        let uids = Object.keys(this.online);
        return uids;
    }
}();
