import {autorun, observable} from "mobx";
import fbase from "libs/fbase";

export default new (class HelpList {
  constructor() {
    autorun(() => {
      fbase
        .database()
        .ref("help")
        .once("value", snap => {
          //console.log(snap.val());
          this.helpCommands = observable.map(snap.val());
        });
    });
  }
  @observable
  helpCommands;
})();
