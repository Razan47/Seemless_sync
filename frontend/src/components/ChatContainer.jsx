import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Sun, Moon, LogOut, Trash2, QrCode, X, Copy, Download, Paperclip, Send } from 'lucide-react';

const ChatContainer = ({ sessionId, userId, socket, onLeave, theme, toggleTheme }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [stagedAttachment, setStagedAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    socket.on('session-history', (history) => {
      setMessages(history);
    });

    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('session-cleared', () => {
      setMessages([]);
    });

    return () => {
      socket.off('session-history');
      socket.off('receive-message');
      socket.off('session-cleared');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const currentText = inputValue.trim();
    const currentAttachment = stagedAttachment;

    if (!currentText && !currentAttachment) return;

    // Optimistically clear the inputs
    setInputValue('');
    setStagedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Send attachment if any
    if (currentAttachment) {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('senderId', userId);
      formData.append('image', currentAttachment);

      try {
        await axios.post('https://seemless-sync.onrender.com/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (error) {
        console.error('Upload failed', error);
        alert('Image upload failed');
      }
    }

    // Send text if any
    if (currentText) {
      socket.emit('send-message', {
        sessionId,
        content: currentText,
        senderId: userId,
      }, (response) => {
        if (!response || response.status !== 'ok') {
          console.error('Failed to send message');
          setInputValue(currentText); // revert on failure
        }
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStagedAttachment(file);
    }
  };

  const clearSession = () => {
    if (confirm('Clear all messages in this session?')) {
      socket.emit('clear-session', sessionId);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const sessionUrl = window.location.href;

  return (
    <>
      <div className="header">
        <div className="header-title">
          <span>Session</span>
          <span className="session-badge">{sessionId}</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setShowQR(true)} title="Show QR Code">
            <QrCode size={18} />
          </button>
          <button className="icon-btn" onClick={clearSession} title="Clear Session">
            <Trash2 size={18} />
          </button>
          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="icon-btn" onClick={onLeave} title="Leave Session">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="chat-history">
        {messages.map((msg) => {
          const isSent = msg.senderId === userId;
          return (
            <div key={msg.id} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                {msg.type === 'text' ? (
                  <span>{msg.content}</span>
                ) : (
                  <img 
                    src={msg.content.startsWith('/uploads') ? `https://seemless-sync.onrender.com${msg.content}` : msg.content} 
                    alt="Shared content" 
                    className="message-image" 
                    onClick={() => setSelectedImage(msg.content)}
                  />
                )}
              </div>
              <div className="message-actions">
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.type === 'text' ? (
                  <button className="action-btn" onClick={() => copyToClipboard(msg.content)}>
                    <Copy size={12} /> Copy
                  </button>
                ) : (
                  <a className="action-btn" href={msg.content.startsWith('/uploads') ? `https://seemless-sync.onrender.com${msg.content}` : msg.content} download target="_blank" rel="noreferrer">
                    <Download size={12} /> Save
                  </a>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {stagedAttachment && (
        <div style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--panel-bg)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <Paperclip size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', flex: 1 }}>{stagedAttachment.name}</span>
          <button 
            type="button" 
            className="icon-btn" 
            style={{ padding: '0.2rem' }}
            onClick={() => {
              setStagedAttachment(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <div className="file-input-wrapper">
          <button type="button" className="icon-btn" style={{ background: 'var(--bg-color)' }}>
            <Paperclip size={18} />
          </button>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
        </div>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!inputValue.trim() && !stagedAttachment}>
          <Send size={16} />
        </button>
      </form>

      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="icon-btn modal-close" onClick={() => setShowQR(false)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Join Session</h3>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block' }}>
              <QRCodeSVG value={sessionUrl} size={200} />
            </div>
            <p style={{ marginTop: '1rem', fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--text-primary)' }}>ID: {sessionId}</p>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '0.5rem', background: 'transparent', boxShadow: 'none' }}>
             <button className="icon-btn modal-close" onClick={() => setSelectedImage(null)} style={{ background: 'rgba(0,0,0,0.5)', color: 'white', top: '-2rem', right: '-2rem' }}>
              <X size={24} />
            </button>
             <img src={selectedImage?.startsWith('/uploads') ? `https://seemless-sync.onrender.com${selectedImage}` : selectedImage} alt="Fullscreen" className="modal-image" />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatContainer;
