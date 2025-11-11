import React from 'react';
import '../styles/Game.css';

const Achievements = ({ achievements, onBack }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="game-container">
      <div className="game-content">
        <div className="menu-title">
          <h1>Achievements</h1>
          <p>{unlockedCount} of {totalCount} unlocked</p>
        </div>

        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div 
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.unlocked ? '🏆' : '🔒'}
              </div>
              <div className="achievement-info">
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <small>Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}</small>
                )}
              </div>
            </div>
          ))}
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

export default Achievements;