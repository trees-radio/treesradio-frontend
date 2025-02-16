import React, { useEffect, useRef, useState } from 'react';
import { observer } from "mobx-react";
import classNames from "classnames";
import moment from "moment";
import chat from "../../../stores/chat";
import profile from "../../../stores/profile";
import UserName from "../../utility/User/UserName";
import UserAvatar from "../../utility/User/UserAvatar";
import Message from "./Message";

const SCROLL_THRESHOLD = 100; // Distance from bottom to trigger auto-scroll

const ChatContent = observer(({ goToChat }) => {
  const scrollRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  const scrollToBottom = () => {
    if (scrollRef.current && shouldAutoScroll && !isUserScrolling) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Handle new messages
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]); // Scroll when messages change

  // Handle scroll events
  const handleScroll = (e) => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Only auto-scroll if we're near the bottom
    setShouldAutoScroll(distanceFromBottom <= SCROLL_THRESHOLD);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    setIsUserScrolling(true);
  };

  const handleTouchEnd = () => {
    setIsUserScrolling(false);
    
    // Check if we should resume auto-scroll
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShouldAutoScroll(distanceFromBottom <= SCROLL_THRESHOLD);
    }
  };

  const renderMessages = () => {
    return chat.messages.map((msg, i) => {
      const chatPosClass = i % 2 === 0 ? "chat-line-1" : "chat-line-0";
      const chatLineClasses = classNames(
        "chat-item",
        chatPosClass,
        {
          "blazebot-msg": msg.username === "BlazeBot",
        },
        profile.hideBlazeBot ? "blazebot-hide" : ""
      );

      const humanTimestamp = moment.unix(msg.timestamp).format("LT");
      
      return (
        <li key={i} className={chatLineClasses}>
          <div className="chat-avatar">
            <UserAvatar uid={msg.uid} />
          </div>
          <div className="chat-msg">
            <UserName
              uid={msg.uid}
              className="chat-username"
              onClick={() => {
                chat.appendMsg("@" + msg.username + " ");
                goToChat();
              }}
            />
            <span className="chat-timestamp">{humanTimestamp}</span>
            <br />
            <span className="chat-text">
              {msg.msgs.map((innerMsg, j) => (
                <Message
                  key={j}
                  userName={msg.username}
                  isEmote={msg.isemote}
                  text={innerMsg}
                  onLoad={scrollToBottom}
                />
              ))}
            </span>
          </div>
        </li>
      );
    });
  };

  return (
    <div 
      id="chatscroll"
      ref={scrollRef}
      className="h-96 overflow-y-auto"
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ul id="chatbox" className="p-4">
        {renderMessages()}
      </ul>
    </div>
  );
});

export default ChatContent;