import React, { useState, useRef, useEffect } from 'react';
import { defaultAvatar, listenAvatar } from '../../../libs/avatar';
import imageWhitelist from '../../../libs/imageWhitelist';
import EMPTY_IMG from '../../../assets/img/nothing.png';
import { DataSnapshot } from '@firebase/database-types';

interface ProfilePicturePreviewProps {
  uid: string;
  username: string;
  children: React.ReactNode;
}

interface PreviewState {
  avatar?: string;
  showPreview: boolean;
  position: { x: number; y: number };
}

const ProfilePicturePreview: React.FC<ProfilePicturePreviewProps> = ({ 
  uid, 
  username, 
  children 
}) => {
  const [state, setState] = useState<PreviewState>({
    showPreview: false,
    position: { x: 0, y: 0 }
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load avatar on mount and listen for updates
  useEffect(() => {
    let isMounted = true;
    
    const loadAvatar = async () => {
      try {
        const fallback = await defaultAvatar(uid);
        
        if (isMounted) {
          setState(prev => ({ ...prev, avatar: fallback }));
          
          // Listen for avatar updates
          listenAvatar(uid, (snap: DataSnapshot, _b?: string | null) => {
            if (isMounted) {
              setState(prev => ({
                ...prev,
                avatar: snap.val() || fallback
              }));
            }
          });
        }
      } catch (error) {
        console.error('Failed to load avatar:', error);
      }
    };
    
    loadAvatar();
    
    return () => {
      isMounted = false;
    };
  }, [uid]);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set a small delay before showing preview to avoid flickering
    hoverTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Calculate position - prefer showing above the avatar
        let x = rect.left + rect.width / 2; // Center horizontally
        let y = rect.top - 10; // 10px above the avatar
        
        // Adjust if preview would go off screen
        if (previewRef.current) {
          const previewWidth = 120; // Approximate preview width
          const previewHeight = 120; // Approximate preview height
          
          // Adjust horizontal position if needed
          if (x - previewWidth / 2 < 10) {
            x = previewWidth / 2 + 10;
          } else if (x + previewWidth / 2 > viewportWidth - 10) {
            x = viewportWidth - previewWidth / 2 - 10;
          }
          
          // Adjust vertical position if needed
          if (y - previewHeight < 10) {
            y = rect.bottom + 10; // Show below if no space above
          }
        }
        
        setState(prev => ({
          ...prev,
          showPreview: true,
          position: { x, y }
        }));
      }
    }, 300); // 300ms delay
  };

  const handleMouseLeave = () => {
    // Clear timeout if mouse leaves before delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    setState(prev => ({ ...prev, showPreview: false }));
  };

  const handlePreviewMouseEnter = () => {
    // Keep preview visible when hovering over it
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handlePreviewMouseLeave = () => {
    setState(prev => ({ ...prev, showPreview: false }));
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Get the avatar URL to display
  const getAvatarUrl = (): string => {
    if (state.avatar && imageWhitelist(state.avatar)) {
      return state.avatar.replace("http:", "https:");
    }
    return EMPTY_IMG;
  };

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      
      {state.showPreview && (
        <div
          ref={previewRef}
          className="profile-picture-preview"
          style={{
            position: 'fixed',
            left: `${state.position.x}px`,
            top: `${state.position.y}px`,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
        >
          <div className="profile-preview-container">
            <img
              src={getAvatarUrl()}
              alt={`${username}'s profile picture`}
              className="profile-preview-image"
            />
            <div className="profile-preview-username">
              {username}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePicturePreview;
