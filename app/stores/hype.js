import { autorun, observable } from "mobx";
import fbase from "libs/fbase";
import { send } from "libs/events";
import profile from "./profile";
import epoch from "utils/epoch";

export const hypetime = 60; // It was 260 = 4:20 before, people found that too long

export default new (class HypeTimer {
  constructor() {
    autorun(() => {
      const hypetimer = this;
      var recheck = setInterval(function () {
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
              hypetimer.lasthype = hypesnap.lasthype;
              hypetimer.checkTimer();
            } else {
              hypetimer.lasthype = epoch() - hypetime;
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
              hypetimer.lasthype = hypesnap.lasthype;
              hypetimer.checkTimer();
            } else {
              hypetimer.lasthype = epoch() - hypetime;
              hypetimer.checkTimer();
            }
          });
      }, 10000);
      setInterval(function () {
        hypetimer.checkTimer();
      }, 1000);
    });
  }

  @observable lasthype = epoch();
  @observable hypePercentageCharged = 0;
  @observable secondsfromhype = 0;
  checkTimer() {
    var timeleft = Math.round(((epoch() - this.lasthype) / hypetime) * 100);
    this.secondsfromhype = epoch() - this.lasthype;
    if (timeleft > 100) timeleft = 100;
    this.hypePercentageCharged = timeleft;
  }

  getHyped() {
    return send("chat", { mentions: [], msg: "/hype" });
  }
})();
