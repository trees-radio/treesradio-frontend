import { computed, observable, autorun } from "mobx";
import fbase from "../libs/fbase";
import { send } from "../libs/events";

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

  @observable accessor underway = false;
  @computed get tokeUnderway() {
    return this.underway;
  }
  @observable accessor time = 0;
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
