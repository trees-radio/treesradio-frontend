import {observable, computed, action} from "mobx";
import {getDatabaseRef} from "../libs/fbase";

export interface OnlineEnt {
  uid: string;
  username: string;
  memberSince: string;
  feedback: {
    likes: boolean;
    dislikes: boolean;
    grabs: boolean;
  }
}

export default new (class Online {
  constructor() {
    this.loadOnlineEnts();

    getDatabaseRef("onlineents")
      .on("value", () => {
        this.loadOnlineEnts();
      });
  }

  @action
  setOnlineEnts(ents: OnlineEnt[]) {
    this.online = ents;
  }

  @action
  async loadOnlineEnts() {
    getDatabaseRef("onlineents")
      .once("value", snap => {
        const thislist = snap.val();
        if (thislist == null) return;
        let list: OnlineEnt[] = [];
        this.online = [];
        this.userlist = [];

        thislist.forEach((item: OnlineEnt) => {
          list.push(item);
        });

        this.setOnlineEnts(list);
        let users: string[] = [];
        Object.keys(thislist).forEach((key) => {
          users.push(thislist[key].username);
        });

        this.userlist = users;
      });
  }
  
  @observable accessor online: OnlineEnt[] = [];
  @observable accessor userlist: string[] = [];
  @observable accessor sorted = [];

  @computed get usernames() {
    let names: string[] = [];
    this.userlist = [];
    this.online.forEach((online) => {
      names.push(online.username);
    });
    
    this.userlist = names;
    return names;
  }
  // @observable usernames = [];

  @computed get onlineCount() {
    return this.online.length;
  }

  @computed get uids() {
    let uids: string[] = [];
    this.online.forEach((online) => {
      uids.push(online.uid);
    })
    return uids;
  }
})();
