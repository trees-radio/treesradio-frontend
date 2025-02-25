import {computed, observable, action} from "mobx";
import {getDatabaseRef} from "../libs/fbase";
import profile from "./profile";
import events from "./events";
import online from "./online";
import mention from "../libs/mention";
import {send} from "../libs/events";
import epoch from "../utils/epoch";
// import Favico from "favico.js";
import $ from 'jquery';

const mentionPattern = /\B@[a-z0-9_-]+/gi;
const MSG_CHAR_LIMIT = 500;
const CHAT_LOCK_REGISTRATION_SEC = 1800;
// const favico = new Favico({ animation: "slide" });

export interface ChatMessage {
  uid: string;
  username: string;
  msgs?: string[];
  timestamp: number;
  silenced?: boolean;
  adminOnly?: boolean;
  mentions?: string[];
  isemote?: boolean;
}

interface ChatMessageData {
  mentions: string[];
  msg: string;
  timestamp: number;
  uid: string;
  username: string;
  silenced?: boolean;
}
export default new (class Chat {
  limit: number;
  constructor() {
    setInterval(()=> {
      if ( $('ul#chatbox').children().length > 20 ) 
        $('ul#chatbox').children()[0].remove();
      
    }, 1000);
    const myself = this;
    window.onfocus = function () {
      myself.mentioncount = 0;
      // favico.badge(0);
      myself.werefocused = true;
    };
    window.onblur = function () {
      myself.werefocused = false;
    };
    getDatabaseRef("chat")
      .orderByChild("timestamp")
      .limitToLast(50)
      .on("child_added", snap => {
        var msg = snap.val();
        if (msg) {
          // Makes chat messages appear to the silenced user.

          if (msg.uid !== profile.uid && msg.silenced !== undefined && msg.silenced === true) {
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
            this.inlineMessage(msg);
          } else {
            msg.msgs = [msg.msg];
            this.pushMessage(msg);
          }

          if (msg.mentions && profile.username) {
            //mention check
            let mentions = msg.mentions.map((s: string) => {
              return s ? s.substring(1).toLowerCase() : "";
            });
            let everyone = mentions.includes("everyone");
            let mentioned = everyone;
            if (!mentioned) {
              mentioned = mentions.includes(profile.safeUsername?.toLowerCase());
            }
            if (mentioned) {
              mention(everyone, msg.username, (msg.username === "BlazeBot" && msg.msg.includes("toke! :weed: :fire: :dash:")));
              if (!this.werefocused) {
                this.mentioncount++;
                // favico.badge(this.mentioncount);
              }
            }
          }
        }
      });

    events.register("chat_clear", () => (this.messages = []));

    this.limit = MSG_CHAR_LIMIT;

    getDatabaseRef("backend")
      .child("chatlock")
      .on("value", snap => (this.chatLocked = !!snap.val())); // listen to backend chatlock value
  }

  @observable accessor messages: ChatMessage[] = [];
  @observable accessor msg = "";

  @observable accessor lastgif = epoch();

  @observable accessor chatLocked = false;

  @observable accessor werefocused = true;
  @observable accessor mentioncount = 0;

  @action inlineMessage(msg: ChatMessageData) {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.msgs) {
      lastMessage.msgs.push(msg.msg);
    }
    this.messages[this.messages.length - 1].timestamp = msg.timestamp;
  }

  @action
  pushMessage(msg: ChatMessageData) {
    this.messages.push(msg);
  }

  @action
  updateMsg(msg: string) {
    if (msg.length <= MSG_CHAR_LIMIT) {
      this.msg = msg;
    }
  }

  @computed get chars() {
    return this.msg.length;
  }

  @action
  appendMsg(msg: string) {
    this.msg += " " + msg;
  }

  @action
  getMsg() {
    var msg = this.msg;
    this.msg = "";
    return msg;
  }

  @action
  async pushMsg() {
    // moving throttling to the backend.
    if (this.msg.length !== 0) {
      this.msg = this.msg.replace("<3", ":heart:");
      this.sendMsg(this.getMsg(), () => {});

      profile.lastchat = epoch();
    }
  }

  @action
  sendMsg(msg: string, cb: () => void) {
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
        (n: string) =>
          n &&
          n.toUpperCase().startsWith(name.toUpperCase()) &&
          n.toUpperCase() !== name.toUpperCase()
      );
    } else {
      return [];
    }
  }

  @action
  replaceMention(index: number) {
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
})();
