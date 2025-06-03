import { useState } from 'react';
import { observer } from 'mobx-react';
import chat, { ChatMessage } from '../../../stores/chat';
import profile from '../../../stores/profile';

interface MessageActionsProps {
  message: ChatMessage;
  onEdit: () => void;
  onCancelEdit: () => void;
  isEditing: boolean;
}

const MessageActions = observer(({ message, onEdit, onCancelEdit, isEditing }: MessageActionsProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Check if user can edit/delete this message
  const canEdit = message.uid === profile.uid && message.key;
  const canDelete = (message.uid === profile.uid || profile.isAdmin) && message.key;
  
  // Don't show actions for bot messages or if user can't edit/delete
  if (message.bot || message.chatgpt || (!canEdit && !canDelete)) {
    return null;
  }

  // Calculate time since message was sent (5 minute edit window)
  const messageAge = Date.now() / 1000 - message.timestamp;
  const canStillEdit = canEdit && messageAge < 300; // 5 minutes

  const handleEdit = () => {
    if (canStillEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    if (showConfirmDelete && message.key) {
      console.log('Deleting message:', message.key);
      chat.deleteMsg(message.key);
      console.log('Delete message sent to backend');
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  if (isEditing) {
    return (
      <div className="message-actions editing">
        <button
          className="action-btn cancel-btn"
          onClick={onCancelEdit}
          title="Cancel editing"
        >
          <i className="fa fa-times"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="message-actions">
      {canStillEdit && (
        <button
          className="action-btn edit-btn"
          onClick={handleEdit}
          title={`Edit message (${Math.max(0, Math.ceil(300 - messageAge))}s remaining)`}
        >
          <i className="fa fa-pencil"></i>
        </button>
      )}
      
      {canDelete && !showConfirmDelete && (
        <button
          className="action-btn delete-btn"
          onClick={handleDelete}
          title="Delete message"
        >
          <i className="fa fa-trash"></i>
        </button>
      )}
      
      {canDelete && showConfirmDelete && (
        <div className="delete-confirmation">
          <button
            className="action-btn confirm-delete-btn"
            onClick={handleDelete}
            title="Confirm delete"
          >
            <i className="fa fa-check"></i>
          </button>
          <button
            className="action-btn cancel-delete-btn"
            onClick={handleCancelDelete}
            title="Cancel delete"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
});

export default MessageActions;