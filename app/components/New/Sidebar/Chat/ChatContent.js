import React from 'react';
import {observer} from 'mobx-react';
// import fbase from 'stores/fbase';
import chat from 'stores/chat';
import classNames from 'classnames';
import Linkify from 'react-linkify';
import ReactEmoji from 'react-emoji';
import avatars from 'libs/avatars';

const linkifyProperties = {target: '_blank'};
const SCROLL_SENSITIVITY = 100;

export default @observer class ChatContent extends React.Component {
  componentDidMount() {
    // scroll diagnostics, don't enable in production
    // setInterval(() => {
    //   console.log("top", this._chatscroll.scrollTop);
    //   console.log("height", this._chatscroll.scrollHeight);
    //   console.log("test", this._chatscroll.scrollHeight - this._chatscroll.scrollTop === this._chatscroll.clientHeight);
    // }, 1000);
  }

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
    if (this.shouldScroll) {
      this._chatscroll.scrollTop = this._chatscroll.scrollHeight;
    }
  }

  render() {
    var messages = chat.messages;

    var content = messages.map((msg, i, arr) => {
      var chatPosClass = Number.isInteger(i / 2) ? "chat-line-1" : "chat-line-0";
      var chatLineClasses = classNames("chat-item ", chatPosClass);
      var usernameClasses = classNames("chat-username", undefined);
      var humanTimestamp;

      avatars.loadAvatar(msg.username);
      var avatar = avatars.users[msg.username];

      var msgs = msg.msgs.map((innerMsg, i) => {
        return (
          <Linkify key={i} properties={linkifyProperties}>
            <span>{ ReactEmoji.emojify(innerMsg, {emojiType: 'twemoji'}) }<br/></span>
          </Linkify>
        );
      });

      return (
        <li key={i} className={chatLineClasses}>
          <div className="chat-avatar">
            <img src={avatar} className="avatarimg"/>
          </div>
          <div className="chat-msg">
            <span className={usernameClasses} onClick={() => {}}>{ msg.username }</span>
            <span className="chat-timestamp">{humanTimestamp}</span><br />
            <span className="chat-text">{ msgs }</span>
          </div>
        </li>
      );
    })
    return (
      <div id="chatscroll" ref={c => this._chatscroll = c}>
        <ul id="chatbox">
          {content}
        </ul>
      </div>
    );
  }
}
