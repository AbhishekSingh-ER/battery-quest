import React from 'react';
import '../styles/Game.css';

const GameWon = ({ stars, chargersPlaced, optimalChargers, onNextLevel, onLevelSelect, isLastLevel }) => {
  return (
    <div className="game-container">
      <div className="game-content">
        <div className="result-screen">
          <div className="result-icon">🎉</div>
          <h1 className="result-title">Level Complete!</h1>
          <p className="result-message">You earned {stars} {stars === 1 ? 'star' : 'stars'}!</p>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Chargers placed: {chargersPlaced} (Optimal: {optimalChargers})
          </p>

          <div className="stars-container">
            {[1, 2, 3].map(star => (
              <div 
                key={star}
                className={`star-large ${star <= stars ? 'filled' : ''}`}
              >
                ⭐
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              className="game-button game-button-primary"
              onClick={onNextLevel}
            >
              {isLastLevel ? '🏠 Back to Menu' : '➡️ Next Level'}
            </button>
            <button 
              className="game-button game-button-dark"
              onClick={onLevelSelect}
            >
              📋 Level Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameWon;