import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { debounce } from "lodash";
import chat from "stores/chat";
import classNames from "classnames";
import moment from "moment";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import Message from "./Message";
import profile from "stores/profile";
import $ from "jquery";

const SCROLL_SENSITIVITY = 200;

@observer
export default class ChatContent extends React.Component {

    @observable
    touchOffset = 0;

  componentDidMount() {
    this.scroll();
    this.startup = Date.now();
    document
      .getElementById("chatscroll")
      .addEventListener("touchstart", (evt) => {
        evt.preventDefault();

        this.touchOffset = evt.changedTouches[0].clientY;
      });
    document
      .getElementById("chatscroll")
      .addEventListener("touchmove", (evt) => {
        evt.preventDefault();

        document
          .getElementById("chatscroll")
          .scrollBy(0, this.touchOffset - evt.changedTouches[0].clientY);

        this.touchOffset = evt.changedTouches[0].clientY;
      });
  }

  scroll = () =>
    setTimeout(
      () => (this.chatScrollAmount.scrollTop = this.chatScrollAmount.scrollHeight),
      300
    );

  autoScroll = () => {
    if (Date.now() - this.startup < 3000) {
      this.debouncedScroll();
    }
    if (this.shouldScroll) {
      this.scroll();
    }
  };

  debouncedScroll = debounce(this.scroll, 5000);

  UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
    let test = this.chatScrollAmount.scrollHeight - this.chatScrollAmount.scrollTop;
    let target = this.chatScrollAmount.clientHeight;
    let testLow = test - SCROLL_SENSITIVITY;
    let testHigh = test + SCROLL_SENSITIVITY;
    this.shouldScroll = target > testLow && target < testHigh;
    }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.autoScroll();
  }

  render() {
    let messages = chat.messages;

    // Clear out old messages
    if (messages.length > 250) messages.slice(0, messages.length - 250);

    let content = messages.map((msg, i) => {
      let chatPosClass = i % 2 == 0 ? "chat-line-1" : "chat-line-0";
      let chatLineClasses = classNames(
        "chat-item",
        chatPosClass,
        {
          "blazebot-msg": msg.username === "BlazeBot",
        },
        profile.hideBlazeBot ? "blazebot-hide" : ""
      );

      let humanTimestamp = moment.unix(msg.timestamp).format("LT");
      let msgs = msg.msgs.map((innerMsg, i) => {
        return (
          <Message
            key={i}
            userName={msg.username}
            isEmote={msg.isemote}
            text={innerMsg}
            onLoad={() => setTimeout(() => this.autoScroll(), 100)}
          />
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
              onClick={() =>
                chat.appendMsg("@" + msg.username + " ") &&
                $("#chatinput").click()
              }
            />
            <span className="chat-timestamp">{humanTimestamp}</span>
            <br />
            <span className="chat-text">{msgs}</span>
          </div>
        </li>
      );
    });
    return (
      <div id="chatscroll" ref={(c) => (this.chatScrollAmount = c)}>
        <ul id="chatbox">{content}</ul>
      </div>
    );
  }

  @observable chatScrollAmount = { scrollTop: 0, scrollHeight: 0 };
}
