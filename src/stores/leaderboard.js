import { observable, autorun } from "mobx";
import fbase from "../libs/fbase";

export default new class LeadersBoard {

  @observable accessor leaders = [];

  constructor() {
    autorun(() => this.setupLeaderboard());
  }

  setupLeaderboard() {
    fbase
      .database()
      .ref("leaderboard")
      .on("value", (snap) => {
        let leaders = snap.val();
        this.leaders = leaders;
      });
  }
}
