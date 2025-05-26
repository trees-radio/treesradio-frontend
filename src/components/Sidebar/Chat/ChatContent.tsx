import { useEffect, useRef, useState, useCallback } from 'react';
import { observer } from "mobx-react";
import chat, { ChatMessage } from "../../../stores/chat";
import profile from "../../../stores/profile";
import classNames from "classnames";
import moment from "moment";
import Message from "./Message";
import UserName from "../../utility/User/UserName";
import UserAvatar from "../../utility/User/UserAvatar";

// Increased scroll threshold to give users more room before auto-scrolling
const SCROLL_THRESHOLD = 250;
// Higher threshold for detecting when user is intentionally reading older messages
const READING_THRESHOLD = 800;
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
  const userScrollTimerRef = useRef<NodeJS.Timeout | NodeJS.Timer | null>(null);
  const pendingImageLoadsRef = useRef(0);
  const imageLoadTimerRef = useRef<NodeJS.Timeout | NodeJS.Timer | null>(null);
  const userInteractionStartTimeRef = useRef(0);
  
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
  
  // Scroll to bottom function with improved user intent detection
  const scrollToBottom = useCallback((smooth = false, force = false) => {
    if (!scrollRef.current) return;
    
    // Don't auto-scroll if:
    // 1. User is actively scrolling
    // 2. User is actively reading older messages
    // 3. User has interacted with the scroll within the last 2 seconds
    // Unless we're forcing a scroll (initial load or explicit user action)
    const userHasRecentlyInteracted = (Date.now() - userInteractionStartTimeRef.current) < 2000;
    
    if ((isUserScrolling || isUserActivelyReading || userHasRecentlyInteracted) && !force) {
      return;
    }
    
    // Only scroll if appropriate conditions are met
    if (force || (shouldAutoScroll && !isUserScrolling)) {
      const scrollElement = scrollRef.current;
      
      // Delay scrolling slightly to ensure images are rendered
      setTimeout(() => {
        // Check again if user has started interacting during this timeout
        if (!force && isUserScrolling) {
          return;
        }
        
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
        
        lastScrollHeightRef.current = scrollElement.scrollHeight;
        lastScrollTopRef.current = scrollElement.scrollTop;
        
        if (force) {
          setIsUserNearBottom(true);
          setShouldAutoScroll(true);
          setIsUserActivelyReading(false);
        }
      }, 10); // Small delay to let layout settle
    }
  }, [shouldAutoScroll, isUserScrolling, isUserActivelyReading]);

  // Layout change handler for image loading and content updates
  useEffect(() => {
    // Create a ResizeObserver to detect content changes, including images loading
    if (scrollRef.current) {
      const chatbox = scrollRef.current.querySelector('#chatbox');
      if (chatbox) {
        const resizeObserver = new ResizeObserver(() => {
          if (shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
            // Only auto-scroll if the user was already near the bottom
            const isNearBottom = checkIfNearBottom();
            if (isNearBottom) {
              scrollToBottom(false, false);
            }
          }
        });
        
        resizeObserver.observe(chatbox);
        
        return () => {
          resizeObserver.disconnect();
        };
      }
    }
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, scrollToBottom, checkIfNearBottom]);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    pendingImageLoadsRef.current -= 1;
    
    if (imageLoadTimerRef.current) {
      clearTimeout(imageLoadTimerRef.current);
    }
    
    if (pendingImageLoadsRef.current <= 0) {
      imageLoadTimerRef.current = setTimeout(() => {
        // Check if user is near the bottom before scrolling
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
    // For initial load, always scroll to bottom
    if (messagesLengthRef.current === 0 && chat.messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom(false, true));
    }
    
    if (chat.messages.length > messagesLengthRef.current) {
      // CRITICAL: Never auto-scroll during active user scrolling
      if (isUserScrolling) {
        messagesLengthRef.current = chat.messages.length;
        return;
      }
      
      // Never scroll if user is actively reading prior messages
      if (isUserActivelyReading) {
        messagesLengthRef.current = chat.messages.length;
        return;
      }
      
      // Check if user had recent interaction (within 2 seconds)
      const userHasRecentlyInteracted = (Date.now() - userInteractionStartTimeRef.current) < 2000;
      if (userHasRecentlyInteracted) {
        messagesLengthRef.current = chat.messages.length;
        return;
      }
      
      // For all messages, only scroll if the user is near the bottom and has auto-scroll enabled
      if (shouldAutoScroll && isUserNearBottom) {
        // Use a single timeout for simpler logic and more consistent behavior
        setTimeout(() => scrollToBottom(false, false), 50);
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
      
      // For image loading, only auto-scroll if appropriate
      if (hasNewImages && pendingImageLoadsRef.current === 0 && 
          shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
        // Check if user is still near bottom
        const isNearBottom = checkIfNearBottom();
        if (isNearBottom) {
          setTimeout(() => scrollToBottom(false, false), 50);
        }
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
  }, [scrollToBottom, shouldAutoScroll, isUserNearBottom, isUserScrolling, 
      isUserActivelyReading, handleImageLoad, registerImageLoad, checkIfNearBottom]);

  // Handle resize events
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // On window resize, only scroll if user is near bottom and not actively interacting
      if (shouldAutoScroll && isUserNearBottom && !isUserScrolling && !isUserActivelyReading) {
        const delay = isMobile ? 200 : 100;
        setTimeout(() => {
          // Verify user is still near bottom before scrolling
          const isStillNearBottom = checkIfNearBottom();
          if (isStillNearBottom) {
            scrollToBottom(false, false);
          }
        }, delay);
      }
    });
    
    resizeObserver.observe(scrollRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldAutoScroll, isUserNearBottom, isUserScrolling, isUserActivelyReading, scrollToBottom, isMobile, checkIfNearBottom]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isUserScrolling) return;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Check if content changed (scrollHeight increased)
    const contentAdded = scrollHeight > lastScrollHeightRef.current;
    
    // Check if we were at the bottom before content was added
    const wasAtBottom = lastScrollHeightRef.current > 0 && 
                       (lastScrollTopRef.current + clientHeight + SCROLL_THRESHOLD >= lastScrollHeightRef.current);
    
    const isNearBottom = distanceFromBottom <= SCROLL_THRESHOLD;
    const isReading = distanceFromBottom > READING_THRESHOLD;
    
    setIsUserNearBottom(isNearBottom);
    setIsUserActivelyReading(isReading);
    
    // Handle auto-scroll settings based on user position
    if (contentAdded) {
      // Only maintain auto-scroll if user was already at bottom and is not reading
      if (!wasAtBottom || isReading) {
        setShouldAutoScroll(false);
      }
    } else {
      // Normal scrolling behavior - only re-enable auto-scroll when user is near bottom
      if (isNearBottom) {
        setShouldAutoScroll(true);
      } else if (isReading) {
        setShouldAutoScroll(false);
      }
    }
    
    lastScrollHeightRef.current = scrollHeight;
    lastScrollTopRef.current = scrollTop;
  }, [isUserScrolling]);

  // Touch event handlers
  const handleTouchStart = useCallback(() => {
    setIsUserScrolling(true);
    userInteractionStartTimeRef.current = Date.now();
    
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
      
      // Only re-enable auto-scroll if user explicitly returned to bottom
      if (isNearBottom) {
        setShouldAutoScroll(true);
        scrollToBottom(true);
      }
    }, 300);
  }, [checkIfNearBottom, checkIfActivelyReading, scrollToBottom]);
  
  // Mouse wheel handler
  const handleWheel = useCallback(() => {
    setIsUserScrolling(true);
    userInteractionStartTimeRef.current = Date.now();
    
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
              "blazebot-msg": msg.username === "BlazeBot",
              "blazebot-hide": profile.hideBlazeBot && msg.username === "BlazeBot"
            }
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
          <div>Last interaction: {((Date.now() - userInteractionStartTimeRef.current) / 1000).toFixed(1)}s ago</div>
        </div>
      )}
    </div>
  );
});

export default ChatContent;