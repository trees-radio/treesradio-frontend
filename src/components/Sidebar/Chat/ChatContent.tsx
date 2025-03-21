import { useEffect, useRef, useState, useCallback } from 'react';
import { observer } from "mobx-react";
import chat, { ChatMessage } from "../../../stores/chat";
import profile from "../../../stores/profile";
import classNames from "classnames";
import moment from "moment";
import Message from "./Message";
import UserName from "../../utility/User/UserName";
import UserAvatar from "../../utility/User/UserAvatar";

// Increased scroll threshold to give users more room to scroll up
const SCROLL_THRESHOLD = 300;
// Higher threshold for detecting active reading
const READING_THRESHOLD = 800;
// Delay between auto-scrolls to avoid multiple scrolls
const SCROLL_DEBOUNCE = 500;
const IMAGE_LOAD_DELAY = 500;

const ChatContent = observer(({ goToChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [isUserActivelyReading, setIsUserActivelyReading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const messagesLengthRef = useRef(0);
  const userScrollTimerRef = useRef<NodeJS.Timeout | Timer | null>(null);
  const pendingImageLoadsRef = useRef(0);
  const imageLoadTimerRef = useRef<NodeJS.Timeout | Timer | null>(null);
  const scrollDebounceTimerRef = useRef<NodeJS.Timeout | Timer | null>(null);
  const lastAutoScrollTimeRef = useRef(0);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480 || window.innerHeight <= 740);
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  
  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    if (!scrollRef.current) return false;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    return distanceFromBottom <= SCROLL_THRESHOLD;
  }, []);
  
  // Check if user is actively reading previous messages
  const checkIfActivelyReading = useCallback(() => {
    if (!scrollRef.current) return false;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // If user has scrolled up significantly, consider them as actively reading
    return distanceFromBottom > READING_THRESHOLD;
  }, []);
  
  // Scroll to bottom function with debouncing and respect for user reading
  const scrollToBottom = useCallback((smooth = false, force = false) => {
    if (!scrollRef.current) return;
    
    const now = Date.now();
    const timeSinceLastScroll = now - lastAutoScrollTimeRef.current;
    
    // Debounce scroll events to prevent rapid-fire scrolling
    if (timeSinceLastScroll < SCROLL_DEBOUNCE && !force) {
      // If we're already planning to scroll, don't schedule another one
      if (scrollDebounceTimerRef.current) return;
      
      // Schedule a scroll after debounce period
      scrollDebounceTimerRef.current = setTimeout(() => {
        scrollToBottom(smooth, force);
        scrollDebounceTimerRef.current = null;
      }, SCROLL_DEBOUNCE - timeSinceLastScroll);
      
      return;
    }
    
    // Don't auto-scroll if user is actively reading, unless forced
    if (isUserActivelyReading && !force) {
      return;
    }
    
    // Only scroll if appropriate conditions are met
    if (force || (shouldAutoScroll && !isUserScrolling)) {
      const scrollElement = scrollRef.current;
      
      // Delay scrolling slightly to ensure images are rendered
      setTimeout(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
        
        lastScrollHeightRef.current = scrollElement.scrollHeight;
        lastScrollTopRef.current = scrollElement.scrollTop;
        lastAutoScrollTimeRef.current = Date.now();
        
        if (force) {
          setIsUserNearBottom(true);
          setShouldAutoScroll(true);
          setIsUserActivelyReading(false);
        }
      }, 10); // Small delay to let layout settle
    }
  }, [shouldAutoScroll, isUserScrolling, isUserActivelyReading]);

  useEffect(() => {
    // This effect handles layout changes caused by image loading
    const handleResize = () => {
      if (shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
        scrollToBottom(false, false);
      }
    };
    
    // Create a ResizeObserver to detect content changes, including images loading
    if (scrollRef.current) {
      const chatbox = scrollRef.current.querySelector('#chatbox');
      if (chatbox) {
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chatbox);
        
        return () => {
          resizeObserver.disconnect();
        };
      }
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, scrollToBottom]);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    pendingImageLoadsRef.current -= 1;
    
    if (imageLoadTimerRef.current) {
      clearTimeout(imageLoadTimerRef.current);
    }
    
    if (pendingImageLoadsRef.current <= 0) {
      imageLoadTimerRef.current = setTimeout(() => {
        if (shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
          scrollToBottom(true, false);
        }
        pendingImageLoadsRef.current = 0;
      }, IMAGE_LOAD_DELAY);
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, scrollToBottom]);
  
  const registerImageLoad = useCallback(() => {
    pendingImageLoadsRef.current += 1;
  }, []);

  // Handle new messages
  useEffect(() => {
    if (messagesLengthRef.current === 0 && chat.messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom(false, true));
    }
    
    if (chat.messages.length > messagesLengthRef.current) {
      const newMessages = chat.messages.slice(messagesLengthRef.current);
      const hasBotMessage = newMessages.some(msg => msg.username === "BlazeBot");
      const hasImages = newMessages.some(msg => 
        msg.msgs?.some(text => 
          text.includes('img') || 
          text.includes('tenorgif') || 
          text.includes('previewvideo')
        )
      );
      
      // For important messages (bot messages or those with media), scroll more aggressively
      if (hasBotMessage || hasImages) {
        // Only force scroll if user is near bottom or it's a new session
        if (isUserNearBottom || chat.messages.length <= 5) {
          setTimeout(() => scrollToBottom(false, true), 50);
          setTimeout(() => scrollToBottom(false, false), 300);
        }
      } else if (shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
        // For regular messages, only scroll if user is near bottom and not actively reading
        setTimeout(() => scrollToBottom(false), 50);
      }
    }
    
    messagesLengthRef.current = chat.messages.length;
  }, [chat.messages, scrollToBottom, shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, isMobile]);

  // Use MutationObserver for DOM changes
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const chatbox = scrollRef.current.querySelector('#chatbox');
    if (!chatbox) return;
    
    const observer = new MutationObserver((mutations) => {
      let hasNewImages = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              const imgs = node.querySelectorAll('img');
              if (imgs.length > 0) {
                hasNewImages = true;
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
      
      if (hasNewImages && pendingImageLoadsRef.current === 0 && 
          shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
        setTimeout(() => scrollToBottom(false, false), 50);
      }
    });
    
    observer.observe(chatbox, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['src'] 
    });
    
    return () => {
      observer.disconnect();
      if (imageLoadTimerRef.current) {
        clearTimeout(imageLoadTimerRef.current);
      }
    };
  }, [scrollToBottom, shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, handleImageLoad, registerImageLoad]);

  // Handle resize events
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
        // Use longer delay on mobile for layout to stabilize
        const delay = isMobile ? 200 : 100;
        setTimeout(() => scrollToBottom(false, false), delay);
      }
    });
    
    resizeObserver.observe(scrollRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, scrollToBottom, isMobile]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isUserScrolling) return;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    const isNearBottom = distanceFromBottom <= SCROLL_THRESHOLD;
    const isReading = distanceFromBottom > READING_THRESHOLD;
    
    setIsUserNearBottom(isNearBottom);
    setIsUserActivelyReading(isReading);
    
    // Re-enable auto-scroll only when user returns to bottom
    // This prevents accidentally toggling auto-scroll when scrolling through chat
    if (isNearBottom) {
      setShouldAutoScroll(true);
    } else if (isReading) {
      // Only disable auto-scroll when user has scrolled significantly up
      setShouldAutoScroll(false);
    }
    
    lastScrollHeightRef.current = scrollHeight;
    lastScrollTopRef.current = scrollTop;
  }, [isUserScrolling]);

  // Touch event handlers
  const handleTouchStart = useCallback(() => {
    setIsUserScrolling(true);
    
    if (userScrollTimerRef.current) {
      clearTimeout(userScrollTimerRef.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    userScrollTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      
      const isNearBottom = checkIfNearBottom();
      const isReading = checkIfActivelyReading();
      
      setIsUserNearBottom(isNearBottom);
      setIsUserActivelyReading(isReading);
      
      // Only re-enable auto-scroll if user is at the bottom
      if (isNearBottom) {
        setShouldAutoScroll(true);
        scrollToBottom(true);
      }
    }, 300);
  }, [checkIfNearBottom, checkIfActivelyReading, scrollToBottom]);
  
  // Mouse wheel handler
  const handleWheel = useCallback(() => {
    setIsUserScrolling(true);
    
    if (userScrollTimerRef.current) {
      clearTimeout(userScrollTimerRef.current);
    }
    
    userScrollTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      
      const isNearBottom = checkIfNearBottom();
      const isReading = checkIfActivelyReading();
      
      setIsUserNearBottom(isNearBottom);
      setIsUserActivelyReading(isReading);
      
      // Only re-enable auto-scroll if user is at the bottom
      if (isNearBottom) {
        setShouldAutoScroll(true);
      }
    }, 300);
  }, [checkIfNearBottom, checkIfActivelyReading]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (userScrollTimerRef.current) {
        clearTimeout(userScrollTimerRef.current);
      }
      if (imageLoadTimerRef.current) {
        clearTimeout(imageLoadTimerRef.current);
      }
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }
    };
  }, []);

  const handleMessageLoad = useCallback(() => {
    if (shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
      scrollToBottom();
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, scrollToBottom]);

  // Check if user has admin permissions
  const isAdmin = profile.isAdmin;

  // Mobile-specific classes
  const chatScrollClass = classNames(
    "md:h-[85vh] h-[31em] overflow-y-auto",
    { "mobile-chat-scroll": isMobile }
  );

  return (
    <div 
      id="chatscroll"
      ref={scrollRef}
      className={chatScrollClass}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <ul id="chatbox" className={isMobile ? "p-4 pb-20" : "p-4"}>
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
            <li key={`${msg.key}+${i}`} className={chatLineClasses}>
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
                      key={`${msg.key}-${j}`}
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
      {isAdmin && chat.showDebug && (
        <div 
          style={{
            position: 'fixed',
            top: isMobile ? '10vh' : '15vh',
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
          <div>Mobile view: {isMobile ? 'YES' : 'NO'}</div>
          <div>Auto-scroll: {shouldAutoScroll ? 'ON' : 'OFF'}</div>
          <div>Near bottom: {isUserNearBottom ? 'YES' : 'NO'}</div>
          <div>Reading mode: {isUserActivelyReading ? 'YES' : 'NO'}</div>
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