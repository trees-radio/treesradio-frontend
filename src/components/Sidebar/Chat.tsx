import React, { RefObject, useEffect } from "react";
import chat from "../../stores/chat";
import profile from "../../stores/profile";

import ChatContent from "./Chat/ChatContent";
import ChatSend from "./Chat/ChatSend";
import ChatLocked from "./Chat/ChatLocked";
import ChatErrorBoundary from "./Chat/ChatErrorBoundary";

interface ChatProps {
  show: boolean;
  goToChat: () => void;
  chatInputRef: RefObject<HTMLInputElement | null>;
}

const Chat: React.FC<ChatProps> = (props) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  
  // Fix: Combine both resize handlers into a single useEffect to prevent duplicate listeners
  useEffect(() => {
    const handleResize = () => {
      // Update mobile state
      setIsMobile(window.innerWidth < 768);
      
      // Force a scroll adjustment when the window resizes
      const chatScroll = document.getElementById('chatscroll');
      if (chatScroll) {
        // Small timeout to let the browser finish layout calculations
        setTimeout(() => {
          chatScroll.scrollTop = chatScroll.scrollHeight;
        }, 100);
      }
    };
    
    // Add single resize event listener
    window.addEventListener('resize', handleResize);
    
    // Add a MutationObserver to watch for chat content changes
    const chatbox = document.getElementById('chatbox');
    let observer: MutationObserver | null = null;
    
    if (chatbox) {
      observer = new MutationObserver((mutations) => {
        let hasNewImages = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node instanceof HTMLElement) {
                const imgs = node.querySelectorAll('img');
                if (imgs.length > 0) {
                  hasNewImages = true;
                }
              }
            });
          }
        });
        
        if (hasNewImages) {
          // If new images are added, trigger layout adjustment
          handleResize();
        }
      });
      
      observer.observe(chatbox, {
        childList: true,
        subtree: true
      });
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
  
  return (
    <div
      id="chatcontainer"
      className="flex flex-col flex-1 overflow-hidden"
      style={props.show ? {} : { display: "none" }}
    >
      <ChatErrorBoundary>
        <ChatContent goToChat={props.goToChat} />
      </ChatErrorBoundary>
      <div className="flex-shrink-0 chat-input-container">
        {chat.canChat ? (
          <ChatSend myref={props.chatInputRef} isMobile={isMobile} />
        ) : (
          <ChatLocked
            locked={chat.chatLocked}
            loggedIn={profile.loggedIn}
            secondsUntilUnlock={chat.secondsUntilUnlock}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;