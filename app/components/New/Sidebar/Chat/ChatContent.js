import React from 'react';
import {observer} from 'mobx-react';
// import fbase from 'stores/fbase';
import chat from 'stores/chat';
import classNames from 'classnames';
import Linkify from 'react-linkify';
import ReactEmoji from 'react-emoji';
import Avatars from 'libs/avatars';

const linkifyProperties = {target: '_blank'};

export default @observer class ChatContent extends React.Component {
  render() {
    var messages = chat.messages;
    var content = messages.map((msg, i) => {
      var chatPosClass = Number.isInteger(i / 2) ? "chat-line-1" : "chat-line-0";
      var chatLineClasses = classNames("chat-item ", chatPosClass);
      var usernameClasses = classNames("chat-username", undefined);
      var humanTimestamp;
      var avatar = new Avatars(msg.username).avatar;
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
            {/* <ReactImageFallback
              className="avatarimg"
              src={chatAvatar}
              fallbackImage={avatarFallback}
              initialImage="/img/no-avatar.gif"
            /> */}
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
      <div id="chatscroll" ref="chatScroll">
        <ul id="chatbox">
          {content}
        </ul>
      </div>
    );
  }
}
