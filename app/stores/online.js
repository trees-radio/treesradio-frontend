import {observable, computed} from "mobx";
import fbase from "libs/fbase";
import {ref, onValue, get} from "firebase/database";

export default new (class Online {
  constructor() {
    this.loadOnlineEnts();
    const onlineRef = ref(fbase, "onlineents");
    onValue(onlineRef, () => {
      this.loadOnlineEnts();
    });
  }

  async loadOnlineEnts() {
    const onlineRef = ref(fbase, "onlineents");
    get(onlineRef).then((snapshot) => {
      const thislist = snapshot.val();
      if (thislist == null) return;
      let list = [];
      this.online = [];
      this.userlist = [];
      
      thislist.forEach((item) => {
        list.push(item);
      });

      this.online = list;
      let users = [];
      Object.keys(thislist).forEach((key) => {
        users.push(thislist[key].username);
      });
      
      this.userlist = users;
    });
  }
  @observable online = [];
  @observable userlist = [];
  @observable sorted = [];

  @computed get usernames() {
    let names = [];
    this.userlist = [];
    this.online.forEach((online) => {
      names.push(online.username);
    });
    
    this.userlist = names;
    return names;
  }
  @observable usernames = [];

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
