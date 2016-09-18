import {observable, computed, toJS} from 'mobx';

export default class Chat {
  constructor(fbase) {
    this.fbase = fbase;
    fbase.database().ref('chat').limitToLast(3).on('child_added', (snap) => {
      var msg = snap.val();
      if (msg) {
        if (this.messages[this.messages.length-1] && msg.username === this.messages[this.messages.length-1].username) {
          this.messages[this.messages.length-1].msgs.push(snap.val().msg);
        } else {
          msg.msgs = [msg.msg];
          this.messages.push(msg);
        }
      }
    });
  }

  @observable messages = [];

  sendMsg(msg, cb) {
    // console.log(msg);

    var ref = this.fbase.database().ref('queues').child('chat').child('tasks');

    var data = {
      msg,
      uid: this.fbase.auth().currentUser.uid
    };

    // console.log(data);

    ref.push(data);

    if (cb) {
      cb();
    }
  }
}
