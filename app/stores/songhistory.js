import { makeAutoObservable,action, autorun } from "mobx";
import fbase from "libs/fbase";

export default new class SongHistory {

  history = [];
  setHistory = action;

  @action setHistory = prop => this.history = prop;

  constructor() {
    makeAutoObservable(this);
    autorun(() => this.setupSongHistory());
  }

  setupSongHistory() {
    fbase
      .database()
      .ref("songhistory")
      .on("value", (snap) => {
        let history = snap.val();
        this.setHistory(history);
      });
  }
}
