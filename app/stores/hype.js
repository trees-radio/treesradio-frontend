import { autorun, observable } from "mobx";
import fbase from "libs/fbase";
import { send } from "libs/events";
import profile from "./profile";
import epoch from "utils/epoch";
import { ref, get, onValue } from "firebase/database";

export const hypetime = 60; // It was 260 = 4:20 before, people found that too long

export default new (class HypeTimer {
  constructor() {
    autorun(() => {
      const hypetimer = this;
      var recheck = setInterval(function () {
        if (profile.uid == false) return;
        clearInterval(recheck);
        const hypesRef = ref(fbase, "hypes");
        get(hypesRef).then((snapshot) => {
          var hypes = snapshot.val();
          if (hypes == null) return;
          if (hypes[profile.uid] == null) return;
          hypetimer.lasthype = hypes[profile.uid].lasthype;
          hypetimer.checkTimer();
        });
        onValue(hypesRef, (snap) => {
          var hypes = snap.val();
          if (hypes == null) return;
          if (hypes[profile.uid] == null) return;
          hypetimer.lasthype = hypes[profile.uid].lasthype;
          hypetimer.checkTimer();
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
