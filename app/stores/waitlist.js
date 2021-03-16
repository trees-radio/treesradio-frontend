import { autorun, computed, action, makeAutoObservable } from "mobx";
import fbase from "libs/fbase";
import profile from "stores/profile";
import toast from "utils/toast";
import playing from "stores/playing";
import chat from "stores/chat";
import { send } from "libs/events";
import epoch from "../utils/epoch";
import events from "stores/events";
import favicon from "img/favicon.png";
import * as localforage from "localforage";

export default new (class Waitlist {
  list = [];
  setList = action;
  localJoinState = false;
  setLocalJoinState = action;
  localPlayingState = false;
  setLocalPlayingState = action;
  autojoinTimer = false;
  setAutojoinTimer = action;
  showMinutesUntil = localforage.getItem("showminutes") || false;
  setShowMinutesUntil = action;

  @action setList = prop => this.list =prop;
  @action setLocalJoinState = prop => this.localJoinState = prop;
  @action setLocalPlayingState = prop => this.localPlayingState = prop;
  @action setAutojoinTimer = prop => this.autojoinTimer = prop;
  @action setShowMinutesUntil = prop => this.showMinutesUntil = prop;

  constructor() {
    makeAutoObservable(this);
    this.reloadList();
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
      this.setLocalJoinState(this.inWaitlist);
      this.setLocalPlayingState(this.isPlaying);
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

  reloadList() {
    fbase
      .database()
      .ref("waitlist")
      .once("value", (snap) => {
        var list = [];
        this.setList([]);
        var wl = snap.val();
        if (wl)
          Object.keys(wl).forEach((key) => {
            list.push(wl[key]);
          });

        this.setList(list);
      });
  }


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


  setShowMinutesUntil() {
    this.setShowMinutesUntil(!this.showMinutesUntil);
    localforage.setItem("showminutes", this.showMinutesUntil);
  }

  setAutojoin() {
    if (profile.canAutoplay && !profile.autoplay) {
      profile.autoplay = true;

      this.setAutojoinTimer(setInterval(() => {
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
      }, 10000));
    } else {
      this.cancelAutojoin();
    }
  }

  cancelAutojoin() {
    if (profile.canAutoplay && this.autojoinTimer != false) {
      profile.setAutoplay(false);
      clearInterval(this.autojoinTimer);
      this.setAutojoinTimer(false);
    }
  }

  @computed get bigButtonLoading() {
    return (
      this.localJoinState !== this.inWaitlist ||
      this.localPlayingState !== this.isPlaying
    );
  }

  bigButton() {
    if (!profile.user) {
      toast.error("You must be logged in to push the big button!");
      return;
    }

    if (this.bigButtonLoading) {
      // reset our state if the user clicks again while loading
      this.setLocalJoinState(this.inWaitlist);
      this.setLocalPlayingState(this.isPlaying);
    } else if (this.isPlaying) {
      chat.sendMsg("/skip");
      this.setLocalPlayingState(false);
    } else if (this.inWaitlist) {
      if (confirm("Are you sure?")) {
        send("leave_waitlist");
        clearInterval(this.autojoinTimer);
        this.setAutojoinTimer(false);
        this.setLocalJoinState(false);
      }
    } else {
      send("join_waitlist");
      this.setLocalJoinState(true);
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
