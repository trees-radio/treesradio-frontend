import { autorun, computed, observable, action } from "mobx";
import toast from "../utils/toast";
import {getDatabaseRef} from "../libs/fbase";
import profile from "./profile";
import epoch from "../utils/epoch";
// import ax from '../utils/ax';
import moment from "moment";
import { padStart } from "lodash";
// import events from 'stores/events';
import playlists from "./playlists";
import { send } from "../libs/events";
import localforage from "localforage";

import spacePineapples from "../assets/img/spacepineapples.jpg";
import gelatoGif from "../assets/img/gelatogif.gif";

const PLAYER_SYNC_CAP = 3; //seconds on end of video to ignore syncing
const PLAYER_SYNC_START = 2; // percent
const PLAYER_SYNC_SENSITIVITY = 10; //percent
export const VOLUME_NUDGE_FRACTION = 0.05; // out of 1


export default new (class Playing {
  // Store cleanup references
  private playingRef: any = null;
  private playingCallback: ((snap: any) => void) | null = null;
  private autorunDisposer: (() => void) | null = null;

  constructor() {
    localforage.getItem<number>("volume").then((v) => (v ? (this.setVolume(v)) : false));
    localforage
      .getItem<string>("playerSize")
      .then((s) => (s ? (this.setPlayerSize(s)) : false));

    // Fix: Store the autorun disposer and properly manage Firebase listener
    this.autorunDisposer = autorun(() => {
      // Clean up previous listener if it exists
      if (this.playingRef && this.playingCallback) {
        this.playingRef.off("value", this.playingCallback);
      }
      
      const me = this;
      this.playingRef = getDatabaseRef("playing");
      this.playingCallback = (snap: any) => {
        var data = snap.val();
        if (data) {
          me.updatePlayer(data);
        }
      };
      
      this.playingRef.on("value", this.playingCallback);
      
      this.setLocalLikeState(this.liked);
      this.setLocalDislikeState(this.disliked);
      this.setLocalGrabState(this.grabbed);
    });
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    if (this.playingRef && this.playingCallback) {
      this.playingRef.off("value", this.playingCallback);
      this.playingRef = null;
      this.playingCallback = null;
    }
    if (this.autorunDisposer) {
      this.autorunDisposer();
      this.autorunDisposer = null;
    }
  }

  @action setPlayerSize(s: string) {
    this.playerSize = s;
    localforage.setItem("playerSize", s);
  }

  @action setLocalLikeState(v: boolean) {
    this.localLikeState = v;
  }

  @action setLocalDislikeState(v: boolean) {
    this.localDislikeState = v;
  }

  @action setLocalGrabState(v: boolean) {
    this.localGrabState = v;
  }

  @action
  updatePlayer(data: Playing["data"]) {
    this.data = data;
    document.title = `${data.info.title} - ${data.info.user} | TreesRadio`;
  }

  @action
  setSyncs(syncs: number[]) {
    this.syncs = syncs;
  }

  @computed get shouldSync() {
    if (!this.data.time || !this.data.info.duration || !this.data.playing) {
      this.setSyncs([]);
      return false;
    }
    var serverSeconds = this.data.time;
    var durationSeconds = this.data.info.duration / 1000;
    var cap = durationSeconds - PLAYER_SYNC_CAP;
    const durationPercent = Math.round((serverSeconds / durationSeconds) * 100);

    if (serverSeconds > cap || durationPercent < PLAYER_SYNC_START) {
      return false;
    }

    var pctdistance = Math.floor(
      Math.abs(
        this.playerProgress * 100 - durationPercent
      )
    );

    if (pctdistance > PLAYER_SYNC_SENSITIVITY) {
      return serverSeconds;
    }
    return false;
  }

  @observable accessor currentUrl = "";

  @observable accessor syncs: number[] = [];

  @observable accessor fakeScroll = 0;

  @observable accessor timeStarted = 0;

  @observable accessor data = {
    info: {
      title: "",
      user: "",
      duration: 0,
      url: "",
      uid: "",
      thumb: "",
      channel: "",
    },
    feedback: {
      likes: 0,
      dislikes: 0,
      grabs: 0,
    },
    feedback_users: {
      likes: [] as string[],
      dislikes: [] as string[],
      grabs: [] as string[],
    },
    time: 0,
    playing: false,
  };

  @computed get humanDuration() {
    var mo = moment.duration(this.data.info.duration, "milliseconds");
    var str = `${padStart(mo.minutes().toString(), 1, "0")}:${padStart(
      mo.seconds().toString(),
      2,
      "0"
    )}`;
    if (mo.hours() > 0) {
      str = `${padStart(mo.hours().toString(), 2, "0")}:` + str;
    }
    return str;
  }

  @computed get humanCurrent() {
    var mo = moment.duration(this.playerSeconds, "seconds");
    var str = `${padStart(mo.minutes().toString(), 1, "0")}:${padStart(
      mo.seconds().toString(),
      2,
      "0"
    )}`;
    if (mo.hours() > 0) {
      str = `${padStart(mo.hours().toString(), 1, "0")}:` + str;
    }
    return str;
  }

  @computed get time() {
    //SECONDS
    if (!this.data.time || !this.data.info.duration || !this.data.playing) {
      return 0;
    } else {
      return this.data.time;
    }
  }

  @computed get elapsed() {
    return this.time;
  }

  @computed get fraction() {
    if (!this.data.time || !this.data.info.duration) {
      return 0;
    }
    return this.data.time / Math.round(this.data.info.duration / 1000);
  }

  @observable accessor playerProgress = 0; // fraction (0.12, 0.57, etc.)

  @observable accessor playerDuration = 0; // seconds

  @computed get playerSeconds() {
    return this.playerDuration * this.playerProgress;
  }

  @action
  setPlayerDuration(d: number) {
    this.playerDuration = d;
  }

  @computed get liked() {
    if (
      !this.data.feedback_users ||
      !this.data.feedback_users.likes ||
      !profile.user
    ) {
      return false;
    }
    if (this.data.feedback_users.likes.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @observable accessor volume = 0.15;

  @action
  setVolume(v: number) {
    this.volume = v;
    localforage.setItem("volume", v);
  }

  nudgeVolume(dir: string) {
    if (dir === "UP") {
      this.setVolume(this.volume + VOLUME_NUDGE_FRACTION);
    } else if (dir === "DOWN") {
      this.setVolume(this.volume - VOLUME_NUDGE_FRACTION);
    }
  }

  @observable accessor localLikeState = false;

  @computed get likeLoading() {
    return this.localLikeState !== this.liked;
  }

  like() {
    // reset our state if the user clicks again while loading
    if (this.likeLoading) {
      this.setLocalLikeState(this.liked);
      return;
    }

    if (this.liked) {
      toast("You've already liked this song!", {type:"error"});
      return false;
    }
    
    send("like");
    this.setLocalLikeState(true);
  }

  @observable accessor localDislikeState = false;

  @computed get dislikeLoading() {
    return this.localDislikeState !== this.disliked;
  }

  dislike() {
    // reset our state if the user clicks again while loading
    if (this.dislikeLoading) {
      this.setLocalDislikeState(this.disliked);
      return;
    }

    if (this.disliked) {
      toast("You already disliked this song!", {type:"error"});
    }
    send("dislike");
    this.setLocalDislikeState(true);
  }

  @observable accessor localGrabState = false;

  @computed get grabLoading() {
    return this.localGrabState !== this.grabbed;
  }

  grab(playlistKey: string) {
    playlists.addSong(this.data.info, playlistKey, true);
    playlists.selectPlaylist(playlists.selectedPlaylist);
    if (!this.grabbed) {
      send("grab");
      this.setLocalGrabState(true);
    }
  }

  userReportsError(e: number) {
    if (epoch() - profile.lastchat < 600 && (e == 150 || e == 100))
      send("playerError", { e });
  }

  @computed get disliked() {
    if (
      !this.data.feedback_users ||
      !this.data.feedback_users.dislikes ||
      !profile.user
    ) {
      return false;
    }
    if (this.data.feedback_users.dislikes.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @computed get grabbed() {
    if (
      !this.data.feedback_users ||
      !this.data.feedback_users.grabs ||
      !profile.user
    ) {
      return false;
    }
    if (this.data.feedback_users.grabs.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @computed get likes() {
    if (!this.data.feedback || !this.data.feedback.likes) {
      return 0;
    }
    return this.data.feedback.likes;
  }

  @computed get dislikes() {
    if (!this.data.feedback || !this.data.feedback.dislikes) {
      return 0;
    }
    return this.data.feedback.dislikes;
  }

  @computed get grabs() {
    if (!this.data.feedback || !this.data.feedback.grabs) {
      return 0;
    }
    return this.data.feedback.grabs;
  }

  @observable accessor playerSize = "BIG";

  @action
  togglePlayerSize() {
    if (this.playerSize === "BIG") {
      this.playerSize = "SMALL";
    } else if (this.playerSize === "SMALL") {
      this.playerSize = "BIG";
    }
    localforage.setItem("playerSize", this.playerSize);
  }

  @observable accessor backgroundImage = spacePineapples;

  @action
  updateBackgroundImage(gelato: boolean) {
    this.backgroundImage = gelato ? gelatoGif : spacePineapples;
  }
  @action
  setPlayerProgress(p: number) {
    this.playerProgress = p;
  }
})();
