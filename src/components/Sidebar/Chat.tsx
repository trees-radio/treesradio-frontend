// Update your Chat.tsx component with these changes

import React, { RefObject, useEffect } from "react";
import chat from "../../stores/chat";
import profile from "../../stores/profile";

import ChatContent from "./Chat/ChatContent";
import ChatSend from "./Chat/ChatSend";
import ChatLocked from "./Chat/ChatLocked";

interface ChatProps {
  show: boolean;
  goToChat: () => void;
  chatInputRef: RefObject<HTMLInputElement | null>;
}

const Chat: React.FC<ChatProps> = (props) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  // Add an effect to handle resize events for better layout management
  useEffect(() => {
    const handleResize = () => {
      // Force a scroll adjustment when the window resizes
      const chatScroll = document.getElementById('chatscroll');
      if (chatScroll) {
        // Small timeout to let the browser finish layout calculations
        setTimeout(() => {
          chatScroll.scrollTop = chatScroll.scrollHeight;
        }, 100);
      }
    };
    
    // Add event listener for resize
    window.addEventListener('resize', handleResize);
    
    // Add a MutationObserver to watch for chat content changes
    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
      const observer = new MutationObserver((mutations) => {
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
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div 
      id="chatcontainer" 
      className="flex flex-col flex-1 overflow-hidden" 
      style={props.show ? {} : { display: "none" }}
    >
      <ChatContent goToChat={props.goToChat} />
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