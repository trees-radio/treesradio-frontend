import { computed, observable, autorun } from "mobx";
import fbase from "libs/fbase";
import { send } from "libs/events";

export default new (class TokeTimer {
  constructor() {
    autorun(() => {
      fbase
        .database()
        .ref("toke")
        .on("value", snap => {
          var tokestatus = snap.val();
          if (tokestatus != null) {
            this.underway = tokestatus.tokeUnderway;
            this.time = tokestatus.remainingTime;
          }
        });
    });
  }

  @observable underway = false;
  @computed get tokeUnderway() {
    return this.underway;
  }
  @observable time = 0;
  @computed get remainingTime() {
    return this.time;
  }
  joinToke() {
    console.log(`${this.underway} <-- toke underway`);
    if (this.underway) {
      console.log(`sending a /join`);
      send("chat", { mentions: [], msg: "/join" });
    } else {
      console.log(`sending a /toke`);
      send("chat", { mentiones: [], msg: "/toke" });
    }
  }
})();
