import React from 'react';
import {observer} from 'mobx-react';
import chat from 'stores/chat';
import classNames from 'classnames';
import Linkify from 'react-linkify';
import ReactEmoji from 'react-emoji';
import avatars from 'libs/avatars';
import moment from 'moment';
import UserName from 'components/utility/User/UserName';
import UserAvatar from 'components/utility/User/UserAvatar';

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

    setTimeout(() => this._chatscroll.scrollTop = this._chatscroll.scrollHeight, 1000);
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
      var chatLineClasses = classNames("chat-item", chatPosClass, {"blazebot-msg": msg.username == 'BlazeBot'});

      var humanTimestamp = moment.unix(msg.timestamp).format('LT');

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
            <UserAvatar uid={msg.uid}/>
          </div>
          <div className="chat-msg">
            <UserName uid={msg.uid} className="chat-username" onClick={() => chat.appendMsg('@'+msg.username)}/>
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
