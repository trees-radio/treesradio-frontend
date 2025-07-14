import React, { useRef, useState, useCallback, useEffect } from 'react';

interface ScrollManagerProps {
  children: React.ReactNode;
  onScroll?: () => void;
  className?: string;
  id?: string;
}

const SCROLL_THRESHOLD = 100;

export const useScrollManager = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<any>(null);

  // Check if user is near bottom of chat
  const isNearBottom = useCallback(() => {
    if (!scrollRef.current) return true;
    
    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    return distanceFromBottom <= SCROLL_THRESHOLD;
  }, []);

  // Simplified scroll to bottom function
  const scrollToBottom = useCallback((smooth = false, force = false) => {
    if (!scrollRef.current) return;
    
    // Don't auto-scroll if user is manually scrolling (unless forced)
    if (isUserScrolling && !force) return;
    
    // Only scroll if auto-scroll is enabled or forced
    if (force || shouldAutoScroll) {
      const scrollElement = scrollRef.current;
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Debounced scroll to prevent excessive calls
      scrollTimeoutRef.current = setTimeout(() => {
        if (!force && isUserScrolling) return;
        
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
        
        if (force) {
          setShouldAutoScroll(true);
        }
      }, force ? 0 : 50);
    }
  }, [shouldAutoScroll, isUserScrolling]);

  // Simplified scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isUserScrolling) return;
    
    const nearBottom = isNearBottom();
    setShouldAutoScroll(nearBottom);
  }, [isUserScrolling, isNearBottom]);

  // User interaction handlers
  const handleUserScrollStart = useCallback(() => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleUserScrollEnd = useCallback(() => {
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      const nearBottom = isNearBottom();
      setShouldAutoScroll(nearBottom);
      
      if (nearBottom) {
        scrollToBottom(true);
      }
    }, 150);
  }, [isNearBottom, scrollToBottom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollRef,
    shouldAutoScroll,
    isUserScrolling,
    scrollToBottom,
    handleScroll,
    handleUserScrollStart,
    handleUserScrollEnd,
    isNearBottom
  };
};

const ScrollManager: React.FC<ScrollManagerProps> = ({ 
  children, 
  onScroll, 
  className, 
  id 
}) => {
  const {
    scrollRef,
    handleScroll,
    handleUserScrollStart,
    handleUserScrollEnd
  } = useScrollManager();

  const combinedScrollHandler = useCallback(() => {
    handleScroll();
    onScroll?.();
  }, [handleScroll, onScroll]);

  return (
    <div 
      id={id}
      ref={scrollRef}
      className={className}
      onScroll={combinedScrollHandler}
      onTouchStart={handleUserScrollStart}
      onTouchEnd={handleUserScrollEnd}
      onMouseDown={handleUserScrollStart}
      onMouseUp={handleUserScrollEnd}
      onWheel={handleUserScrollStart}
    >
      {children}
    </div>
  );
};

export default ScrollManager;