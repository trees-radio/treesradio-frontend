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
  // Store cleanup references
  private onlineEntsRef: any = null;
  private onlineEntsCallback: (() => void) | null = null;

  constructor() {
    this.loadOnlineEnts();

    // Fix: Store reference and callback for proper cleanup
    this.onlineEntsRef = getDatabaseRef("onlineents");
    this.onlineEntsCallback = () => {
      this.loadOnlineEnts();
    };
    
    this.onlineEntsRef.on("value", this.onlineEntsCallback);
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    if (this.onlineEntsRef && this.onlineEntsCallback) {
      this.onlineEntsRef.off("value", this.onlineEntsCallback);
      this.onlineEntsRef = null;
      this.onlineEntsCallback = null;
    }
  }

  @action
  setOnlineEnts(ents: OnlineEnt[]) {
    this.online = ents;
  }

  @action
  setUserlist(users: string[]) {
    this.userlist = users;
  }

  @action
  async loadOnlineEnts() {
    getDatabaseRef("onlineents")
      .once("value", snap => {
        const thislist = snap.val();
        if (thislist == null) return;
        let list: OnlineEnt[] = [];
        this.setOnlineEnts([]);
        this.setUserlist([]);

        thislist.forEach((item: OnlineEnt) => {
          list.push(item);
        });

        this.setOnlineEnts(list);
        let users: string[] = [];
        Object.keys(thislist).forEach((key) => {
          users.push(thislist[key].username);
        });

        this.setUserlist(users);
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
