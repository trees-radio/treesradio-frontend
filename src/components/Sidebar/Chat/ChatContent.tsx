import { useEffect, useRef, useState, useCallback } from 'react';
import { observer } from "mobx-react";
import chat, {ChatMessage} from "../../../stores/chat";
import profile from "../../../stores/profile";
import classNames from "classnames";
import moment from "moment";
import Message from "./Message";
import UserName from "../../utility/User/UserName";
import UserAvatar from "../../utility/User/UserAvatar";

const SCROLL_THRESHOLD = 100;

const ChatContent = observer(({ goToChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const isInitialMount = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;
    
    const shouldScroll = shouldAutoScroll && !isUserScrolling;
    if (shouldScroll) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [shouldAutoScroll, isUserScrolling]);

  // Handle initial mount and messages updates
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      scrollToBottom();
      return;
    }

    if (!scrollRef.current) return;

    const scrollElement = scrollRef.current;
    const heightDifference = scrollElement.scrollHeight - lastScrollHeightRef.current;
    
    if (shouldAutoScroll && !isUserScrolling) {
      scrollToBottom();
    } else if (heightDifference > 0) {
      // Maintain relative scroll position for user who has scrolled up
      scrollElement.scrollTop = lastScrollTopRef.current + heightDifference;
    }
    
    lastScrollHeightRef.current = scrollElement.scrollHeight;
    lastScrollTopRef.current = scrollElement.scrollTop;
  }, [chat.messages, scrollToBottom, shouldAutoScroll, isUserScrolling]);

  // Handle scroll events
  const handleScroll = useCallback((_e: React.UIEvent) => {
    if (!scrollRef.current || isUserScrolling) return;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Only update if the auto-scroll state needs to change
    if ((distanceFromBottom <= SCROLL_THRESHOLD) !== shouldAutoScroll) {
      setShouldAutoScroll(distanceFromBottom <= SCROLL_THRESHOLD);
    }
    
    lastScrollHeightRef.current = scrollHeight;
    lastScrollTopRef.current = scrollTop;
  }, [isUserScrolling, shouldAutoScroll]);

  const handleTouchStart = useCallback(() => {
    setIsUserScrolling(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsUserScrolling(false);
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShouldAutoScroll(distanceFromBottom <= SCROLL_THRESHOLD);
    }
  }, []);

  const handleMessageLoad = useCallback(() => {
    if (shouldAutoScroll && !isUserScrolling) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [shouldAutoScroll, isUserScrolling, scrollToBottom]);

  return (
    <div 
      id="chatscroll"
      ref={scrollRef}
      className="md:h-[85vh] h-[31em] overflow-y-auto "
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ul id="chatbox" className="p-4">
        {chat.messages.map((msg: ChatMessage, i) => {
          const chatPosClass = i % 2 === 0 ? "chat-line-1" : "chat-line-0";
          const chatLineClasses = classNames(
            "chat-item",
            chatPosClass,
            {
              "blazebot-msg": msg.username === "BlazeBot"
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
                  {msg.msgs?.map((innerMsg: string, j: number) => (
                    <Message
                      key={j}
                      userName={msg.username}
                      isEmote={msg.isemote || false}
                      text={innerMsg}
                      onLoad={handleMessageLoad}
                    />
                  ))}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default ChatContent;