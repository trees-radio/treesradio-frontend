import {observable, computed, autorunAsync, autorun} from "mobx";
import fbase from "libs/fbase";
import getUsername from "libs/username";
import {getAllRanks, getUserRank} from "libs/rank";
import {getUserLike, getUserDislike, getUserGrab} from "libs/feedback";

export default new class Online {
    constructor() {

        fbase
            .database()
            .ref('playing')
            .child('feedback_users')
            .child('likes')
            .on('child_added', (snap) => {
                console.log("Likes Add:" + JSON.stringify(snap.val()));
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
                console.log("Likes Del:" + JSON.stringify(snap.val()));
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
                console.log("DisLikes Add:" + JSON.stringify(snap.val()));
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
                console.log("DisLikes Del:" + JSON.stringify(snap.val()));
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
                console.log("Grabs Add:" + JSON.stringify(snap.val()));
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
                console.log("Grabs Del:" + JSON.stringify(snap.val()));
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
                console.log("Presence Remove: " + thisuid );
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

                let thisuid = snap.val()['connections'][keys[0]]['uid'];
                if (this.online[thisuid]) 
                    return;
                
                let user = {};
                if (this.online[thisuid]) 
                    return;
                console.log("Presence Add: " + thisuid );
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

            });
    }

    @observable online = {};
    @observable usernames = [];

    @computed
    get onlineCount() {
        return Object
            .keys(this.online)
            .length;
    }

    @computed
    get uids() {
        if (this.sorted) 
            return this.sorted.map(u => u[0]);
        return [];
    }
}();
