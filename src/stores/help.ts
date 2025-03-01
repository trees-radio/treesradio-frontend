import {autorun, observable, action} from "mobx";
import {getDatabaseRef} from "../libs/fbase";

export default new (class HelpList {
  constructor() {
    autorun(() => {
      getDatabaseRef("help")
        .once("value", snap => {
          this.setHelpCommands(observable.map(snap.val()));
        });
    });
  }
  @observable accessor   helpCommands: any;

  @action
  setHelpCommands(commands: any) {
    this.helpCommands = commands;
  }
})();
