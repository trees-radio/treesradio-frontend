import {observable, computed} from "mobx";
import toast from "utils/toast";
import fbase from "libs/fbase";
import profile from "stores/profile";
import events from "stores/events";
import online from "stores/online";
import mention from "libs/mention";
import {send} from "libs/events";

const mentionPattern = /\B@[a-z0-9_-]+/gi;
const CHAT_DEBOUNCE_MSEC = 1000;
const MSG_CHAR_LIMIT = 500;
const CHAT_LOCK_REGISTRATION_SEC = 1800;

export default new class Chat {
  constructor() {
    this.fbase = fbase;
    fbase.database().ref("chat").limitToLast(50).on("child_added", snap => {
      var msg = snap.val();
      if (msg) {
        if (
          this.messages[this.messages.length - 1] &&
          msg.username === this.messages[this.messages.length - 1].username
        ) {
          this.messages[this.messages.length - 1].msgs.push(msg.msg);
          this.messages[this.messages.length - 1].timestamp = msg.timestamp;
        } else {
          msg.msgs = [msg.msg];
          this.messages.push(msg);
        }

        if (profile.profileInit && msg.mentions) {
          //mention check
          const mentions = msg.mentions.map(s => s.split("@").join("").toLowerCase());
          const everyone = msg.bot && mentions.includes("everyone");
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

    events.register("chat_clear", () => this.messages = []);

    this.limit = MSG_CHAR_LIMIT;

    fbase
      .database()
      .ref("backend")
      .child("chatlock")
      .on("value", snap => this.chatLocked = !!snap.val()); // listen to backend chatlock value
  }

  @observable messages = [];

  @observable msg = "";

  @observable chatLocked = false;

  updateMsg(msg) {
    if (msg.length <= MSG_CHAR_LIMIT) {
      this.msg = msg;
    }
  }

  @computed get chars() {
    return this.msg.length;
  }

  appendMsg(msg) {
    this.msg += " " + msg;
  }

  getMsg() {
    var msg = this.msg;
    this.msg = "";
    return msg;
  }

  pushMsg() {
    if (!this.chatDebounce || this.chatDebounce < Date.now() - 5000) {
      this.sendMsg(this.getMsg());
      this.chatDebounce = Date.now();
    } else if (this.msg !== "") {
      toast.warning(`Please wait ${CHAT_DEBOUNCE_MSEC / 1000} second(s) between messages.`);
    }
  }

  sendMsg(msg, cb) {
    var mentions = msg.match(mentionPattern) || [];

    send("chat", {mentions, msg});

    if (cb) {
      cb();
    }
  }

  @computed get mentionMatches() {
    var words = this.msg.split(" ");
    if (words[words.length - 1][0] === "@") {
      var mention = words[words.length - 1];
      var name = mention.split("@").join("");
      if (name === "") {
        return [];
      }
      return online.usernames.filter(
        n => n.toUpperCase().includes(name.toUpperCase()) && n.toUpperCase() !== name.toUpperCase()
      );
    } else {
      return [];
    }
  }

  replaceMention(index) {
    var words = this.msg.split(" ");
    words[words.length - 1] = "@" + this.mentionMatches[index] + " ";
    this.msg = words.join(" ");
  }

  @computed get canChat() {
    if (!profile.loggedIn) return false;
    if (this.chatLocked && profile.secondsRegistered < CHAT_LOCK_REGISTRATION_SEC) return false;
    return true;
  }

  @computed get secondsUntilUnlock() {
    return CHAT_LOCK_REGISTRATION_SEC - profile.secondsRegistered;
  }
}();
