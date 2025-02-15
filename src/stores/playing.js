import { autorun, computed, observable } from "mobx";
import toast from "../utils/toast";
import fbase from "../libs/fbase";
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

const PLAYER_SYNC_CAP = 30; //seconds on end of video to ignore syncing
const PLAYER_SYNC_START = 25; // percent
const PLAYER_SYNC_SENSITIVITY = 5; //percent
export const VOLUME_NUDGE_FRACTION = 0.05; // out of 1


export default new (class Playing {
  constructor() {
    this.fbase = fbase;

    localforage.getItem("volume").then((v) => (v ? (this.volume = v) : false));
    localforage
      .getItem("playerSize")
      .then((s) => (s ? (this.playerSize = s) : false));

    autorun(() => {
      fbase
        .database()
        .ref("playing")
        .on("value", (snap) => {
          var data = snap.val();
          if (data) {
            this.data = data;
            var newtitle = "TreesRadio [  " + data.info.title + " ] ";
            document.title = newtitle;
          }
        });
      this.localLikeState = this.liked;
      this.localDislikeState = this.disliked;
      this.localGrabState = this.grabbed;
    });
  }

  @computed get shouldSync() {
    if (!this.data.time || !this.data.info.duration || !this.data.playing) {
      this.syncs = [];
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

  @observable accessor syncs = [];

  @observable accessor fakeScroll = 0;

  @observable accessor data = {
    info: {},
    feedback: {},
    feedback_users: {
      likes: [],
      dislikes: [],
      grabs: [],
    },
  };

  @computed get humanDuration() {
    var mo = moment.duration(this.data.info.duration, "milliseconds");
    var str = `${padStart(mo.minutes(), 1, "0")}:${padStart(
      mo.seconds(),
      2,
      "0"
    )}`;
    if (mo.hours() > 0) {
      str = `${padStart(mo.hours(), 2, "0")}:` + str;
    }
    return str;
  }

  @computed get humanCurrent() {
    var mo = moment.duration(this.playerSeconds, "seconds");
    var str = `${padStart(mo.minutes(), 1, "0")}:${padStart(
      mo.seconds(),
      2,
      "0"
    )}`;
    if (mo.hours() > 0) {
      str = `${padStart(mo.hours(), 1, "0")}:` + str;
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

  setVolume(v) {
    this.volume = v;
    localforage.setItem("volume", v);
  }

  nudgeVolume(dir) {
    if (dir === "UP") {
      this.setVolume(this.volume + VOLUME_NUDGE_FRACTION);
    } else if (dir === "DOWN") {
      this.setVolume(this.volume - VOLUME_NUDGE_FRACTION);
    }
  }

  @observable accessor localLikeState = false;

  @computed get likeLoading() {
    console.info(
      `${this.localLikeState} Local Like State, ${this.liked} Liked?`
    );
    return this.localLikeState !== this.liked;
  }

  like() {
    // reset our state if the user clicks again while loading
    if (this.likeLoading) {
      this.localLikeState = this.liked;
      return;
    }

    if (this.liked) {
      toast.error("You've already liked this song!");
      return false;
    }
    send("like");
    this.localLikeState = true;
  }

  @observable accessor localDislikeState = false;

  @computed get dislikeLoading() {
    return this.localDislikeState !== this.disliked;
  }

  dislike() {
    // reset our state if the user clicks again while loading
    if (this.dislikeLoading) {
      this.localDislikeState = this.disliked;
      return;
    }

    if (this.disliked) {
      toast.error("You've already disliked this song!");
    }
    send("dislike");
    this.localDislikeState = true;
  }

  @observable accessor localGrabState = false;

  @computed get grabLoading() {
    return this.localGrabState !== this.grabbed;
  }

  grab(playlistKey) {
    playlists.addSong(this.data.info, playlistKey, true);
    playlists.selectPlaylist(playlists.selectedPlaylist);
    if (!this.grabbed) {
      send("grab");
      // this.localGrabState = true;
    }
  }

  userReportsError(e) {
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

  togglePlayerSize() {
    if (this.playerSize === "BIG") {
      this.playerSize = "SMALL";
    } else if (this.playerSize === "SMALL") {
      this.playerSize = "BIG";
    }
    localforage.setItem("playerSize", this.playerSize);
  }

  @observable accessor backgroundImage = spacePineapples;

  updateBackgroundImage(gelato) {
    this.backgroundImage = gelato ? gelatoGif : spacePineapples;
  }
})();
