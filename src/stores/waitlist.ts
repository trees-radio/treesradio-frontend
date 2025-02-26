import { autorun, computed, observable, action } from "mobx";
import { getDatabaseRef } from "../libs/fbase";
import profile from "./profile";
import toast from "../utils/toast";
import playing from "./playing";
import chat from "./chat";
import { send } from "../libs/events";
import epoch from "../utils/epoch";
import events from "./events";
import favicon from "../assets/img/favicon.png";
import * as localforage from "localforage";

interface WaitlistEnt {
  uid: string;
  songlength: number;
}

export default new (class Waitlist {
  @action setList(list: WaitlistEnt[]) {
    this.list = list;
  }

  @action
  reloadList() {
    getDatabaseRef("waitlist")
      .once("value", (snap) => {
        var list: WaitlistEnt[] = [];
        this.setList([]);
        var wl = snap.val();
        if (wl)
          Object.keys(wl).forEach((key) => {
            list.push(wl[key]);
          });

        this.setList(list);
      });
  }

  @observable accessor list: WaitlistEnt[] = [];

  @computed get onlineOnly() {
    return this.list.filter(function (user) {
      return { uid: user.uid, songlength: user.songlength };
    });
    //return this.list.filter(usr => online.uids.includes(usr));
  }

  join() {
    if (!profile.user) {
      toast("You must be logged in to join the waitlist!", { type: "error" });
      return;
    }
    send("join_waitlist");
  }

  @observable accessor localJoinState = false;
  @observable accessor localPlayingState = false;
  @observable accessor autojoinTimer: Timer | boolean = false;
  @observable accessor showMinutesUntil: boolean = false;
  @observable accessor _autojoinInProgress = false;

  @action
  setLocalPlayingState(state: boolean) {
    this.localPlayingState = state;
  }

  @action
  setLocalJoinState(state: boolean) {
    this.localJoinState = state;
  }

  constructor() {
    // this.reloadList();
    events.register("stop_autoplay", (data) => {
      const eventData = data as { data: { uid: string } };
      if (profile.user && eventData.data.uid === profile.user.uid) {
        this.cancelAutojoin();
      }
    });
    getDatabaseRef("waitlist")
      .on("value", () => {
        this.reloadList();
      });

    autorun(() => {
      this.setLocalJoinState(this.inWaitlist);
      this.setLocalPlayingState(this.isPlaying);
    });

    let checkAutojoin = setInterval(async () => {
      if (profile.loggedIn && await profile.canAutoplay) {
        let autoplay = profile.autoplay;
        if (autoplay) {
          this.setAutojoin();
        }

        clearInterval(checkAutojoin);
      }
    }, 60000);

    localforage.getItem("showminutes").then((value) => {
      this.loadShowMinutesUntil(typeof value === "boolean" ? value : false);
    });
  }

  @action 
  loadShowMinutesUntil(state: boolean) {
    this.showMinutesUntil = state;
  }
  @action
  setShowMinutesUntil() {
    this.showMinutesUntil = !this.showMinutesUntil;
    localforage.setItem("showminutes", this.showMinutesUntil);
  }

  @action
  setAutoplay(state: boolean) {
    console.log("autoplay set to: ", state);
    profile.autoplay = state;
    if (state) {
      this.setAutojoin();
    } else {
      this.cancelAutojoin();
    }
  }

  @action
  setAutojoin() {
    // Use a flag to prevent double execution
    if (this._autojoinInProgress) return;
    this._autojoinInProgress = true;

    console.log("Autojoin started");

    profile.canAutoplay.then((canAutoplay) => {
      if (canAutoplay && !profile.autoplay) {
        this.setAutoplay(true);

        this.setAutoJoinTimer(setInterval(() => {
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
              toast(msg, { type: "error" });
            }
            this.setAutoplay(false);
            this.cancelAutojoin();
          }
        }, 10000));
      } else {
        this.cancelAutojoin();
      }
      this._autojoinInProgress = false;
    }).catch(error => {
      console.error("Error in autojoin:", error);
      this.cancelAutojoin();
      this._autojoinInProgress = false;
    });
  }

  @action
  setAutoJoinTimer(timer: Timer | boolean) {
    this.autojoinTimer = timer;
  }
  @action
  async cancelAutojoin() {
    if (await profile.canAutoplay && this.autojoinTimer != false) {
      this.setAutoplay(false);
      clearInterval(this.autojoinTimer as Timer);
      this.setAutoJoinTimer(false);
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
      toast("You must be logged in to do that!", { type: "error" });
      return;
    }

    if (this.bigButtonLoading) {
      // reset our state if the user clicks again while loading
      this.localJoinState = this.inWaitlist;
      this.localPlayingState = this.isPlaying;
    } else if (this.isPlaying) {
      chat.sendMsg("/skip", () => { });
      this.localPlayingState = false;
    } else if (this.inWaitlist) {
      if (confirm("Are you sure?")) {
        send("leave_waitlist");
        clearInterval(this.autojoinTimer as Timer);
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
    return profile.user ? this.list.some((w) => w.uid === profile.user?.uid) : false;
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
      (item) => item.uid === profile.user?.uid && true
    );
    if (!waitlistpos) return false;
    if (waitlistpos.indexOf(true) >= 0) return waitlistpos.indexOf(true) + 1;
    return false;
  }

  @computed get count() {
    return this.list.length;
  }
})();
