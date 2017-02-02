import React from 'react';

export default function ChatLocked({locked, loggedIn, secondsUntilUnlock}) {
  let msg = "You must be logged in to chat!";
  if (locked && loggedIn) {
    msg = `The chat is locked for new users. You may chat in ${secondsUntilUnlock} seconds.`;
  }

  return (
    <div className="sendbox-locked">
      <span className="sendbox-locked-msg">{msg}</span>
    </div>
  );
}