import {observable, computed} from "mobx";
import toast from "utils/toast";
import fbase from "libs/fbase";
import profile from "stores/profile";
import events from "stores/events";
import online from "stores/online";
import mention from "libs/mention";
import {send} from "libs/events";
import epoch from "../utils/epoch";

const mentionPattern = /\B@[a-z0-9_-]+/gi;
const CHAT_DEBOUNCE_MSEC = 300;
const CHAT_PENALTY_MSEC = 500;
const MSG_CHAR_LIMIT = 500;
const CHAT_LOCK_REGISTRATION_SEC = 1800;
const GIF_THROTTLE = 60;

export default new class Chat {
  constructor() {
    this.fbase = fbase;
    fbase
      .database()
      .ref("chat")
      .limitToLast(50)
      .on("child_added", snap => {
        var msg = snap.val();
        if (msg) {
          // Makes chat messages appear to the silenced user.

          if (msg.uid !== profile.uid && (msg.silenced !== undefined && msg.silenced === true)) {
            if ((profile.rank && !profile.showmuted) || !profile.rank) return;
          }

          if (
            msg.adminOnly !== undefined &&
            msg.adminOnly === true &&
            (profile.rank === null || profile.rank.match(/User|Frient|VIP/i))
          ) {
            // This is an admin only message.
            return;
          }
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

          if (msg.mentions && profile.username) {
            //mention check
            let mentions = msg.mentions.map(s => {
              return s ? s.substr(1).toLowerCase() : "";
            });
            let everyone = mentions.includes("everyone");
            let mentioned = everyone;
            if (!mentioned) {
              mentioned = mentions.includes(profile.safeUsername.toLowerCase());
            }
            if (mentioned) {
              mention(everyone, msg.username);
            }
          }
        }
      });

    events.register("chat_clear", () => (this.messages = []));

    this.limit = MSG_CHAR_LIMIT;

    fbase
      .database()
      .ref("backend")
      .child("chatlock")
      .on("value", snap => (this.chatLocked = !!snap.val())); // listen to backend chatlock value
  }

  @observable messages = []; 
  @observable msg = "";

  @observable lastgif = epoch();

  @observable chatLocked = false;

  @observable chatcounter = [];

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
    // Clear out expired timers.
    for (var i = 0; i < this.chatcounter.length; i++) {
      if (Date.now() - this.chatcounter[i].time > 5000) {
        i--;
        this.chatcounter.shift();
        continue;
      }
    }

    this.chatDebounce =
      this.chatcounter.length * CHAT_DEBOUNCE_MSEC +
      (this.chatcounter.length > 5 ? this.chatcounter.length * CHAT_PENALTY_MSEC : 0);

    if (
      this.chatcounter.length == 0 ||
      Date.now() - this.chatcounter[this.chatcounter.length - 1].time > this.chatDebounce
    ) {
      if (this.msg.length !== 0) {
        if (this.msg.match(/^\/gif/) && epoch() - this.lastgif > GIF_THROTTLE * 1000) {
          toast.warning(
            `It has been less than a minute since you last used gif, let it cool down buddy..`
          );
        } else {
          if (this.msg.match(/^\/gif/)) this.lastgif = epoch();

          this.msg = this.msg.replace("<3", ":heart:");
          this.sendMsg(this.getMsg());

          profile.lastchat = epoch();
          this.chatcounter.push({
            time: Date.now()
          });
        }
      }
    } else if (this.msg !== "") {
      toast.warning(`Please wait ${this.chatDebounce / 1000} second(s) between messages.`);
    }
  }

  sendMsg(msg, cb) {
    var mentions = msg.match(mentionPattern) || [];

    send("chat", {
      mentions,
      msg
    });

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

      return online.userlist.filter(
        n =>
          n &&
          n.toUpperCase().includes(name.toUpperCase()) &&
          n.toUpperCase() !== name.toUpperCase()
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
