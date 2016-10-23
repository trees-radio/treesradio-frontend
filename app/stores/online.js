import {observable, computed} from 'mobx';
import fbase from 'libs/fbase';

export default new class Online {
  constructor() {
    this.fbase = fbase;
    fbase.database().ref('presence').orderByKey().on('value', (snap) => {
      var list = [];
      snap.forEach(user => {
        var data = user.val();
        list.push(data);
      });
      this.list = list;
    });
  }

  @observable list = [];

  @computed get onlineCount() {
    return this.list.length;
  }

  @computed get sorted() {
    return this.list.sort((a, b) => {
      return a.rank - b.rank;
    });
  }

  @computed get usernames() {
    return this.list.map(u => u.username);
  }
}
