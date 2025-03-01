import { observable, autorun } from "mobx";
import {getDatabaseRef} from "../libs/fbase";

export default new class SongHistory {

  @observable accessor history = [];

  constructor() {
    autorun(() => this.setupSongHistory());
  }

  setupSongHistory() {
    getDatabaseRef("songhistory")
      .on("value", (snap) => {
        let history = snap.val();
        this.history = history;
      });
  }
}
