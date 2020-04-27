import { computed, observable, autorun } from "mobx";
import fbase from "libs/fbase";

export default new (class TokeTimer {
  constructor() {
    autorun(() => {
      fbase
        .database()
        .ref("leaderboard")
        .on("value", snap => {
          this.leaders = snap.val();
        });
    });
  }

  @observable leaders = [];
})();
