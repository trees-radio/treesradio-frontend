import {autorun, observable} from "mobx";
import fbase from "libs/fbase";
import {ref, get} from "firebase/database";

export default new (class HelpList {
  constructor() {
    autorun(() => {
      const helpRef = ref(fbase, "help")
      get(helpRef).then((snapshot) => {
        this.helpCommands = observable.map(snapshot.val());
      })
    });
  }
  @observable
  helpCommands;
})();
