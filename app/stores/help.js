import {autorun, makeAutoObservable, action, observable} from "mobx";
import fbase from "libs/fbase";

export default new (class HelpList {
  helpCommands;
  setHelpCommand = action;
  constructor() {
    makeAutoObservable(this);
    autorun(() => {
      fbase
        .database()
        .ref("help")
        .once("value", snap => {
          this.setHelpCommands( snap.val() );
        });
    });
  }

  @action setHelpCommands = (commands) => {
    this.helpCommands = observable.map(commands);
  }
})();
