import { observable, autorun } from "mobx";
import fbase from "libs/fbase";
import { ref, onValue } from "firebase/database";

export default new class SongHistory {

  @observable history = [];

  constructor() {
    autorun(() => this.setupSongHistory());
  }

  setupSongHistory() {
    const historyRef = ref(fbase, "songhistory");
    onValue(historyRef, (snap) => {
      let history = snap.val();
      this.history = history;
    });
  }
}
