import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';
import ax from 'utils/ax';
import socket from 'utils/socket';
import events from 'stores/events';
import online from 'stores/online';
import mention from 'libs/mention';

const mentionPattern = /\B@[a-z0-9_-]+/gi;

export default new class Chat {
  constructor() {
    this.fbase = fbase;
    fbase.database().ref('chat').limitToLast(50).on('child_added', (snap) => {
      var msg = snap.val();
      if (msg) {
        if (this.messages[this.messages.length-1] && msg.username === this.messages[this.messages.length-1].username) {
          this.messages[this.messages.length-1].msgs.push(msg.msg);
          this.messages[this.messages.length-1].timestamp = msg.timestamp;
        } else {
          msg.msgs = [msg.msg];
          this.messages.push(msg);
        }

        if (profile.profileInit && msg.mentions) { //mention check
          const mentions = msg.mentions.map(s => s.split('@').join('').toLowerCase());
          const everyone = msg.bot && mentions.includes('everyone');
          let mentioned = everyone;
          if (!mentioned) {
            mentioned = mentions.includes(profile.profile.username.toLowerCase());
          }
          if (mentioned) {
            mention(everyone, msg.username);
          }
        }
      }
    });
    events.register('chat_clear', () => this.messages = []);
  }

  @observable messages = [];

  @observable msg = '';

  updateMsg(msg) {
    this.msg = msg;
  }

  appendMsg(msg) {
    this.msg += ' '+msg;
  }

  getMsg() {
    var msg = this.msg;
    this.msg = '';
    return msg;
  }

  pushMsg() {
    this.sendMsg(this.getMsg());
  }

  sendMsg(msg, cb) {
    var mentions = msg.match(mentionPattern) || [];

    socket.emit('chat', {mentions, msg});

    // ax.post('/chat/send', {
    //   msg,
    //   mentions
    // }).then(resp => {
    //   if (resp.data.error) {
    //     toast.error(`Error occurred while chatting: ${resp.data.error}`);
    //   }
    // });

    // var ref = this.fbase.database().ref('queues').child('chat').child('tasks');
    //
    // var data = {
    //   msg,
    //   uid: this.fbase.auth().currentUser.uid
    // };
    //
    // ref.push(data);

    if (cb) {
      cb();
    }
  }

  @computed get mentionMatches() {
    var words = this.msg.split(' ');
    if (words[words.length - 1][0] === '@') {
      var mention = words[words.length - 1];
      var name = mention.split('@').join('');
      if (name === '') {
        return [];
      }
      return online.usernames.filter(n => n.toUpperCase().includes(name.toUpperCase()));
    } else {
      return [];
    }
  }

  replaceMention(index) {
    var words = this.msg.split(' ');
    words[words.length - 1] = '@'+this.mentionMatches[index]+' ';
    this.msg = words.join(' ');
  }
}
