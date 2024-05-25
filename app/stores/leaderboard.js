import { observable, autorun } from "mobx";
import fbase from "libs/fbase";
import { ref, onValue } from "firebase/database";

export default new class LeadersBoard {

  @observable leaders = [];

  constructor() {
    autorun(() => this.setupLeaderboard());
  }

  setupLeaderboard() {
    const leaderboardRef = ref(fbase, "leaderboard");
    onValue(leaderboardRef, (snap) => {
      let leaders = snap.val();
      this.leaders = leaders;
    });
  }
}
