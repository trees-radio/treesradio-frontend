import React, { useCallback } from 'react';
import { observer } from "mobx-react";
import { ChatMessage } from "../../../stores/chat";
import profile from "../../../stores/profile";
import classNames from "classnames";
import moment from "moment";
import Message from "./Message";
import UserName from "../../utility/User/UserName";
import UserAvatar from "../../utility/User/UserAvatar";
import MessageActions from "./MessageActions";
import MessageEditor from "./MessageEditor";

interface MessageListProps {
  messages: ChatMessage[];
  editingMessageKey: string | null;
  isMobile: boolean;
  onEditMessage: (messageKey: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onMessageLoad: () => void;
  onUsernameClick: (username: string) => void;
}

const MessageList: React.FC<MessageListProps> = observer(({
  messages,
  editingMessageKey,
  isMobile,
  onEditMessage,
  onSaveEdit,
  onCancelEdit,
  onMessageLoad,
  onUsernameClick
}) => {
  const handleUsernameClick = useCallback((username: string) => {
    onUsernameClick(username);
  }, [onUsernameClick]);

  return (
    <ul id="chatbox" className={isMobile ? "p-4 pb-20" : "p-4"}>
      {messages.map((msg: ChatMessage, i: number) => {
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
        const isEditing = editingMessageKey === msg.key;
        const isDeleted = msg.deleted;
        
        // Don't render deleted messages
        if (isDeleted) {
          return null;
        }
        
        return (
          <li key={`${msg.key}-${i}-${msg.timestamp}`} className={classNames(chatLineClasses, { 'editing': isEditing })}>
            <div className="chat-avatar">
              <UserAvatar uid={msg.uid} />
            </div>
            <div className="chat-msg">
              <div className="chat-header">
                <div className="chat-username-container">
                  <UserName
                    uid={msg.uid}
                    className="chat-username"
                    onClick={() => handleUsernameClick(msg.username)}
                    showFlair={false}
                  />
                </div>
                <div className="chat-flair-container">
                  <UserName
                    uid={msg.uid}
                    className="chat-flair-only"
                    showFlair={true}
                  />
                </div>
              </div>
              
              <div className="chat-timestamp-actions">
                <span className="chat-timestamp">
                  {humanTimestamp}
                  {msg.edited && (
                    <span className="edited-indicator" title={`Edited ${moment.unix(msg.editedAt || 0).format("LT")}`}>
                      {" "}(edited)
                    </span>
                  )}
                </span>
                <MessageActions
                  message={msg}
                  onEdit={() => onEditMessage(msg.key!)}
                  onCancelEdit={onCancelEdit}
                  isEditing={isEditing}
                />
              </div>
              
              {isEditing ? (
                <MessageEditor
                  message={msg}
                  onSave={onSaveEdit}
                  onCancel={onCancelEdit}
                />
              ) : (
                <span className="chat-text">
                  {msg.msgs?.map((innerMsg: string, j: number) => (
                    <Message
                      key={`${msg.key}-${j}`}
                      text={innerMsg}
                      userName={msg.username}
                      isEmote={msg.isemote || false}
                      onLoad={onMessageLoad}
                    />
                  ))}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
});

export default MessageList;