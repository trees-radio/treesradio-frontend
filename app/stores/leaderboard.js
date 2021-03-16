import { makeAutoObservable, action, autorun } from "mobx";
import fbase from "libs/fbase";

export default new class LeadersBoard {

  leaders = [];
  setLeaders = action;

  constructor() {
    makeAutoObservable(this);
    autorun(() => this.setupLeaderboard());
  }

  setupLeaderboard() {
    fbase
      .database()
      .ref("leaderboard")
      .on("value", (snap) => {
        let leaders = snap.val();
        this.setLeaders(leaders);
      });
  }

  @action setLeaders = (leaders) => {
    this.leaders = leaders;
  }
}
