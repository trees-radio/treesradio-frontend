import { useEffect, useRef, useState, useCallback } from 'react';
import { observer } from "mobx-react";
import chat, { ChatMessage } from "../../../stores/chat";
import profile from "../../../stores/profile";
import classNames from "classnames";
import moment from "moment";
import Message from "./Message";
import UserName from "../../utility/User/UserName";
import UserAvatar from "../../utility/User/UserAvatar";

const SCROLL_THRESHOLD = 150; // Distance from bottom to consider "at bottom"
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
  
  // Check if user is near the bottom of the chat
  const checkIfNearBottom = useCallback(() => {
    if (!scrollRef.current) return false;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "at bottom" if within threshold
    return distanceFromBottom <= SCROLL_THRESHOLD;
  }, []);
  
  // Enhanced scroll to bottom with force option
  const scrollToBottom = useCallback((smooth = false, force = false) => {
    if (!scrollRef.current) return;
    
    if (force || (shouldAutoScroll && !isUserScrolling)) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
      
      // Update refs after scrolling
      lastScrollHeightRef.current = scrollElement.scrollHeight;
      lastScrollTopRef.current = scrollElement.scrollTop;
      
      // After scrolling to bottom, we should re-enable auto-scrolling
      if (force) {
        setIsUserNearBottom(true);
        setShouldAutoScroll(true);
      }
    }
  }, [shouldAutoScroll, isUserScrolling]);

  // Handle image loading completion
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
  
  // Register an image as loading
  const registerImageLoad = useCallback(() => {
    pendingImageLoadsRef.current += 1;
  }, []);

  // Handle new messages and initial scroll
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
        msg.msgs?.some(text => 
          text.includes('img') || 
          text.includes('tenorgif') || 
          text.includes('previewvideo')
        )
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

  // Use MutationObserver to detect DOM changes
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const chatbox = scrollRef.current.querySelector('#chatbox');
    if (!chatbox) return;
    
    // MutationObserver to watch for DOM changes (like images loading)
    const observer = new MutationObserver((mutations) => {
      // Look for added images
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
      
      // If we should auto-scroll and have no pending image loads, scroll immediately
      if (hasNewImages && pendingImageLoadsRef.current === 0 && shouldAutoScroll && isUserNearBottom && !isUserScrolling) {
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

  // Handle resize events with ResizeObserver
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (shouldAutoScroll && isUserNearBottom && !isUserScrolling) {
        // Delay the scroll to allow rendering to complete
        setTimeout(() => scrollToBottom(false, true), 100);
      }
    });
    
    resizeObserver.observe(scrollRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, scrollToBottom]);

  // Handle scroll events - THIS IS THE CRITICAL PART FOR AUTO-SCROLL RESUMPTION
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isUserScrolling) return;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Check if user has scrolled to near the bottom
    const isNearBottom = distanceFromBottom <= SCROLL_THRESHOLD;
    
    // Update state based on scroll position
    setIsUserNearBottom(isNearBottom);
    
    // THIS IS THE KEY CHANGE: We re-enable auto-scroll when user returns to bottom
    if (isNearBottom) {
      setShouldAutoScroll(true);
    }
    
    // Update refs for scroll position tracking
    lastScrollHeightRef.current = scrollHeight;
    lastScrollTopRef.current = scrollTop;
  }, [isUserScrolling]);

  // Handle touch start - user begins scrolling
  const handleTouchStart = useCallback(() => {
    setIsUserScrolling(true);
    
    // Clear any existing timer
    if (userScrollTimerRef.current) {
      clearTimeout(userScrollTimerRef.current);
    }
  }, []);

  // Handle touch end - user stops scrolling
  const handleTouchEnd = useCallback(() => {
    // Set a small delay before turning off user scrolling flag
    userScrollTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      
      // Check if user is now near bottom
      const isNearBottom = checkIfNearBottom();
      setIsUserNearBottom(isNearBottom);
      
      // Re-enable auto-scroll if user has scrolled to bottom
      if (isNearBottom) {
        setShouldAutoScroll(true);
        // If near bottom, give a little scroll boost to ensure at bottom
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
      
      // Check if user is now near bottom
      const isNearBottom = checkIfNearBottom();
      setIsUserNearBottom(isNearBottom);
      
      // Re-enable auto-scroll if user has scrolled to bottom
      if (isNearBottom) {
        setShouldAutoScroll(true);
      }
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

  // Message load handler
  const handleMessageLoad = useCallback(() => {
    if (shouldAutoScroll && isUserNearBottom && !isUserScrolling) {
      scrollToBottom();
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, scrollToBottom]);

  // Check if user has admin permissions
  const isAdmin = profile.isAdmin;

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
      
      {/* Admin-only debugging overlay */}
      {isAdmin && (
        <div 
          style={{
            position: 'fixed',
            bottom: '70px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Admin Debug:</div>
          <div>Auto-scroll: {shouldAutoScroll ? 'ON' : 'OFF'}</div>
          <div>Near bottom: {isUserNearBottom ? 'YES' : 'NO'}</div>
          <div>User scrolling: {isUserScrolling ? 'YES' : 'NO'}</div>
          <div>Distance: {scrollRef.current ? 
            (scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight).toFixed(0) : 'N/A'} px
          </div>
          <div>Pending images: {pendingImageLoadsRef.current}</div>
          <div>Messages: {chat.messages.length}</div>
        </div>
      )}
    </div>
  );
});

export default ChatContent;