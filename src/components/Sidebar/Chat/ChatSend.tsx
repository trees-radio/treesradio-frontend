import React from "react";
// import {observable} from 'mobx';
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import {EmojiPickerSpecialEmoji} from "../.././../libs/emoji";

import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
// import fbase from 'stores/fbase';
import chat from "../../../stores/chat";
import profile from "../../../stores/profile";
import toast from "../../../utils/toast";

// const noop = () => {};
interface ChatSendProps {
  myref: React.RefObject<HTMLInputElement>;
}
class ChatSend extends React.Component {
  props: ChatSendProps;

  @observable accessor showEmojiPicker: boolean = false;

  @action toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  constructor(props: ChatSendProps) {
    super(props);
    this.props = props;
  }

  onKeyPress(e: React.KeyboardEvent) {
    var key = e.keyCode || e.which;
    if (key === 13) {
      e.preventDefault();
      if (chat.mentionMatches.length > 0) {
        chat.replaceMention(0);
      } else if ((e.target as HTMLInputElement).value.length > 0) {
        chat.pushMsg();
      }
    }
  }

  onKeyDown(e: React.KeyboardEvent) {
    var key = e.keyCode || e.which;
    if (key === 9) {
      if (chat.mentionMatches.length > 0) {
        chat.replaceMention(0);
      }
    }

    if (key === 13) {
      e.preventDefault();
      if (chat.mentionMatches.length > 0) {
        chat.replaceMention(0);
      } else if ((e.target as HTMLInputElement).value.length > 0) {
        chat.pushMsg();
      }
    }

    return false;
  }
  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!profile.user) {
      toast("You are not logged in!", { type: "error" });
    } else {
      e.preventDefault();
      chat.updateMsg(e.target.value);
    }
  }

  emojiPicked(emoji: EmojiClickData) {
    this.showEmojiPicker = false;
    if (emoji.isCustom) {
      chat.updateMsg(chat.msg + ` :${emoji.names[0]}: `);
      return;
    }
    chat.updateMsg(chat.msg + emoji.emoji);
  }

  render() {
    var matchContainer;

    if (chat.mentionMatches.length > 0) {
      var matches = chat.mentionMatches.map((m, i) => {
        return (
          <span key={i} className="mention-item" onClick={() => chat.replaceMention(i)}>
            {" "}
            @{m}
          </span>
        );
      });
      matchContainer = <div className="mentions-container"> {matches} </div>;
    }

    return (
      <form className="form-inline chatbar" id="search">
      <EmojiPicker
        onEmojiClick={(emoji, _event) => this.emojiPicked(emoji)}
        open={this.showEmojiPicker}
        style={{ bottom: "5vh", position: "absolute"}}
        customEmojis={EmojiPickerSpecialEmoji}
        theme={Theme.AUTO}
      />
        <div className="form-group tr-form-group chatboxform">
          {" "}
          {matchContainer}{" "}
          <div id="sendbox_test" className="input-group tr-form-group">
            <div className="input-group-addon w-11 h-11 bg-white flex items-center justify-center rounded-l-md"
              onClick={() => {
                this.toggleEmojiPicker();
              }}
            >
              🙂
            </div>
            <input
              ref={this.props.myref}
              type="text"
              placeholder="enter to send"
              id="chatinput"
              autoComplete="off"
              className="bg-white h-11 rounded-l-none"
              value={chat.msg}
              // onKeyPress={e => this.onKeyPress(e)}
              onKeyDown={e => this.onKeyDown(e)}
              onChange={e => this.onChange(e)}
              data-lpignore="true"
            />
            <div id="chat-counter_test" className="input-group-addon w-17 h-11 content-center">
              {" "}
              {chat.chars}/{chat.limit}{" "}
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default observer(ChatSend);