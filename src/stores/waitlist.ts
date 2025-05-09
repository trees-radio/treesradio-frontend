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
import rank from "../libs/rank";
import * as localforage from "localforage";
import {
  RANKS,
  RANKS_WITH_UNLIMITED_AUTOJOIN,
  HOUR_IN_SECONDS,
  AUTOJOIN_CHECK_INTERVAL,
  STAFF_REFRESH_INTERVAL
} from "../libs/constants";

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
  @observable accessor showMinutesUntil: boolean = true;
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

    // Set up a timer to periodically refresh lastchat for admin/staff users
    // This ensures they don't get removed from the waitlist due to inactivity
    setInterval(async () => {
      if (profile.user?.uid) {
        const userRank = await rank(profile.user.uid);
        // Use our constants for consistent rank checking
        const isStaff = RANKS_WITH_UNLIMITED_AUTOJOIN.includes(userRank);
        
        if (isStaff && profile.autoplay) {
          // For staff users with autoplay enabled, refresh lastchat time to prevent timeout
          console.log(`[DEBUG] Refreshing lastchat time for ${userRank} user`);
          profile.lastchat = epoch();
        }
      }
    }, STAFF_REFRESH_INTERVAL); // Check every 30 minutes
    getDatabaseRef("waitlist")
      .on("value", () => {
        this.reloadList();
      });

    autorun(() => {
      this.setLocalJoinState(this.inWaitlist);
      this.setLocalPlayingState(this.isPlaying);
    });

    // Initialize autojoin immediately if user is logged in
    const initAutojoin = async () => {
      if (profile.loggedIn && await profile.canAutoplay) {
        if (profile.autoplay) {
          this.setAutojoin();
        }
        return true;
      }
      return false;
    };

    // Try to initialize autojoin immediately, and if it fails, check again periodically
    initAutojoin().then(initialized => {
      if (!initialized) {
        // User wasn't logged in or couldn't autoplay yet, check again periodically
        let checkAutojoin = setInterval(async () => {
          if (await initAutojoin()) {
            clearInterval(checkAutojoin);
          }
        }, 5000); // Check every 5 seconds instead of every minute
      }
    });

    // Load UI preferences
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
    // Update profile autoplay state (which now persists via localforage)
    profile.autoplay = state;
    
    // Update UI to reflect the current state
    if (state) {
      this.setAutojoin();
    } else {
      this.cancelAutojoin();
    }
  }

  // Check if a user has time restrictions on autojoin
  async hasAutoJoinTimeLimit(uid: string | undefined): Promise<boolean> {
    if (!uid) return true; // Default to having time limit if no uid
    
    const userRank = await rank(uid);
    console.log(`[DEBUG] User rank for ${uid}: "${userRank}"`);
    
    // Handle null or undefined ranks as "User"
    if (!userRank) return true;
    
    // Use our centralized constants for ranks without time limits
    
    // Check if user's rank is in the list of ranks without time limits
    const hasNoTimeLimit = RANKS_WITH_UNLIMITED_AUTOJOIN.includes(userRank);
    console.log(`[DEBUG] User has no time limit: ${hasNoTimeLimit}`);
    
    // Inverse logic: return true if user HAS time limits (User or Frient)
    return !hasNoTimeLimit;
  }

  @action
  setAutojoin() {
    // Use a flag to prevent double execution
    if (this._autojoinInProgress) return;
    this._autojoinInProgress = true;

    profile.canAutoplay.then((canAutoplay) => {
      console.log(`[DEBUG] setAutojoin: canAutoplay=${canAutoplay}, profileAutoplay=${profile.autoplay}`);
      
      // If user can autoplay, enable it regardless of current autoplay state
      if (canAutoplay) {
        // Don't set autoplay again if it's already true to avoid recursive calls
        if (!profile.autoplay) {
          this.setAutoplay(true);
        }

        this.setAutoJoinTimer(setInterval(async () => {
          const userHasTimeLimit = await this.hasAutoJoinTimeLimit(profile.user?.uid);
          const timeSinceLastChat = epoch() - profile.lastchat;
          
          console.log(`[DEBUG] Auto-join check: hasTimeLimit=${userHasTimeLimit}, timeSinceLastChat=${timeSinceLastChat}s`);
          
          // Check if user should join waitlist
          if (
            !this.isPlaying && // Add check to prevent autojoin during playback
            !this.inWaitlist &&
            !this.localJoinState &&
            (!userHasTimeLimit || timeSinceLastChat < HOUR_IN_SECONDS) // Either user has no time limit OR has been active recently
          ) {
            console.log(`[DEBUG] Auto-joining waitlist: User can join`);
            // Only attempt to join, never skip
            send("join_waitlist");
            this.localJoinState = true;
          }
          
          // Additional debug info about last chat time
          console.log(`[DEBUG] Last chat time: ${new Date(profile.lastchat * 1000).toLocaleTimeString()}, ${timeSinceLastChat} seconds ago`);
          
          // Only check for time limits if the user actually has time restrictions
          // Also double-check that we're not mistakenly applying time limits to higher ranks
          if (userHasTimeLimit && timeSinceLastChat >= HOUR_IN_SECONDS && profile.user?.uid &&
              !RANKS_WITH_UNLIMITED_AUTOJOIN.includes(await rank(profile.user.uid))) {
            console.log(`[DEBUG] Auto-join removed: User has time limits and exceeded 1 hour`);
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
        }, AUTOJOIN_CHECK_INTERVAL));
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
  skipSong() {
    if (!profile.user) {
      toast("You must be logged in to do that!", { type: "error" });
      return;
    }
    if (this.isPlaying) {
      chat.sendMsg("/skip", () => { });
      this.localPlayingState = false;
    }
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
      this.skipSong();
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

  @computed get isPlayingAllowSelfUpvote() {
    if (
      playing.data.playing
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
