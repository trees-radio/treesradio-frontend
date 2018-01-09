import React from "react";
import {observer} from "mobx-react";
import _ from "lodash";
import chat from "stores/chat";
import classNames from "classnames";
import moment from "moment";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import Message from "./Message";

const SCROLL_SENSITIVITY = 200;

@observer
export default (class ChatContent extends React.Component {
  componentDidMount() {
    this.scroll();
    this.startup = Date.now();
  }

  scroll = () => setTimeout(() => this._chatscroll.scrollTop = this._chatscroll.scrollHeight, 300);

  autoScroll = () => {
    if (Date.now() - this.startup < 3000) {
      this.debouncedScroll();
    }
    if (this.shouldScroll) {
      this.scroll();
    }
  };

  debouncedScroll = _.debounce(this.scroll, 5000);

  componentWillUpdate() {
    var test = this._chatscroll.scrollHeight - this._chatscroll.scrollTop;
    var target = this._chatscroll.clientHeight;
    var testLow = test - SCROLL_SENSITIVITY;
    var testHigh = test + SCROLL_SENSITIVITY;
    if (target > testLow && target < testHigh) {
      this.shouldScroll = true;
    } else {
      this.shouldScroll = false;
    }
  }

  componentDidUpdate() {
    this.autoScroll();
  }

  render() {
    var messages = chat.messages;

    var content = messages.map((msg, i, arr) => {
      var chatPosClass = i % 2 == 0 ? "chat-line-1" : "chat-line-0";
      var chatLineClasses = classNames("chat-item", chatPosClass, {
        "blazebot-msg": msg.username == "BlazeBot"
      });

      var humanTimestamp = moment.unix(msg.timestamp).format("LT");
      var msgs = msg.msgs.map((innerMsg, i) => {
        return (
          <Message key={i} isEmote={msg.isemote} text={innerMsg} onLoad={() => setTimeout(this.autoScroll(true), 100)} />
        );
      });

      return (
        <li key={i} className={chatLineClasses}>
          <div className="chat-avatar">
            <UserAvatar uid={msg.uid} />
          </div>
          <div className="chat-msg">
            <UserName
              uid={msg.uid}
              className="chat-username"
              onClick={() => chat.appendMsg("@" + msg.username + " ")  && $('#chatinput').click() }
            />
            <span className="chat-timestamp">{humanTimestamp}</span><br />
            <span className="chat-text">{msgs}</span>
          </div>
        </li>
      );
    });
    return (
      <div id="chatscroll" ref={c => this._chatscroll = c}>
        <ul id="chatbox">
          {content}
        </ul>
      </div>
    );
  }
});
