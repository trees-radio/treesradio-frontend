import { autorun, computed, observable, action } from "mobx";
import fbase from "../libs/fbase";
import profile from "./profile";
import toast from "../utils/toast";
import playing from "./playing";
import chat from "./chat";
import { send } from "../libs/events";
import epoch from "../utils/epoch";
import events from "./events";
import favicon from "../assets/img/favicon.png";
import * as localforage from "localforage";

export default new (class Waitlist {
  constructor() {
    // this.reloadList();
    events.register("stop_autoplay", (data) => {
      if (data.data.uid === profile.user.uid) {
        this.cancelAutojoin();
      }
    });
    fbase
      .database()
      .ref("waitlist")
      .on("value", () => {
        this.reloadList();
      });

    autorun(() => {
      this.localJoinState = this.inWaitlist;
      this.localPlayingState = this.isPlaying;
    });

    let checkAutojoin = setInterval(() => {
      if (profile.loggedIn && profile.canAutoplay) {
        let autoplay = false;

        if (autoplay) {
          this.setAutojoin();
        }

        clearInterval(checkAutojoin);
      }
    }, 60000);
  }

  @action
  reloadList() {
    fbase
      .database()
      .ref("waitlist")
      .once("value", (snap) => {
        var list = [];
        this.list = [];
        var wl = snap.val();
        if (wl)
          Object.keys(wl).forEach((key) => {
            list.push(wl[key]);
          });

        this.list = list;
      });
  }

  @observable accessor list = [];

  @computed get onlineOnly() {
    return this.list.filter(function (user) {
      return { uid: user.uid, songlength: user.songlength };
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

  @observable accessor localJoinState = false;
  @observable accessor localPlayingState = false;
  @observable accessor autojoinTimer = false;
  @observable accessor showMinutesUntil = localforage.getItem("showminutes") || false;

  @action
  setShowMinutesUntil() {
    this.showMinutesUntil = !this.showMinutesUntil;
    localforage.setItem("showminutes", this.showMinutesUntil);
  }

  @action
  setAutojoin() {
    if (profile.canAutoplay && !profile.autoplay) {
      profile.autoplay = true;

      this.autojoinTimer = setInterval(() => {
        if (
          !this.inWaitlist &&
          !this.localJoinState &&
          epoch() - profile.lastchat < 3600
        ) {
          // Hopefully prevent cycling of the button.
          this.bigButton();
        }
        if (epoch() - profile.lastchat >= 3600) {
          let msg =
            "You were removed from the waitlist because it's been one hour since your last chat.";

          if (profile.desktopNotifications) {
            let options = {
              icon: favicon,
              badge: favicon,
              body: msg,
              silent: true,
            };
            new Notification("TreesRadio", options);
          } else {
            toast.error(msg);
          }
          profile.autoplay = false;
          this.cancelAutojoin();
        }
      }, 10000);
    } else {
      this.cancelAutojoin();
    }
  }

  @action
  cancelAutojoin() {
    if (profile.canAutoplay && this.autojoinTimer != false) {
      profile.autoplay = false;
      clearInterval(this.autojoinTimer);
      this.autojoinTimer = false;
    }
  }

  @computed get bigButtonLoading() {
    return (
      this.localJoinState !== this.inWaitlist ||
      this.localPlayingState !== this.isPlaying
    );
  }

  @action
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
      if (confirm("Are you sure?")) {
        send("leave_waitlist");
        clearInterval(this.autojoinTimer);
        this.autojoinTimer = false;
        this.localJoinState = false;
      }
    } else {
      send("join_waitlist");
      this.localJoinState = true;
    }
  }

  @computed get inWaitlist() {
    if (!profile.user) {
      return false;
    }
    if (this.isPlaying) {
      return true;
    }
    return this.list.some((w) => w.uid == profile.user.uid);
  }

  @computed get isPlaying() {
    if (
      playing.data.playing &&
      profile.user &&
      playing.data.info.uid === profile.user.uid
    ) {
      return true;
    }
    return false;
  }

  @computed get waitlistPosition() {
    let waitlistpos = this.list.map(
      (item) => item.uid === profile.user.uid && true
    );
    if (!waitlistpos) return false;
    if (waitlistpos.indexOf(true) >= 0) return waitlistpos.indexOf(true) + 1;
    return false;
  }

  @computed get count() {
    return this.list.length;
  }
})();
