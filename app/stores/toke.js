import { computed, makeAutoObservable, action, autorun } from "mobx";
import fbase from "libs/fbase";
import { send } from "libs/events";

export default new (class TokeTimer {
  underway = false;
  time = 0;
  setTime = action;
  setUnderway = action;

  @action setTime = prop => this.time = prop;
  @action setUnderway = prop => this.underway = prop;

  constructor() {
    makeAutoObservable(this);
    autorun(() => {
      fbase
        .database()
        .ref("toke")
        .on("value", snap => {
          var tokestatus = snap.val();
          if (tokestatus != null) {
            this.setUnderway(tokestatus.tokeUnderway);
            this.setTime(tokestatus.remainingTime);
          }
        });
    });
  }

  @computed get tokeUnderway() {
    return this.underway;
  }
  @computed get remainingTime() {
    return this.time;
  }
  joinToke() {
    if (this.underway) {
      send("chat", { mentions: [], msg: "/join" });
    } else {
      send("chat", { mentiones: [], msg: "/toke" });
    }
  }
})();
