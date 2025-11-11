import React from 'react';
import '../styles/Game.css';

const GameLost = ({ onRetry, onLevelSelect }) => {
  return (
    <div className="game-container">
      <div className="game-content">
        <div className="result-screen">
          <div className="result-icon">💀</div>
          <h1 className="result-title">Game Over!</h1>
          <p className="result-message">A robot ran out of battery power!</p>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Try placing more chargers or a better path.
          </p>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              className="game-button game-button-warning"
              onClick={onRetry}
            >
              Try Again
            </button>
            <button 
              className="game-button game-button-dark"
              onClick={onLevelSelect}
            >
              Level Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLost;