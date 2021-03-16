import { observable, autorun } from "mobx";
import fbase from "libs/fbase";

export default new class SongHistory {

  @observable history = [];

  constructor() {
    autorun(() => this.setupSongHistory());
  }

  setupSongHistory() {
    fbase
      .database()
      .ref("songhistory")
      .on("value", (snap) => {
        let history = snap.val();
        this.history = history;
      });
  }
}
