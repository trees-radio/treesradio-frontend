import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import chat, { ChatMessage } from '../../../stores/chat';
import online from '../../../stores/online';

interface MessageEditorProps {
  message: ChatMessage;
  onSave: () => void;
  onCancel: () => void;
}

const MessageEditor = observer(({ message, onSave, onCancel }: MessageEditorProps) => {
  const [editText, setEditText] = useState(message.msg);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus and select all text when editor opens
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleSave = async () => {
    if (!message.key || editText.trim() === '') return;
    
    setIsSaving(true);
    try {
      console.log('Editing message:', message.key, 'New content:', editText.trim());
      chat.editMsg(message.key, editText.trim());
      console.log('Edit message sent to backend');
      onSave();
    } catch (error) {
      console.error('Failed to edit message:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  // Get mention suggestions
  const getMentionMatches = () => {
    const words = editText.split(' ');
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@')) {
      const name = lastWord.substring(1);
      if (name === '') return [];
      
      return online.userlist.filter(
        (username: string) =>
          username &&
          username.toLowerCase().startsWith(name.toLowerCase()) &&
          username.toLowerCase() !== name.toLowerCase()
      );
    }
    return [];
  };

  const mentionMatches = getMentionMatches();

  const handleMentionClick = (username: string) => {
    const words = editText.split(' ');
    words[words.length - 1] = `@${username} `;
    setEditText(words.join(' '));
    textareaRef.current?.focus();
  };

  return (
    <div className="message-editor">
      <div className="editor-container">
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className="edit-textarea"
          placeholder="Edit your message..."
          disabled={isSaving}
          rows={Math.min(Math.max(editText.split('\n').length, 1), 5)}
        />
        
        {mentionMatches.length > 0 && (
          <div className="mention-suggestions">
            {mentionMatches.slice(0, 5).map((username) => (
              <div
                key={username}
                className="mention-suggestion"
                onClick={() => handleMentionClick(username)}
              >
                @{username}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="editor-actions">
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={isSaving || editText.trim() === '' || editText.trim() === message.msg}
          title="Save changes (Enter)"
        >
          {isSaving ? (
            <i className="fa fa-spin fa-circle-o-notch"></i>
          ) : (
            <i className="fa fa-check"></i>
          )}
        </button>
        
        <button
          className="cancel-btn"
          onClick={onCancel}
          disabled={isSaving}
          title="Cancel editing (Esc)"
        >
          <i className="fa fa-times"></i>
        </button>
      </div>
      
      <div className="editor-help">
        <small>Press Enter to save, Esc to cancel</small>
      </div>
    </div>
  );
});

export default MessageEditor;