import { useEffect, useRef, useState, useCallback } from 'react';
import { observer } from "mobx-react";
import chat, { ChatMessage } from "../../../stores/chat";
import profile from "../../../stores/profile";
import classNames from "classnames";
import moment from "moment";
import Message from "./Message";
import UserName from "../../utility/User/UserName";
import UserAvatar from "../../utility/User/UserAvatar";

const SCROLL_THRESHOLD = 150;
const IMAGE_LOAD_DELAY = 500; // Additional delay for image loading

const ChatContent = observer(({ goToChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const messagesLengthRef = useRef(0);
  const userScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingImageLoadsRef = useRef(0);
  const imageLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Enhanced scroll to bottom with a force option that ignores user scrolling
  const scrollToBottom = useCallback((smooth = false, force = false) => {
    if (!scrollRef.current) return;
    
    if (force || (shouldAutoScroll && isUserNearBottom && !isUserScrolling)) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
      
      // Update refs after forced scroll
      if (force) {
        lastScrollHeightRef.current = scrollElement.scrollHeight;
        lastScrollTopRef.current = scrollElement.scrollTop;
      }
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling]);

  // Check if user is near the bottom of the chat
  const checkIfNearBottom = useCallback(() => {
    if (!scrollRef.current) return false;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    return distanceFromBottom <= SCROLL_THRESHOLD;
  }, []);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    pendingImageLoadsRef.current -= 1;
    
    // Clear any existing timer
    if (imageLoadTimerRef.current) {
      clearTimeout(imageLoadTimerRef.current);
    }
    
    // Set a timer to scroll after all images have loaded
    if (pendingImageLoadsRef.current <= 0) {
      imageLoadTimerRef.current = setTimeout(() => {
        if (shouldAutoScroll && isUserNearBottom && !isUserScrolling) {
          scrollToBottom(true, true); // Force scroll after images load
        }
        pendingImageLoadsRef.current = 0;
      }, IMAGE_LOAD_DELAY);
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, scrollToBottom]);

  // Register an image load
  const registerImageLoad = useCallback(() => {
    pendingImageLoadsRef.current += 1;
  }, []);

  // Handle initial mount and messages updates
  useEffect(() => {
    // Immediately scroll to bottom on first load
    if (messagesLengthRef.current === 0 && chat.messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom(false, true));
    }
    
    // Handle new messages being added
    if (chat.messages.length > messagesLengthRef.current) {
      // Detect if BlazeBot messages with potentially large content
      const newMessages = chat.messages.slice(messagesLengthRef.current);
      const hasBotMessage = newMessages.some(msg => msg.username === "BlazeBot");
      const hasImages = newMessages.some(msg => 
        msg.msgs?.some(text => text.includes('img') || text.includes('tenorgif'))
      );
      
      // If has bot messages or images, we'll need special handling
      if (hasBotMessage || hasImages) {
        // We'll apply multiple scroll attempts with delays
        setTimeout(() => scrollToBottom(false, true), 50);
        setTimeout(() => scrollToBottom(false, true), 300);
        setTimeout(() => scrollToBottom(false, true), 800);
      } else if (shouldAutoScroll && isUserNearBottom && !isUserScrolling) {
        // Normal messages - single delayed scroll
        setTimeout(() => scrollToBottom(false), 50);
      }
    }
    
    messagesLengthRef.current = chat.messages.length;
  }, [chat.messages, scrollToBottom, shouldAutoScroll, isUserNearBottom, isUserScrolling]);

  // Use MutationObserver to detect DOM changes in the chat
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const chatbox = scrollRef.current.querySelector('#chatbox');
    if (!chatbox) return;
    
    // MutationObserver to watch for DOM changes (like images loading)
    const observer = new MutationObserver((mutations) => {
      // Check if we need to scroll
      if (!shouldAutoScroll || !isUserNearBottom || isUserScrolling) return;
      
      // Look for added images or large content
      let hasNewImages = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              const imgs = node.querySelectorAll('img');
              if (imgs.length > 0) {
                hasNewImages = true;
                // Register each image for loading
                imgs.forEach(img => {
                  if (!img.complete) {
                    registerImageLoad();
                    img.addEventListener('load', handleImageLoad, { once: true });
                  }
                });
              }
            }
          });
        }
      });
      
      // If we have no pending image loads, scroll immediately
      if (hasNewImages && pendingImageLoadsRef.current === 0) {
        setTimeout(() => scrollToBottom(false, true), 50);
      }
    });
    
    // Start observing
    observer.observe(chatbox, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['src'] 
    });
    
    return () => {
      observer.disconnect();
      // Clear any pending timers
      if (imageLoadTimerRef.current) {
        clearTimeout(imageLoadTimerRef.current);
      }
    };
  }, [scrollToBottom, shouldAutoScroll, isUserNearBottom, isUserScrolling, handleImageLoad, registerImageLoad]);

  // Update scroll position when the element resizes
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Only act if content size actually changed
        if (entry.contentRect.height !== lastScrollHeightRef.current && shouldAutoScroll && isUserNearBottom && !isUserScrolling) {
          // Delay the scroll to allow rendering to complete
          setTimeout(() => scrollToBottom(false, true), 100);
        }
      }
    });
    
    resizeObserver.observe(scrollRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, scrollToBottom]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isUserScrolling) return;
    
    const isNearBottom = checkIfNearBottom();
    setIsUserNearBottom(isNearBottom);
    setShouldAutoScroll(isNearBottom);
    
    const scrollElement = scrollRef.current;
    lastScrollHeightRef.current = scrollElement.scrollHeight;
    lastScrollTopRef.current = scrollElement.scrollTop;
  }, [isUserScrolling, checkIfNearBottom]);

  const handleTouchStart = useCallback(() => {
    setIsUserScrolling(true);
    
    // Clear any existing timer
    if (userScrollTimerRef.current) {
      clearTimeout(userScrollTimerRef.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Set a small delay before turning off user scrolling flag
    userScrollTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      const isNearBottom = checkIfNearBottom();
      setIsUserNearBottom(isNearBottom);
      setShouldAutoScroll(isNearBottom);
      
      // If the user has scrolled to near the bottom, auto-scroll to bottom
      if (isNearBottom) {
        scrollToBottom(true);
      }
    }, 300);
  }, [checkIfNearBottom, scrollToBottom]);
  
  // Wheel event handler for mouse scrolling
  const handleWheel = useCallback(() => {
    setIsUserScrolling(true);
    
    // Clear any existing timer
    if (userScrollTimerRef.current) {
      clearTimeout(userScrollTimerRef.current);
    }
    
    // Set a small delay before turning off user scrolling flag
    userScrollTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      const isNearBottom = checkIfNearBottom();
      setIsUserNearBottom(isNearBottom);
      setShouldAutoScroll(isNearBottom);
    }, 300);
  }, [checkIfNearBottom]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (userScrollTimerRef.current) {
        clearTimeout(userScrollTimerRef.current);
      }
      if (imageLoadTimerRef.current) {
        clearTimeout(imageLoadTimerRef.current);
      }
    };
  }, []);

  // Message load handler that integrates with the image loading system
  const handleMessageLoad = useCallback(() => {
    if (shouldAutoScroll && isUserNearBottom && !isUserScrolling) {
      // Check if we're expecting images - if so, let the image system handle it
      if (pendingImageLoadsRef.current > 0) return;
      
      // Otherwise scroll normally
      scrollToBottom();
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, scrollToBottom]);

  return (
    <div 
      id="chatscroll"
      ref={scrollRef}
      className="md:h-[85vh] h-[31em] overflow-y-auto"
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
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