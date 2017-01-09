import {observable, computed, autorun} from 'mobx';
import fbase from 'libs/fbase';
import getUsername from 'libs/username';

export default new class Online {
  constructor() {
    this.fbase = fbase;
    fbase.database().ref('presence').on('value', (snap) => {
      var list = [];
      snap.forEach(user => {
        let {connections} = user.val();
        const uid = user.key;
        let keys = Object.keys(connections || {});
        if (keys.length > 0) {
          let newest = connections[keys.slice(-1)];
          list.push({
            username: newest.username,
            uid
          });
        }
      });
      this.list = list;

    });

    autorun(() => {
      this.list.forEach(async (user) => {
        this.usernames.push(await getUsername(user.uid));
      });
    });
  }

  @observable list = [];
  @observable usernames = [];

  @computed get onlineCount() {
    return this.list.length;
  }

  @computed get sorted() {
    return this.list.sort((a, b) => {
      return a.rank - b.rank;
    });
  }
}
