import React from "react";
// import {observable} from 'mobx';
import { observer } from "mobx-react";
// import fbase from 'stores/fbase';
import chat from "stores/chat";
import profile from "stores/profile";
import toast from "utils/toast";

// const noop = () => {};
@observer
export default (class ChatSend extends React.Component {
  onKeyPress(e) {
    var key = e.keyCode || e.which;
    if (key === 13) {
      e.preventDefault();
      if (chat.mentionMatches.length > 0) {
        chat.replaceMention(0);
      } else {
        chat.pushMsg();
      }
    }
  }

  onKeyDown(e) {
    var key = e.keyCode || e.which;
    if (key === 9) {
      if (chat.mentionMatches.length > 0) {
        chat.replaceMention(0);
      }
      e.preventDefault();
      return false;
    }
  }

  onChange(e) {
    if (!profile.user) {
      toast.error("You must be logged in to chat!");
    } else {
      e.preventDefault();
      chat.updateMsg(e.target.value);
    }
  }

  render() {
    var matchContainer;

    if (chat.mentionMatches.length > 0) {
      var matches = chat.mentionMatches.map((m, i) => {
        return (
          <span
            key={i}
            className="mention-item"
            onClick={() => chat.replaceMention(i)}
          >
            @{m}<br />
          </span>
        );
      });
      matchContainer = (
        <div className="mentions-container">
          {matches}
        </div>
      );
    }

    return (
      <form className="form-inline">
        <div className="form-group tr-form-group">
          {matchContainer}
          <div id="sendbox_test" className="input-group tr-form-group">
            <input
              type="text"
              placeholder="enter to send"
              id="chatinput"
              className="form-control"
              value={chat.msg}
              onKeyPress={e => this.onKeyPress(e)}
              onKeyDown={e => this.onKeyDown(e)}
              onChange={e => this.onChange(e)}
            />
            <div id="chat-counter_test" className="input-group-addon">
              {chat.chars} / {chat.limit}
            </div>
          </div>
        </div>
      </form>
    );
  }
});
