import React from "react";

export default function ChatLocked({locked, loggedIn, secondsUntilUnlock}) {
  if (locked && loggedIn) {
    return (
      <div className="sendbox-locked">
        <span className="sendbox-locked-msg">
          The chat is locked for new users. You may chat in
          {" "}
          <span className="sendbox-locked-timer">{secondsUntilUnlock}</span>
          {" "}
          seconds.
        </span>
      </div>
    );
  } else {
    return (
      <div className="sendbox-loggedout">
        <span className="sendbox-loggedout-msg">You must be logged in to chat!</span>
      </div>
    );
  }
}
