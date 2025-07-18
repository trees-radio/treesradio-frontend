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
import {
  RANKS,
  RANKS_WITH_UNLIMITED_AUTOJOIN,
  HOUR_IN_SECONDS,
  FOUR_HOURS_IN_SECONDS,
  AUTOJOIN_CHECK_INTERVAL,
  STAFF_REFRESH_INTERVAL,
  hasRank
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
        // Use our utility function for consistent rank checking
        const isStaff = await hasRank(profile.user.uid, RANKS_WITH_UNLIMITED_AUTOJOIN);
        
        if (isStaff && profile.autoplay) {
          // For staff users with autoplay enabled, refresh lastchat time to prevent timeout
          console.log(`[DEBUG] Refreshing lastchat time for staff user with UID: ${profile.user.uid}`);
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
  setAutoplay(state: boolean, skipRecursion: boolean = false) {
    // Update profile autoplay state (which now persists via localforage)
    profile.autoplay = state;
    console.log(`[DEBUG] Setting autoplay to: ${state}`);
    
    // Update UI to reflect the current state, but avoid recursion
    if (state && !skipRecursion) {
      this.setAutojoin();
    } else if (!state && !skipRecursion) {
      this.cancelAutojoin();
    }
  }

  // Check if a user has time restrictions on autojoin
  // Returns an object with boolean flags for different time limit types
  async checkAutoJoinTimeLimit(uid: string | undefined): Promise<{
    hasTimeLimit: boolean;
    isFreint: boolean;
  }> {
    if (!uid) return { hasTimeLimit: true, isFreint: false }; // Default to having time limit if no uid
    
    // Check if user has no time limit (Admin, Mod, etc.)
    const hasNoTimeLimit = await hasRank(uid, RANKS_WITH_UNLIMITED_AUTOJOIN);
    
    // Check if user is a Frient (special 1-hour time limit)
    const isFreint = !hasNoTimeLimit && await hasRank(uid, [RANKS.FRIENT]);
    
    console.log(`[DEBUG] Time limits: hasNoTimeLimit=${hasNoTimeLimit}, isFreint=${isFreint}`);
    
    return {
      hasTimeLimit: !hasNoTimeLimit, // true if user has any time limits
      isFreint // true only if user is specifically a Frient
    };
  }

  @action
  setAutojoin() {
    try {
      // Use a flag to prevent double execution
      if (this._autojoinInProgress) {
        console.log("[DEBUG] Autojoin already in progress, ignoring request");
        return;
      }
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
          if (!profile.user?.uid) return;

          // Get detailed time limit information
          const timeLimits = await this.checkAutoJoinTimeLimit(profile.user.uid);
          const timeSinceLastChat = epoch() - profile.lastchat;
          
          console.log(`[DEBUG] Auto-join check: hasTimeLimit=${timeLimits.hasTimeLimit}, isFreint=${timeLimits.isFreint}, timeSinceLastChat=${timeSinceLastChat}s`);
          
          // Check if user should join waitlist
          const shouldJoin = !this.isPlaying && // Don't join if already playing
                            !this.inWaitlist && // Don't join if already in waitlist
                            !this.localJoinState && // Don't join if local state says we're joining
                            (
                              !timeLimits.hasTimeLimit || // Either user has no time limits
                              (timeLimits.isFreint && timeSinceLastChat < HOUR_IN_SECONDS) || // Frient with activity in last hour
                              (!timeLimits.isFreint && timeSinceLastChat < FOUR_HOURS_IN_SECONDS) // Other ranks with activity in last 4 hours
                            );
          
          if (shouldJoin) {
            console.log(`[DEBUG] Auto-joining waitlist: User can join`);
            // Only attempt to join, never skip
            send("join_waitlist");
            this.localJoinState = true;
          }
          
          // Additional debug info about last chat time
          console.log(`[DEBUG] Last chat time: ${new Date(profile.lastchat * 1000).toLocaleTimeString()}, ${timeSinceLastChat} seconds ago`);
          
          // Check if we need to remove user from waitlist due to timeout
          const shouldRemove =
            timeLimits.hasTimeLimit && // Only apply to users with time limits
            (
              (timeLimits.isFreint && timeSinceLastChat >= HOUR_IN_SECONDS) || // Frient timeout after 1 hour
              (!timeLimits.isFreint && timeSinceLastChat >= FOUR_HOURS_IN_SECONDS) // Other ranks timeout after 4 hours
            );
            
          if (shouldRemove) {
            console.log(`[DEBUG] Auto-join removed: User has time limits and exceeded time limit`);
            
            // Create appropriate message based on user rank
            const timeLimit = timeLimits.isFreint ? "one hour" : "four hours";
            let msg = `You were removed from the waitlist because it's been ${timeLimit} since your last chat.`;

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
        console.log("[DEBUG] User cannot autoplay, canceling autojoin");
        this.cancelAutojoin();
        toast("Your rank doesn't allow auto-join", { type: "error" });
      }
      this._autojoinInProgress = false;
    }).catch(error => {
      console.error("Error in autojoin:", error);
      toast("There was a problem enabling auto-join", { type: "error" });
      this.cancelAutojoin();
      this._autojoinInProgress = false;
    }).finally(() => {
      // Ensure flag is reset even if there's an uncaught error
      setTimeout(() => {
        if (this._autojoinInProgress) {
          console.log("[DEBUG] Forcibly resetting autojoin flag after timeout");
          this._autojoinInProgress = false;
        }
      }, 5000);
    });
  } catch (error) {
    console.error("Unexpected error in setAutojoin:", error);
    this._autojoinInProgress = false;
    toast("Unexpected error enabling auto-join", { type: "error" });
  }
}

  @action
  setAutoJoinTimer(timer: Timer | boolean) {
    this.autojoinTimer = timer;
  }
  @action
  cancelAutojoin() {
    try {
      console.log(`[DEBUG] Canceling auto-join, current state: timer=${this.autojoinTimer}, autoplay=${profile.autoplay}`);
      
      // First stop the timer regardless of current state
      if (this.autojoinTimer !== false) {
        clearInterval(this.autojoinTimer as Timer);
        this.setAutoJoinTimer(false);
      }
      
      // Then update the profile state with skipRecursion=true to avoid infinite recursion
      this.setAutoplay(false, true);
      
      console.log(`[DEBUG] Auto-join successfully canceled`);
      return true;
    } catch (error) {
      console.error("Error canceling auto-join:", error);
      return false;
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
    try {
      if (!profile.user) {
        return false;
      }
      if (this.isPlaying) {
        return true;
      }
      return profile.user ? this.list.some((w) => w.uid === profile.user?.uid) : false;
    } catch (error) {
      console.error("Error checking waitlist status:", error);
      return false;
    }
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
