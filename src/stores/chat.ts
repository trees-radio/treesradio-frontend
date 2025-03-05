import { computed, observable, action } from "mobx";
import { getDatabaseRef } from "../libs/fbase";
import profile from "./profile";
import events from "./events";
import online from "./online";
import mention from "../libs/mention";
import { send } from "../libs/events";
import epoch from "../utils/epoch";
import $ from "jquery";

// Time window in seconds for considering mentions as "recent"
const MENTION_RECENT_WINDOW = 3;

const mentionPattern = /\B@[a-z0-9_-]+/gi;
const MSG_CHAR_LIMIT = 500;
const CHAT_LOCK_REGISTRATION_SEC = 1800;

export interface ChatMessage {
  adminOnly?: boolean;
  bot?: boolean;
  chatgpt?: boolean;
  isemote?: boolean;
  msg: string;
  replyMsg?: string;
  replyTo?: string;
  silenced?: boolean;
  timestamp: number;
  title: string;
  uid: string;
  username: string;
  msgs?: string[];
  mentions?: string[];
  key?: string;
}

export interface ChatMessages {
  [key: string]: ChatMessage | ChatMessage[];
}

export default new (class Chat {
  limit: number;
  // Track already processed messages by key
  processedMessageKeys: Set<string> = new Set();

  constructor() {
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
      .limitToLast(200)
      .on("value", snap => {
        var msg: ChatMessages = snap.val();
        // Clear the msgkeys array
        this.clearMessageKeys();

        if (msg) {
          Object.entries(msg).forEach(([key, msg]) => {
            // Push the key to our msgkeys array to track active messages
            this.pushMessageKey(key);

            // Test if this is a single message or an array of messages.
            if (Array.isArray(msg)) {
              msg.forEach((m: ChatMessage) => {
                if (m.uid !== profile.uid && m.silenced !== undefined && m.silenced === true) {
                  if ((profile.rank && !profile.showmuted) || !profile.rank) return;
                }
              });
              // This is supposed to be something but the backend doesn't do this??
            } else {
              // Check if we've already processed this message
              if (this.processedMessageKeys.has(key)) return;

              // Mark as processed to avoid duplicate processing
              this.processedMessageKeys.add(key);

              msg.key = key;
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
                  mentioned = mentions.includes(profile.safeUsername?.toLowerCase() || "");
                }
                // Only ping for mentions if the message is recent (within MENTION_RECENT_WINDOW seconds)
                const isRecent = (epoch() - msg.timestamp) <= MENTION_RECENT_WINDOW;
                if (mentioned && isRecent) {
                  mention(everyone, msg.username, (msg.username === "BlazeBot" && msg.msg.includes("toke! :weed: :fire: :dash:")));
                  if (!this.werefocused) {
                    this.mentioncount++;
                    // favico.badge(this.mentioncount);
                  }
                }
              }
            }
          });
          if (profile.isGifsHidden) {
            $("img[alt='tenorgif']").css("display", "none");
          } else {
            $("img[alt='tenorgif']").css("display", "block");
          }
          this.removeInactiveMessages();
        }
      });

    events.register("chat_clear", () => this.clearChat());

    events.register("force_refresh", () => {
      location.reload()
    });

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
  @observable accessor msgkeys: string[] = [];
  @observable accessor showDebug = false;

  @action clearMessageKeys() {
    this.msgkeys = [];
  }

  @action pushMessageKey(key: string) {
    this.msgkeys.push(key);
  }

  @action removeInactiveMessages() {
    // Don't use a filter as it causes the entire array to be re-rendered.
    // Instead, we'll just remove the first element until we find one that is active.
    while (this.messages.length > 0 && this.messages[0].key && !this.msgkeys.includes(this.messages[0].key)) {
      this.messages.shift();
    }
  }

  @action inlineMessage(msg: ChatMessage) {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.msgs) {
      lastMessage.msgs.push(msg.msg);
    }
    this.messages[this.messages.length - 1].timestamp = msg.timestamp;
  }

  @action clearChat() {
    this.messages = [];
    // Don't clear processedMessageKeys when clearing the chat
    // This prevents re-processing all messages again
  }

  @action
  pushMessage(msg: ChatMessage) {
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
      this.sendMsg(this.getMsg(), () => { });

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