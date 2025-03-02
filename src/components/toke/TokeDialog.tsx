// src/components/TokeDialogtsx
import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { observer } from 'mobx-react-lite';
import tokeStore from '../../stores/toke';
import { XMarkIcon, UserPlusIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

// Check if it's 4/20
const is420 = () => {
  const now = new Date();
  return now.getMonth() === 3 && now.getDate() === 20; // April is month 3 (zero-indexed)
};

const TokeDialog: React.FC = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const tokeData = tokeStore.displayData;
  const [is420Day] = useState(is420());

  // Dragging state
  const dialogRef = useRef<HTMLDivElement>(null);
  const minimizedRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Default position

  // Open dialog when toke becomes active, close when inactive
  useEffect(() => {
    setIsOpen(tokeData.isActive);
  }, [tokeData.isActive]);

  // If the dialog is dismissed, show a minimized version
  const [minimized, setMinimized] = useState(false);

  // Animation frames for the special 420 effect (smoke puffs)
  const [showSmoke, setShowSmoke] = useState(false);

  useEffect(() => {
    if (is420Day && tokeData.isActive) {
      const smokeInterval = setInterval(() => {
        setShowSmoke(true);
        setTimeout(() => setShowSmoke(false), 2000);
      }, 10000);

      return () => clearInterval(smokeInterval);
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

  if (!tokeData.isActive && !isOpen) {
    return null;
  }

  const handleJoin = () => {
    tokeStore.joinToke();
  };

  const handleJoinMultiple = () => {
    // Join for all remaining sessions
    tokeStore.joinTokeMultiple(tokeData.totalSessions);
  };

  const handleCancel = () => {
    tokeStore.cancelToke();
  };

  // Minimized version that appears when the dialog is collapsed
  if (minimized) {
    return (
      <div
        ref={minimizedRef}
        className={`minimizedToke ${is420Day ? "minimizedToke420" : ''}`}
        onClick={() => setMinimized(false)}
        onMouseDown={handleMouseDown}
        draggable
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {is420Day ? (
          <FireIcon className="h-5 w-5 mr-1 text-orange-500" />
        ) : (
          <ClockIcon className="h-5 w-5 mr-1" />
        )}
        <span>{tokeData.formattedTimeRemaining}</span>
      </div>
    );
  }
  return (
    <Dialog
      open={isOpen}
      onClose={() => setMinimized(true)}
      className="fixed inset-0 z-50 overflow-y-auto pointer-events-none"
      draggable
    >
      <div
        ref={dialogRef}
        className="tokeDialogContainer"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          position: 'fixed',
          pointerEvents: 'auto'
        }}
      >
        {showSmoke && is420Day && (
          <div className="smokeEffect">
            <div className="smokeParticle1"></div>
            <div className="smokeParticle2"></div>
            <div className="smokeParticle3"></div>
          </div>
        )}

        <DialogPanel className={`dialogPanel ${is420Day ? "dialogPanel420" : ''}`}>
          <div
            className="dialogHeader"
            onMouseDown={handleMouseDown}
          >
            <DialogTitle className={`text-lg font-medium ${is420Day ? 'text-green-400' : 'text-gray-200'}`}>
              {is420Day ? '🔥 420 Toke Session 🔥' : 'Toke Session'}
            </DialogTitle>
            <button
              onClick={() => setMinimized(true)}
              className="rounded-md p-1 text-gray-400 hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="progressBar">
            <div
              className={`progressFill ${is420Day ? "progressFill420" : ''}`}
              style={{ width: `${tokeData.percentRemaining}%` }}
            ></div>
          </div>

          <div className="mt-2 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Time Remaining:</span>
              <span className={`font-medium ${is420Day ? 'text-green-400' : 'text-orange-400'}`}>
                {tokeData.formattedTimeRemaining}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Session:</span>
              <span className={`font-medium ${is420Day ? 'text-green-400' : 'text-orange-400'}`}>
                {tokeData.currentSession} of {tokeData.totalSessions}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Initiated by:</span>
              <span className={`font-medium ${is420Day ? 'text-green-400' : 'text-orange-400'}`}>
                {tokeData.initiator}
              </span>
            </div>

            {tokeData.participants.length > 0 && (
              <div>
                <span className="text-sm text-gray-400 block mb-1">Participants:</span>
                <div className="flex flex-wrap gap-2">
                  {tokeData.participants.map((participant, index) => (
                    <div
                      key={index}
                      className={`participantTag ${is420Day ? "participantTag420" : ''}`}
                    >
                      {participant.username} ({participant.times}x)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {tokeData.notifications && (
              <div>
                <span className="text-sm text-gray-400 block mb-1">Notifications:</span>
                <ul className="text-sm max-h-48 overflow-y-scroll">
                  {tokeData.notifications.map((notification, index) => (
                    <li key={index}>{notification}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>


          {/* Join/Cancel buttons */}

          <div className="mt-4 flex justify-between space-x-2">
            <div className="flex space-x-2">
              <button
                type="button"
                className={`joinButton ${is420Day ? "joinButton420" : ''}`}
                onClick={handleJoin}
              >
                <UserPlusIcon className="h-4 w-4 mr-1" />
                Join
              </button>

              {tokeData.totalSessions > 1 && (
                <button
                  type="button"
                  className={`joinButton ${is420Day ? "joinButton420" : ''}`}
                  onClick={handleJoinMultiple}
                >
                  Join All ({tokeData.totalSessions}x)
                </button>
              )}
            </div>

            {/* Only show cancel for moderators or the initiator */}
            <button
              type="button"
              className="cancelButton"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
});

export default TokeDialog;