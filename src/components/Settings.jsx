import React from 'react';
import '../styles/Game.css';

const Settings = ({ onBack, onToggleMute }) => {
  return (
    <div className="game-container">
      <div className="game-content">
        <div className="menu-title">
          <h1>Settings</h1>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>Audio</h3>
            <button 
              className="game-button game-button-secondary"
              onClick={onToggleMute}
            >
              Toggle Sound
            </button>
          </div>

          <div className="setting-section">
            <h3>Gameplay</h3>
            <div className="setting-item">
              <label>Animation Speed</label>
              <select className="game-select">
                <option>Fast</option>
                <option>Normal</option>
                <option>Slow</option>
              </select>
            </div>
          </div>

          <div className="setting-section">
            <h3>Controls</h3>
            <div className="controls-info">
              <p><strong>Click:</strong> Move robot or place charger</p>
              <p><strong>Hover:</strong> Preview cell information</p>
              <p><strong>Switch Robot:</strong> Control different robots</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="game-button game-button-dark"
            onClick={onBack}
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;