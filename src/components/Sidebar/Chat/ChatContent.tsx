import { useEffect, useState, useCallback, useRef } from 'react';
import { observer } from "mobx-react";
import chat from "../../../stores/chat";
import classNames from "classnames";
import { useScrollManager } from "./ScrollManager";
import MessageList from "./MessageList";

const ChatContent = observer(({ goToChat }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(null);
  const messagesLengthRef = useRef(0);
  
  // Use the scroll manager hook
  const {
    scrollRef,
    shouldAutoScroll,
    isUserScrolling,
    scrollToBottom,
    handleScroll,
    handleUserScrollStart,
    handleUserScrollEnd,
    isNearBottom
  } = useScrollManager();

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480 || window.innerHeight <= 740);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle new messages
  useEffect(() => {
    // For initial load, always scroll to bottom
    if (messagesLengthRef.current === 0 && chat.messages.length > 0) {
      scrollToBottom(false, true);
    }
    
    // Auto-scroll for new messages if conditions are met
    if (chat.messages.length > messagesLengthRef.current) {
      if (!isUserScrolling && shouldAutoScroll && isNearBottom()) {
        scrollToBottom(false, false);
      }
    }
    
    messagesLengthRef.current = chat.messages.length;
  }, [chat.messages, scrollToBottom, shouldAutoScroll, isUserScrolling, isNearBottom]);

  // Message loading handler (simplified)
  const handleMessageLoad = useCallback(() => {
    if (shouldAutoScroll && isNearBottom() && !isUserScrolling) {
      scrollToBottom(false, false);
    }
  }, [shouldAutoScroll, isNearBottom, isUserScrolling, scrollToBottom]);

  // Message editing handlers
  const handleEditMessage = useCallback((messageKey: string) => {
    setEditingMessageKey(messageKey);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setEditingMessageKey(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageKey(null);
  }, []);

  // Username click handler
  const handleUsernameClick = useCallback((username: string) => {
    chat.appendMsg("@" + username + " ");
    goToChat();
  }, [goToChat]);

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
      onTouchStart={handleUserScrollStart}
      onTouchEnd={handleUserScrollEnd}
      onMouseDown={handleUserScrollStart}
      onMouseUp={handleUserScrollEnd}
      onWheel={handleUserScrollStart}
    >
      <MessageList
        messages={chat.messages}
        editingMessageKey={editingMessageKey}
        isMobile={isMobile}
        onEditMessage={handleEditMessage}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onMessageLoad={handleMessageLoad}
        onUsernameClick={handleUsernameClick}
      />
      
      {chat.showDebug && (
        <div className="debug-info">
          <div>Messages: {chat.messages.length}</div>
          <div>Auto-scroll: {shouldAutoScroll ? 'ON' : 'OFF'}</div>
          <div>User scrolling: {isUserScrolling ? 'YES' : 'NO'}</div>
          <div>Near bottom: {isNearBottom() ? 'YES' : 'NO'}</div>
        </div>
      )}
    </div>
  );
});

export default ChatContent;