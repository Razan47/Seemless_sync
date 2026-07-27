import React, { useState } from 'react';

const SessionSetup = ({ onJoin }) => {
  const [joinId, setJoinId] = useState('');

  const createSession = () => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onJoin(newId);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinId.trim()) {
      onJoin(joinId.trim().toUpperCase());
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1 className="setup-title">Seamless Sync</h1>
        <p className="setup-subtitle">Cross-device text and image sharing</p>

        <button className="setup-btn" onClick={createSession}>
          Create New Session
        </button>

        <div className="divider">OR</div>

        <form onSubmit={handleJoin}>
          <input
            type="text"
            className="input-field"
            placeholder="Enter Session ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            maxLength={6}
          />
          <button type="submit" className="setup-btn" style={{ backgroundColor: 'var(--text-secondary)' }}>
            Join Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionSetup;
