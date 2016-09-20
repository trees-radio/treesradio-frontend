import {observable, computed} from 'mobx';
import fbase from 'libs/fbase';

export default new class Online {
  constructor() {
    this.fbase = fbase;
    fbase.database().ref('presence').on('value', (snap) => {
      if (snap.val()) {
        this.presence = snap.val();
      }
    });
  }

  @observable presence = null;

  @computed get onlineCount() {
    if (this.presence === null) {
      return 0;
    } else if (this.presence) {
      var users = Object.keys(this.presence);
      return users.reduce((prev, curr, i, arr) => {
        if (this.presence[curr].connections) {
          return prev + 1;
        } else {
          return prev;
        }
      }, 0);
    }
  }

  @computed get onlineUsers() {
    if (this.presence === null) {
      return [];
    } else if (this.presence) {
      var users = Object.keys(this.presence);
      return users.filter(user => {
        if (this.presence[user].connections) {
          return true;
        } else {
          return false;
        }
      }).map(user => ({user, data: this.presence[user]}));
    }
  }
}
