import {autorun, makeAutoObservable, action} from "mobx";
import fbase from "libs/fbase";
import {send} from "libs/events";
import profile from "./profile";
import epoch from "utils/epoch";

const hypetime = 60; // 60 seconds

export default new (class HypeTimer {

  lasthype = epoch();
  hypePercentageCharged = 0;
  setHypePercentageCharged = action;
  secondsfromhype = 0;
  
  constructor() {
    makeAutoObservable(this);
    autorun(() => {
      const hypetimer = this;
      var recheck = setInterval(function() {
        if (profile.uid == false) return;
        clearInterval(recheck);
        fbase
          .database()
          .ref("/hypes")
          .child(profile.uid)
          .once("value")
          .then(snap => {
            var hypesnap = snap.val();
            if (hypesnap != null) {
              hypetimer.setLastHype(hypesnap.lasthype);
              hypetimer.checkTimer();
            } else {
              hypetimer.setLastHype(epoch() - hypetime);
              hypetimer.checkTimer();
            }
          });
        fbase
          .database()
          .ref("/hypes")
          .child(profile.uid)
          .on("value", snap => {
            var hypesnap = snap.val();
            if (hypesnap != null) {
              hypetimer.setLastHype(hypesnap.lasthype);
              hypetimer.checkTimer();
            } else {
              hypetimer.setLastHype(epoch() - hypetime);
              hypetimer.checkTimer();
            }
          });
      }, 10000);
      setInterval(function() {
        hypetimer.checkTimer();
      }, 1000);
    });
  }

  checkTimer() {
    var timeleft = Math.round(((epoch() - this.lasthype) / hypetime) * 100);
    this.secondsfromhype = epoch() - this.lasthype;
    if (timeleft > 100) timeleft = 100;
    this.setHypePercentageCharged(timeleft);
  }

  @action setHypePercentageCharged = (timeleft) => {
    this.hypePercentageCharged = timeleft;
  }

  @action setLastHype = (lasthype) => {
    this.lasthype = lasthype;
  }

  getHyped() {
    return send("chat", {mentions: [], msg: "/hype"});
  }
})();
