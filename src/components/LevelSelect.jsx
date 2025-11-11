import React from 'react';
import '../styles/Game.css';

const LevelSelect = ({ onSelectLevel, onBack, starRatings }) => {
  const getLevelColor = (level) => {
    if (level <= 10) return '#64c864';
    if (level <= 20) return '#ffff64';
    if (level <= 30) return '#ffa500';
    if (level <= 40) return '#ff6464';
    return '#c864ff';
  };

  const renderStars = (level) => {
    const stars = starRatings[level] || 0;
    return (
      <div className="level-stars">
        {[1, 2, 3].map(star => (
          <div 
            key={star}
            className={`star ${star <= stars ? 'filled' : 'empty'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="game-content">
        <div className="menu-title">
          <h1>Select Level</h1>
        </div>

        <button 
          className="game-button game-button-dark"
          onClick={onBack}
          style={{ marginBottom: '30px' }}
        >
          Back to Menu
        </button>

        <div className="level-grid">
          {Array.from({ length: 50 }, (_, i) => i + 1).map(level => (
            <button
              key={level}
              className="level-button"
              style={{ backgroundColor: getLevelColor(level) }}
              onClick={() => onSelectLevel(level)}
            >
              {level}
              {renderStars(level)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelSelect;