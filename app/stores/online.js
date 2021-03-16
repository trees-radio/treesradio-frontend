import {makeAutoObservable, computed, action} from "mobx";
import fbase from "libs/fbase";

export default new (class Online {
  online = [];
  userlist = [];
  sorted = [];
  setUserList = action;
  setOnlineEnts = action;

  constructor() {
    makeAutoObservable(this);
    this.loadOnlineEnts();

    fbase
      .database()
      .ref("onlineents")
      .on("value", () => {
        this.loadOnlineEnts();
      });
  }

  async loadOnlineEnts() {
    fbase
      .database()
      .ref("onlineents")
      .once("value", snap => {
        const thislist = snap.val();
        if (thislist == null) return;
        let list = [];
        this.setOnlineEnts([]);
        this.setUserList([]);

        thislist.forEach((item) => {
          list.push(item);
        });

        this.setOnlineEnts(list);
        let users = [];
        Object.keys(thislist).forEach((key) => {
          users.push(thislist[key].username);
        });

        this.setUserList(users);
      });
  }

  @action setUserList = (ents) => {
    this.userlist = ents;
  }

  @action setOnlineEnts = (ents) => {
    this.online = ents;
  }

  @computed get usernames() {
    let names = [];
    this.setUserList([]);
    this.online.forEach((online) => {
      names.push(online.username);
    });
    
    this.setUserList(names);
    return names;
  }

  @computed get onlineCount() {
    return this.online.length;
  }

  @computed get uids() {
    let uids = [];
    this.online.forEach((online) => {
      uids.push(online.uid);
    })
    return uids;
  }
})();
