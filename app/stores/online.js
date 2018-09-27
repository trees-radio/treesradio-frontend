import {observable, computed, autorun} from "mobx";
import fbase from "libs/fbase";
import getUsername from "libs/username";

export default new class Online {
  constructor() {
    this.loadOnlineEnts();

    fbase
      .database()
      .ref("onlineents")
      .on("value", snap => {
        this.loadOnlineEnts();
      });
  }

  loadOnlineEnts() {
    fbase
      .database()
      .ref("onlineents")
      .once("value", snap => {
        const thislist = snap.val();
        let list = [];
        this.online = [];
        this.userlist = [];
        for (var i = 0; i < thislist.length; i++) {
          list.push(thislist[i]);
        }
        this.online = list;
        let users = [];
        for (let key in thislist) {
          users.push(thislist[key].username);
        }
        this.userlist = users;
      });
  }
  @observable online = [];
  @observable userlist = [];
  @observable sorted = [];

  @computed get usernames() {
    let names = [];
    this.userlist = [];
    for (let i = 0; i < this.online.length; i++) {
      names.push(this.online[i].username);
    }
    this.userlist = names;
    return names;
  }
  @observable usernames = [];

  @computed get onlineCount() {
    return this.online.length;
  }

  @computed get uids() {
    let uids = [];
    for (let i = 0; i < this.online.length; i++) {
      uids.push(this.online[i].uid);
    }
    return uids;
  }
}();
