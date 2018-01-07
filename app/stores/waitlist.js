import { observable, computed, autorun } from "mobx";
import fbase from "libs/fbase";
import profile from "stores/profile";
import toast from "utils/toast";
import playing from "stores/playing";
import chat from "stores/chat";
import { send } from "libs/events";
import online from "stores/online";

export default new class Waitlist {
    constructor() {
        this.reloadList();

        fbase.database().ref("waitlist").on('value',
            snap => {
                this.reloadList();
            });

        autorun(() => {
            this.localJoinState = this.inWaitlist;
            this.localPlayingState = this.isPlaying;
        });
    }

    reloadList() {
        fbase.database().ref("waitlist").once("value", snap => {
            var list = [];
	    this.list = [];
            var wl = snap.val();
            for (var key in wl) {
                list.push(wl[key]);
            }
            this.list = list;
        });
    }

    @observable list = [];

    @computed
    get onlineOnly() {
        return this.list.filter(function(user) {
                return { uid: user.uid };
        });
        //return this.list.filter(usr => online.uids.includes(usr));
    }

    join() {
        if (!profile.user) {
            toast.error("You must be logged in to join the waitlist!");
            return;
        }
        send("join_waitlist");
    }

    @observable localJoinState = false;
    @observable localPlayingState = false;

    @computed
    get bigButtonLoading() {
        if (this.localJoinState !== this.inWaitlist || this.localPlayingState !== this.isPlaying) {
            return true;
        } else {
            return false;
        }
    }

    bigButton() {
        if (!profile.user) {
            toast.error("You must be logged in to push the big button!");
            return;
        }

        if (this.bigButtonLoading) {
            // reset our state if the user clicks again while loading
            this.localJoinState = this.inWaitlist;
            this.localPlayingState = this.isPlaying;
        } else if (this.isPlaying) {
            chat.sendMsg("/skip");
            this.localPlayingState = false;
        } else if (this.inWaitlist) {
            send("leave_waitlist");
            this.localJoinState = false;
        } else {
            send("join_waitlist");
            this.localJoinState = true;
        }
    }

    @computed
    get inWaitlist() {
        if (!profile.user) {
            return false;
        }
        if (this.isPlaying) {
            return true;
        }
        return this.list.some(w => w.uid == profile.user.uid);
    }

    @computed
    get isPlaying() {
        if (playing.data.playing && profile.user && playing.data.info.uid === profile.user.uid) {
            return true;
        }
    }

    @computed
    get waitlistPosition() {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].uid === profile.user.uid) {
                return i + 1;
            }
        }
        return false;
    }

    @computed
    get count() {
        return this.list.length;
    }
}();
