import React from 'react';
import '../styles/Game.css';

const Tutorial = ({ onBack }) => {
  return (
    <div className="game-container">
      <div className="game-content">
        <div className="menu-title">
          <h1>How to Play</h1>
        </div>

        <div className="tutorial-content">
          <div className="tutorial-section">
            <h2>BATTERY QUEST - MULTI-ROBOT EDITION</h2>
          </div>

          <div className="tutorial-section">
            <h3>OBJECTIVE:</h3>
            <p>Guide all robots to the yellow target cell before their batteries run out.</p>
          </div>

          <div className="tutorial-section">
            <h3>GAMEPLAY:</h3>
            <ul>
              <li>1. SETUP PHASE: Place chargers on the grid (optional but helpful)</li>
              <li>2. Click START GAME to begin</li>
              <li>3. Click any cell to move the current robot there</li>
              <li>4. Use the SWITCH ROBOT button to control different robots</li>
              <li>5. Reach the target with all robots to complete the level</li>
            </ul>
          </div>

          <div className="tutorial-section">
            <h3>STRATEGY TIPS:</h3>
            <ul>
              <li>- Place chargers along the expected path of robots</li>
              <li>- Avoid power drains (red cells) - they cost 2 battery</li>
              <li>- Collect battery boosters (green cells) for +2 energy</li>
              <li>- Plan efficient paths to minimize battery usage</li>
              <li>- Use the optimal charger count as a guide for 3-star rating</li>
            </ul>
          </div>

          <div className="tutorial-section">
            <h3>SCORING:</h3>
            <ul>
              <li>- 3 stars: Used optimal number of chargers or fewer</li>
              <li>- 2 stars: Used one more than optimal chargers</li>
              <li>- 1 star: Used more than optimal+1 chargers</li>
            </ul>
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

export default Tutorial;