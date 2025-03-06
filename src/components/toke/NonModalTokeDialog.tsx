import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import tokeStore from '../../stores/toke';
import { XMarkIcon, UserPlusIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import profile from '../../stores/profile';
import cn from 'classnames';

// Check if it's 4/20
const is420 = () => {
  const now = new Date();
  return now.getMonth() === 3 && now.getDate() === 20; // April is month 3 (zero-indexed)
};

const NonModalTokeDialog: React.FC = observer(() => {
  const tokeData = tokeStore.displayData;
  const [is420Day] = useState(is420());
  const [minimized, setMinimized] = useState(profile.minimizedTokeDefault);
  const [visible, setVisible] = useState(false);
  
  // Dragging state
  const dialogRef = useRef<HTMLDivElement>(null);
  const minimizedRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Default position

  // Enhanced smoke effect states
  const [showSmoke, setShowSmoke] = useState(false);
  const [showFullScreenSmoke, setShowFullScreenSmoke] = useState(false);
  const [smokeIntensity, setSmokeIntensity] = useState(0);
  
  // Show dialog when toke becomes active, hide when inactive
  useEffect(() => {
    setVisible(tokeData.isActive);
    
    // Set minimized state based on user preference when a new toke session starts
    if (tokeData.isActive) {
      setMinimized(profile.minimizedTokeDefault);
    }
  }, [tokeData.isActive]);

  // Enhanced smoke effect
  useEffect(() => {
    if (is420Day && tokeData.isActive) {
      // Small smoke puffs from the dialog
      const smallSmokeInterval = setInterval(() => {
        setShowSmoke(true);
        setTimeout(() => setShowSmoke(false), 4000);
      }, 8000);
      
      // Full screen smoke effect
      const fullScreenSmokeInterval = setInterval(() => {
        if (Math.random() > 0.5) { // 50% chance to show full screen effect
          setShowFullScreenSmoke(true);
          
          // Random smoke intensity (1-5)
          const intensity = Math.floor(Math.random() * 5) + 1;
          setSmokeIntensity(intensity);
          
          // Hide the smoke effect after 6 seconds
          setTimeout(() => {
            setShowFullScreenSmoke(false);
          }, 6000);
        }
      }, 30000); // Try every 30 seconds

      return () => {
        clearInterval(smallSmokeInterval);
        clearInterval(fullScreenSmokeInterval);
      };
    }
  }, [is420Day, tokeData.isActive]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button

    setIsDragging(true);

    // Store the initial mouse position and dialog position
    const dragStartX = e.clientX;
    const dragStartY = e.clientY;
    const initialX = position.x;
    const initialY = position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartX;
      const dy = moveEvent.clientY - dragStartY;

      setPosition({
        x: initialX + dx,
        y: initialY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!tokeData.isActive && !visible) {
    return null;
  }

  const handleJoin = () => {
    tokeStore.joinToke();
    
    // Trigger smoke when joining
    if (is420Day) {
      setShowFullScreenSmoke(true);
      setSmokeIntensity(3);
      setTimeout(() => {
        setShowFullScreenSmoke(false);
      }, 6000);
    }
  };

  const handleJoinMultiple = () => {
    // Join for all remaining sessions
    tokeStore.joinTokeMultiple(tokeData.totalSessions);
    
    // Trigger intense smoke when joining multiple
    if (is420Day) {
      setShowFullScreenSmoke(true);
      setSmokeIntensity(5); // Maximum intensity
      setTimeout(() => {
        setShowFullScreenSmoke(false);
      }, 8000); // Longer duration for multiple joins
    }
  };

  const handleCancel = () => {
    tokeStore.cancelToke();
  };

  // Generate the appropriate number of smoke divs based on intensity
  const generateSmokeClouds = () => {
    const clouds = [];
    const totalClouds = smokeIntensity * 5; // 5, 10, 15, 20, or 25 clouds
    
    for (let i = 0; i < totalClouds; i++) {
      // Random positions and sizes
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 80 + Math.random() * 200; // Between 80px and 280px
      const delay = Math.random() * 2; // Random delay up to 2s
      
      clouds.push(
        <div 
          key={i}
          className="absolute rounded-full bg-white/30 blur-xl animate-smoke-cloud"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            opacity: 0
          }}
        />
      );
    }
    
    return clouds;
  };

  // Minimized version that appears when the dialog is collapsed
  if (minimized) {
    return (
      <div
        ref={minimizedRef}
        className={cn(
          "fixed flex items-center py-1.5 px-3 rounded-full shadow-md z-40 select-none transition-transform hover:scale-105",
          is420Day ? "bg-gradient-to-r from-green-500 to-teal-600" : "bg-gray-800",
          "text-gray-100 text-sm"
        )}
        onClick={() => setMinimized(false)}
        onMouseDown={handleMouseDown}
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {is420Day ? (
          <FireIcon className="w-5 h-5 mr-1 text-orange-500" />
        ) : (
          <ClockIcon className="w-5 h-5 mr-1" />
        )}
        <span>{tokeData.formattedTimeRemaining}</span>
        
        {/* Small smoke from the minimized icon */}
        {showSmoke && is420Day && (
          <div className="absolute right-0 z-30 -top-5">
            <div className="absolute w-3 h-3 rounded-full bg-white/60 blur-md left-1.5 animate-smoke-1"></div>
            <div className="absolute left-0 w-3 h-3 rounded-full bg-white/60 blur-md animate-smoke-2"></div>
            <div className="absolute w-3 h-3 rounded-full bg-white/60 blur-md -left-1.5 animate-smoke-3"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Full screen smoke overlay */}
      {showFullScreenSmoke && is420Day && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          {generateSmokeClouds()}
        </div>
      )}
    
      <div
        ref={dialogRef}
        className="fixed z-50 select-none"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          maxWidth: '320px',
          width: '100%'
        }}
      >
        {/* Enhanced dialog smoke effect */}
        {showSmoke && is420Day && (
          <div className="absolute right-0 z-30 -top-8">
            {/* Multiple smoke particles with different animations */}
            <div className="absolute w-4 h-4 rounded-full bg-white/60 blur-md left-1.5 animate-smoke-1"></div>
            <div className="absolute left-0 w-4 h-4 rounded-full bg-white/60 blur-md animate-smoke-2"></div>
            <div className="absolute w-4 h-4 rounded-full bg-white/60 blur-md -left-1.5 animate-smoke-3"></div>
            <div className="absolute w-4 h-4 delay-500 rounded-full bg-white/60 blur-md -left-2 animate-smoke-1"></div>
            <div className="absolute w-4 h-4 delay-700 rounded-full bg-white/60 blur-md left-2 animate-smoke-2"></div>
            
            {/* Additional larger smoke particles */}
            <div className="absolute w-6 h-6 delay-300 rounded-full bg-white/30 blur-xl left-1 animate-smoke-1"></div>
            <div className="absolute w-6 h-6 delay-200 rounded-full bg-white/30 blur-xl -left-1 animate-smoke-3"></div>
          </div>
        )}

        <div className={cn(
          "rounded-lg shadow-xl overflow-hidden",
          is420Day ? "bg-gradient-to-br from-emerald-900 to-gray-900" : "bg-gray-800",
          "text-gray-100"
        )}>
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-grab"
            onMouseDown={handleMouseDown}
          >
            <div className={cn(
              "text-lg font-medium",
              is420Day ? "text-green-400" : "text-gray-200"
            )}>
              {is420Day ? '🔥 420 Toke Session 🔥' : 'Toke Session'}
            </div>
            <button
              onClick={() => setMinimized(true)}
              className="p-1 text-gray-400 rounded-md hover:text-gray-200"
            >
              <XMarkIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/10">
            <div
              className={cn(
                "h-full transition-width duration-1000 ease-linear",
                is420Day ? "bg-green-500" : "bg-orange-500"
              )}
              style={{ width: `${tokeData.percentRemaining}%` }}
            ></div>
          </div>

          <div className="p-4">
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Time Remaining:</span>
                <span className={cn(
                  "font-medium",
                  is420Day ? "text-green-400" : "text-orange-400"
                )}>
                  {tokeData.formattedTimeRemaining}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Toke:</span>
                <span className={cn(
                  "font-medium",
                  is420Day ? "text-green-400" : "text-orange-400"
                )}>
                  {tokeData.currentSession} of {tokeData.totalSessions}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Initiated by:</span>
                <span className={cn(
                  "font-medium",
                  is420Day ? "text-green-400" : "text-orange-400"
                )}>
                  {tokeData.initiator}
                </span>
              </div>

              {tokeData.participants.length > 0 && (
                <div>
                  <span className="block mb-1 text-sm text-gray-400">Participants:</span>
                  <div className="flex flex-wrap gap-2">
                    {tokeData.participants.map((participant, index) => (
                      <div
                        key={index}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs",
                          is420Day ? "bg-green-500/20" : "bg-orange-500/20"
                        )}
                      >
                        {participant.username} ({participant.times}x)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {tokeData.notifications && tokeData.notifications.length > 0 && (
                <div>
                  <span className="block mb-1 text-sm text-gray-400">Notifications:</span>
                  <ul className="overflow-y-auto text-sm max-h-48">
                    {tokeData.notifications.map((notification, index) => (
                      <li key={index}>{notification}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Join/Cancel buttons */}
            <div className="flex justify-between mt-4 space-x-2">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1.5 rounded flex items-center text-sm text-white",
                    is420Day ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"
                  )}
                  onClick={handleJoin}
                >
                  <UserPlusIcon className="w-4 h-4 mr-1" />
                  Join
                </button>

                {tokeData.totalSessions > 1 && (
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded text-sm text-white",
                      is420Day ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"
                    )}
                    onClick={handleJoinMultiple}
                  >
                    Join All ({tokeData.totalSessions}x)
                  </button>
                )}
              </div>

              {/* Only show cancel for moderators or the initiator */}
              <button
                type="button"
                className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm text-white"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default NonModalTokeDialog;