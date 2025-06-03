import React, { useState } from 'react';
import { observer } from 'mobx-react';
import chat, { ChatMessage } from '../../../stores/chat';
import profile from '../../../stores/profile';
import MessageActions from './MessageActions';
import MessageEditor from './MessageEditor';
import moment from 'moment';

// Mock message for demonstration
const createMockMessage = (id: string, content: string, edited = false): ChatMessage => ({
  uid: profile.uid || 'demo-user',
  username: profile.username || 'DemoUser',
  msg: content,
  timestamp: Math.floor(Date.now() / 1000),
  title: '',
  key: id,
  msgs: [content],
  edited,
  editedAt: edited ? Math.floor(Date.now() / 1000) : undefined
});

const MessageEditingDemo = observer(() => {
  const [demoMessages, setDemoMessages] = useState<ChatMessage[]>([
    createMockMessage('demo-1', 'This is a demo message that you can edit!'),
    createMockMessage('demo-2', 'This message has been edited', true),
    createMockMessage('demo-3', 'Try hovering over these messages to see the edit/delete buttons')
  ]);
  
  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(null);

  const handleEditMessage = (messageKey: string) => {
    setEditingMessageKey(messageKey);
  };

  const handleSaveEdit = (messageKey: string, newContent: string) => {
    setDemoMessages(prev => prev.map(msg => 
      msg.key === messageKey 
        ? { ...msg, msg: newContent, msgs: [newContent], edited: true, editedAt: Math.floor(Date.now() / 1000) }
        : msg
    ));
    setEditingMessageKey(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageKey(null);
  };

  const handleDeleteMessage = (messageKey: string) => {
    setDemoMessages(prev => prev.filter(msg => msg.key !== messageKey));
  };

  // Mock the chat store methods for demo
  const originalEditMsg = chat.editMsg;
  const originalDeleteMsg = chat.deleteMsg;
  
  React.useEffect(() => {
    chat.editMsg = (messageKey: string, newMsg: string) => {
      console.log('Demo: Edit message', messageKey, newMsg);
      handleSaveEdit(messageKey, newMsg);
    };
    
    chat.deleteMsg = (messageKey: string) => {
      console.log('Demo: Delete message', messageKey);
      handleDeleteMessage(messageKey);
    };
    
    return () => {
      chat.editMsg = originalEditMsg;
      chat.deleteMsg = originalDeleteMsg;
    };
  }, []);

  return (
    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', margin: '20px' }}>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>🎯 Message Editing Demo</h3>
      <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
        Hover over the messages below to see the edit/delete buttons. This demo simulates the frontend functionality.
      </p>
      
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '5px' }}>
        {demoMessages.map((msg) => {
          const isEditing = editingMessageKey === msg.key;
          const humanTimestamp = moment.unix(msg.timestamp).format("LT");
          
          return (
            <div 
              key={msg.key} 
              style={{ 
                padding: '10px',
                marginBottom: '10px',
                background: isEditing ? 'rgba(52, 152, 219, 0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius: '5px',
                borderLeft: isEditing ? '3px solid #3498db' : 'none'
              }}
              className="chat-item"
            >
              <div className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#3498db' }}>{msg.username}</span>
                  <span style={{ marginLeft: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    {humanTimestamp}
                    {msg.edited && (
                      <span style={{ fontStyle: 'italic' }}>
                        {" "}(edited)
                      </span>
                    )}
                  </span>
                </div>
                <MessageActions
                  message={msg}
                  onEdit={() => handleEditMessage(msg.key!)}
                  onCancelEdit={handleCancelEdit}
                  isEditing={isEditing}
                />
              </div>
              
              {isEditing ? (
                <MessageEditor
                  message={msg}
                  onSave={() => handleSaveEdit(msg.key!, msg.msg)}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <div style={{ color: 'white' }}>
                  {msg.msg}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(39, 174, 96, 0.2)', borderLeft: '4px solid #27ae60', borderRadius: '5px' }}>
        <strong style={{ color: '#27ae60' }}>✅ Demo Features Working:</strong>
        <ul style={{ color: 'white', marginTop: '10px' }}>
          <li>✓ Edit/delete buttons appear on hover</li>
          <li>✓ Inline editing with textarea</li>
          <li>✓ Keyboard shortcuts (Enter to save, Esc to cancel)</li>
          <li>✓ Delete confirmation dialog</li>
          <li>✓ Edit indicator for modified messages</li>
          <li>✓ Proper Font Awesome icons</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(231, 76, 60, 0.2)', borderLeft: '4px solid #e74c3c', borderRadius: '5px' }}>
        <strong style={{ color: '#e74c3c' }}>⚠️ Backend Integration Needed:</strong>
        <p style={{ color: 'white', marginTop: '10px' }}>
          This demo simulates the frontend functionality. The actual implementation sends <code>chat_edit</code> and <code>chat_delete</code> events to the backend, which needs to be implemented according to the provided requirements.
        </p>
      </div>
    </div>
  );
});

export default MessageEditingDemo;