import { observable } from "mobx";
import fbase from "libs/fbase";

export default new (class LeadersBoard {
  constructor() {
    console.log(`foo`);
    fbase
      .database()
      .ref("leaderboard")
      .once("value", snap => {

        this.leaders = snap.val();
        console.log(this.leaders);
      });
    fbase
      .database()
      .ref("leaderboard")
      .once("value", snap => {
        this.leaders = snap.val();
        console.log(this.leaders);
      });
  }

  @observable leaders = [];
})();
