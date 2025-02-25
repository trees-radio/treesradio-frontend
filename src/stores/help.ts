import {autorun, observable} from "mobx";
import {getDatabaseRef} from "../libs/fbase";

export default new (class HelpList {
  constructor() {
    autorun(() => {
      getDatabaseRef("help")
        .once("value", snap => {
          this.helpCommands = observable.map(snap.val());
        });
    });
  }
  @observable accessor   helpCommands: any;
})();
