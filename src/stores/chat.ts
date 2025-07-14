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
const MENTION_RECENT_WINDOW = 5;
// Message expiration time in seconds (24 hours)
const MESSAGE_EXPIRATION = 86400;

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
  // Message editing fields
  edited?: boolean;
  editedAt?: number;
  deleted?: boolean;
  deletedAt?: number;
  editHistory?: Array<{
    content: string;
    timestamp: number;
  }>;
}

export interface ChatMessages {
  [key: string]: ChatMessage | ChatMessage[];
}

export default new (class Chat {
  limit: number;
  // Track processed messages by key with their timestamps
  processedMessageKeys: Map<string, number> = new Map();
  
  // Store cleanup references
  private chatRef: any = null;
  private chatCallback: ((snap: any) => void) | null = null;
  private chatLockRef: any = null;
  private chatLockCallback: ((snap: any) => void) | null = null;
  private focusHandler: (() => void) | null = null;
  private blurHandler: (() => void) | null = null;

  constructor() {
    const myself = this;
    
    // Fix: Store event handlers for proper cleanup
    this.focusHandler = function () {
      myself.mentioncount = 0;
      // favico.badge(0);
      myself.werefocused = true;
    };
    this.blurHandler = function () {
      myself.werefocused = false;
    };
    
    window.addEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.blurHandler);
    
    // Fix: Store chat listener reference and callback for cleanup
    this.chatRef = getDatabaseRef("chat")
      .orderByChild("timestamp")
      .limitToLast(200);
      
    this.chatCallback = (snap: any) => {
      var msg: ChatMessages = snap.val();
      
      // Clean expired message keys before processing new messages
      this.cleanExpiredMessageKeys();

      if (msg) {
        // Collect new active keys and process messages atomically
        const newActiveKeys: string[] = [];
        const messagesToProcess: Array<{key: string, msg: ChatMessage}> = [];
        
        Object.entries(msg).forEach(([key, msg]) => {
          // Add to new active keys
          newActiveKeys.push(key);

          // Test if this is a single message or an array of messages.
          if (Array.isArray(msg)) {
            msg.forEach((m: ChatMessage) => {
              if (m.uid !== profile.uid && m.silenced !== undefined && m.silenced === true) {
                if ((profile.rank && !profile.showmuted) || !profile.rank) return;
              }
            });
            // This is supposed to be something but the backend doesn't do this??
          } else {
            // Skip processing if message timestamp is too old
            const currentTime = epoch();
            const messageAge = currentTime - msg.timestamp;
            // Skip messages older than MESSAGE_EXPIRATION seconds
            if (messageAge > MESSAGE_EXPIRATION) return;
            
            // Check if we've already processed this message
            const wasProcessed = this.isMessageProcessed(key, msg.timestamp);
            
            // Mark as processed with its timestamp
            this.markMessageProcessed(key, msg.timestamp);

            msg.key = key;
            
            // Handle deleted messages
            if (msg.deleted) {
              this.removeMessage(key);
              return;
            }
            
            // If this message was already processed but has a newer timestamp,
            // it might be an edit - update the existing message
            if (wasProcessed && msg.edited) {
              this.updateExistingMessage(key, msg);
              return;
            }
            
            // Skip if already processed and not edited
            if (wasProcessed) return;
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
            
            // Add to processing queue instead of immediate processing
            messagesToProcess.push({key, msg});
          }
        });
        
        // Atomically update active keys - this prevents race condition
        this.updateActiveKeys(newActiveKeys);
        
        // Sort messages by timestamp before processing to ensure proper order
        messagesToProcess.sort((a, b) => a.msg.timestamp - b.msg.timestamp);
        
        // Process messages in correct chronological order
        messagesToProcess.forEach(({key, msg}) => {
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
        });
        
        if (profile.isGifsHidden) {
          $("img[alt='tenorgif']").css("display", "none");
        } else {
          $("img[alt='tenorgif']").css("display", "block");
        }
        
        // Remove inactive messages after processing is complete
        this.removeInactiveMessages();
      }
    };
    
    this.chatRef.on("value", this.chatCallback);

    events.register("chat_clear", () => this.clearChat());

    events.register("force_refresh", () => {
      location.reload()
    });

    this.limit = MSG_CHAR_LIMIT;

    // Fix: Store chat lock listener reference and callback for cleanup
    this.chatLockRef = getDatabaseRef("backend").child("chatlock");
    this.chatLockCallback = (snap: any) => (this.chatLocked = !!snap.val());
    this.chatLockRef.on("value", this.chatLockCallback);
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    // Clean up chat listener
    if (this.chatRef && this.chatCallback) {
      this.chatRef.off("value", this.chatCallback);
      this.chatRef = null;
      this.chatCallback = null;
    }
    
    // Clean up chat lock listener
    if (this.chatLockRef && this.chatLockCallback) {
      this.chatLockRef.off("value", this.chatLockCallback);
      this.chatLockRef = null;
      this.chatLockCallback = null;
    }
    
    // Clean up window event listeners
    if (this.focusHandler) {
      window.removeEventListener('focus', this.focusHandler);
      this.focusHandler = null;
    }
    if (this.blurHandler) {
      window.removeEventListener('blur', this.blurHandler);
      this.blurHandler = null;
    }
  }

  @observable accessor messages: ChatMessage[] = [];
  @observable accessor msg = "";

  @observable accessor lastgif = epoch();

  @observable accessor chatLocked = false;

  @observable accessor werefocused = true;
  @observable accessor mentioncount = 0;
  @observable accessor msgkeys: string[] = [];
  @observable accessor showDebug = false;

  // Check if a message has been processed already using both key and timestamp
  isMessageProcessed(key: string, timestamp: number): boolean {
    const processedTimestamp = this.processedMessageKeys.get(key);
    if (processedTimestamp !== undefined) {
      // If the message already exists with same timestamp, it's processed
      if (processedTimestamp === timestamp) {
        return true;
      }
      
      // If the timestamp is older than what we've seen before, 
      // consider it a stale message and skip it
      if (timestamp < processedTimestamp) {
        return true;
      }
      
      // If the message has the same key but newer timestamp,
      // we'll process it (this could be an edit)
      return false;
    }
    return false;
  }
  
  // Mark a message as processed with its timestamp
  markMessageProcessed(key: string, timestamp: number): void {
    this.processedMessageKeys.set(key, timestamp);
  }
  
  // Clean up expired message keys to prevent memory leaks
  cleanExpiredMessageKeys(): void {
    const currentTime = epoch();
    const keysToDelete: string[] = [];
    
    this.processedMessageKeys.forEach((timestamp, key) => {
      if (currentTime - timestamp > MESSAGE_EXPIRATION) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.processedMessageKeys.delete(key);
    });
  }

  @action clearMessageKeys() {
    this.msgkeys = [];
  }

  @action pushMessageKey(key: string) {
    this.msgkeys.push(key);
  }

  @action updateActiveKeys(newKeys: string[]) {
    // Atomically update the active keys array to prevent race conditions
    this.msgkeys = [...newKeys];
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
    // Note: We're now keeping the processedMessageKeys to prevent reprocessing
    // but we clean expired keys regularly to prevent memory issues
  }

  @action
  updateExistingMessage(key: string, updatedMsg: ChatMessage) {
    const messageIndex = this.messages.findIndex(msg => msg.key === key);
    if (messageIndex !== -1) {
      // Update the existing message while preserving the msgs array structure
      const existingMessage = this.messages[messageIndex];
      this.messages[messageIndex] = {
        ...existingMessage,
        ...updatedMsg,
        msgs: [updatedMsg.msg] // Update the message content
      };
    }
  }

  @action
  removeMessage(key: string) {
    this.messages = this.messages.filter(msg => msg.key !== key);
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

  @action
  editMsg(messageKey: string, newMsg: string) {
    console.log('editMsg called with:', messageKey, newMsg);
    const mentions = newMsg.match(mentionPattern) || [];
    
    console.log('Sending chat_edit event:', {
      messageKey,
      msg: newMsg,
      mentions
    });
    
    send("chat_edit", {
      messageKey,
      msg: newMsg,
      mentions
    });
  }

  @action
  deleteMsg(messageKey: string) {
    console.log('deleteMsg called with:', messageKey);
    
    console.log('Sending chat_delete event:', {
      messageKey
    });
    
    send("chat_delete", {
      messageKey
    });
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