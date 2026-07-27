import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import SessionSetup from './components/SessionSetup';
import ChatContainer from './components/ChatContainer';

// Using Render backend for production
const socket = io('https://seemless-sync.onrender.com');

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    let storedUserId = localStorage.getItem('sync_user_id');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('sync_user_id', storedUserId);
    }
    setUserId(storedUserId);

    const savedTheme = localStorage.getItem('sync_theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sync_theme', newTheme);
  };

  const handleJoinSession = (id) => {
    setSessionId(id);
    socket.emit('join-session', id);
  };

  const handleLeaveSession = () => {
    setSessionId(null);
  };

  return (
    <div className="app-container">
      {!sessionId ? (
        <SessionSetup onJoin={handleJoinSession} />
      ) : (
        <ChatContainer 
          sessionId={sessionId} 
          userId={userId} 
          socket={socket} 
          onLeave={handleLeaveSession}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
