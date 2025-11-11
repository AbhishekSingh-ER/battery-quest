import React from 'react';
import '../styles/Game.css';

const GameMenu = ({ onStartGame, onLevelSelect, onTutorial, onSettings, onAchievements, onToggleMute }) => {
  return (
    <div className="game-container">
      <div className="game-content">
        {/* Sound Toggle Button */}
        <button 
          className="sound-toggle"
          onClick={onToggleMute}
          title="Toggle Sound"
        >
          🔊
        </button>

        <div className="menu-title">
          <h1>Battery Quest</h1>
          <h2>Multi-Robot Edition</h2>
        </div>

        <div className="menu-buttons">
          <button 
            className="game-button game-button-primary"
            onClick={onStartGame}
          >
            🚀 Start Game
          </button>
          <button 
            className="game-button game-button-secondary"
            onClick={onLevelSelect}
          >
            📋 Level Select
          </button>
          <button 
            className="game-button game-button-warning"
            onClick={onTutorial}
          >
            📖 Tutorial
          </button>
          <button 
            className="game-button game-button-dark"
            onClick={onAchievements}
          >
            🏆 Achievements
          </button>
          <button 
            className="game-button game-button-dark"
            onClick={onSettings}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="menu-features">
          <h3>🎮 Game Features</h3>
          <ul>
            <li>🤖 Control multiple robots at RANDOM positions</li>
            <li>⚡ Place INFINITE-USE chargers strategically</li>
            <li>🎯 Click cells to navigate robots to target</li>
            <li>🔋 Manage battery carefully for each robot</li>
            <li>💀 Avoid power drains (costs 2 battery)</li>
            <li>🔋 Collect battery boosters for +2 energy</li>
            <li>⭐ Complete 50 challenging levels!</li>
          </ul>
        </div>

        <div className="menu-actions">
          <button 
            className="game-button game-button-dark"
            onClick={onToggleMute}
          >
            🔊 Toggle Sound
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;