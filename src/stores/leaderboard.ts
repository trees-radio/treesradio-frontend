import { observable, autorun } from "mobx";
import {getDatabaseRef} from "../libs/fbase";

export default new class LeadersBoard {

  @observable accessor leaders = [];

  constructor() {
    autorun(() => this.setupLeaderboard());
  }

  setupLeaderboard() {
    getDatabaseRef("leaderboard")
      .on("value", (snap) => {
        let leaders = snap.val();
        this.leaders = leaders;
      });
  }
}
