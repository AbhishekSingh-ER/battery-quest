import React from 'react';
import '../styles/Game.css';

const PauseMenu = ({ onResume, onRestart, onMenu }) => {
  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h1 className="pause-title">Game Paused</h1>
        <div className="pause-buttons">
          <button 
            className="game-button game-button-primary"
            onClick={onResume}
          >
            Resume Game
          </button>
          <button 
            className="game-button game-button-warning"
            onClick={onRestart}
          >
            Restart Level
          </button>
          <button 
            className="game-button game-button-dark"
            onClick={onMenu}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;