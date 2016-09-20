import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';

export default new class Chat {
  constructor() {
    this.fbase = fbase;
    fbase.database().ref('chat').limitToLast(50).on('child_added', (snap) => {
      var msg = snap.val();
      if (msg) {
        if (this.messages[this.messages.length-1] && msg.username === this.messages[this.messages.length-1].username) {
          this.messages[this.messages.length-1].msgs.push(snap.val().msg);
        } else {
          msg.msgs = [msg.msg];
          this.messages.push(msg);
        }
        if (profile.profileInit && msg.mentions && msg.mentions.map(s => s.split('@').join('').toLowerCase()).includes(profile.profile.username.toLowerCase())) {
          toast.info(`You were mentioned by ${msg.username}.`);
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
