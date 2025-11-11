import React from 'react';
import '../styles/Game.css';

const GameBoard = ({
  levelData,
  robots,
  currentRobotIndex,
  chargers,
  visualPath,
  isMoving,
  hoveredCell,
  moves,
  message,
  chargersUsed,
  gameState,
  onCellClick,
  onPlaceCharger,
  onStartGame,
  onResetLevel,
  onSwitchRobot,
  onPause,
  onMenu,
  onExitLevel,
  onClearChargers,
  onToggleMute
}) => {
  if (!levelData) return null;

  const calculateCellSize = () => {
    const gridSize = levelData.gridSize;
    const maxSize = Math.min(60, Math.floor(600 / gridSize));
    return maxSize;
  };

  const cellSize = calculateCellSize();
  const currentRobot = robots[currentRobotIndex];

  const getCellClass = (x, y) => {
    const classes = ['cell'];
    const pos = [x, y];

    if (levelData.obstacles.some(obs => obs[0] === x && obs[1] === y)) {
      classes.push('obstacle');
    } else if (levelData.powerDrains.some(pd => pd[0] === x && pd[1] === y)) {
      classes.push('power-drain');
    } else if (x === levelData.start[0] && y === levelData.start[1]) {
      classes.push('start');
    } else if (x === levelData.target[0] && y === levelData.target[1]) {
      classes.push('target');
    } else if (chargers.some(c => c.x === x && c.y === y)) {
      classes.push('charger');
    } else if (levelData.boosters.some(b => b.x === x && b.y === y && !b.collected)) {
      classes.push('booster');
    } else if (visualPath.some(p => p[0] === x && p[1] === y) && isMoving) {
      classes.push('path');
    }

    if (hoveredCell && hoveredCell[0] === x && hoveredCell[1] === y) {
      classes.push('hovered');
    }

    return classes.join(' ');
  };

  const getCellIcon = (x, y) => {
    const robotsHere = robots.filter(r => r.x === x && r.y === y && r.active);
    
    // If there are robots, show robot icon
    if (robotsHere.length > 0) {
      const isCurrent = robotsHere.some(r => r.id === currentRobotIndex);
      return <span className="robot-icon">🤖</span>;
    }
    
    // Check for different cell types and return appropriate icons
    if (levelData.obstacles.some(obs => obs[0] === x && obs[1] === y)) {
      return <span className="obstacle-icon">🚫</span>;
    }
    
    if (levelData.powerDrains.some(pd => pd[0] === x && pd[1] === y)) {
      return <span className="power-drain-icon">💀</span>;
    }
    
    if (x === levelData.start[0] && y === levelData.start[1]) {
      return <span className="start-icon">🚩</span>;
    }
    
    if (x === levelData.target[0] && y === levelData.target[1]) {
      return <span className="target-icon">🎯</span>;
    }
    
    if (chargers.some(c => c.x === x && c.y === y)) {
      return <span className="charger-icon">⚡</span>;
    }
    
    if (levelData.boosters.some(b => b.x === x && b.y === y && !b.collected)) {
      return <span className="booster-icon">🔋</span>;
    }
    
    return null;
  };

  const renderRobots = (x, y) => {
    const robotsHere = robots.filter(r => r.x === x && r.y === y && r.active);
    
    if (robotsHere.length === 0) return null;
    
    if (robotsHere.length === 1) {
      const isCurrent = robotsHere[0].id === currentRobotIndex;
      return (
        <div 
          className={`robot ${isCurrent ? 'active' : ''}`}
          style={isCurrent ? {} : { backgroundColor: robotsHere[0].color }}
        >
          <span className="robot-icon">🤖</span>
          <div style={{
            position: 'absolute',
            bottom: '-15px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#333',
            background: 'rgba(255,255,255,0.8)',
            padding: '1px 4px',
            borderRadius: '4px'
          }}>
            {robotsHere[0].id + 1}
          </div>
        </div>
      );
    }

    return (
      <div className="multiple-robots">
        {robotsHere.map((robot, index) => {
          const angle = (2 * Math.PI * index) / robotsHere.length;
          const distance = 35;
          const translateX = Math.cos(angle) * distance;
          const translateY = Math.sin(angle) * distance;
          const isCurrent = robot.id === currentRobotIndex;
          
          return (
            <div
              key={robot.id}
              className={`small-robot ${isCurrent ? 'active' : ''}`}
              style={isCurrent ? {} : {
                backgroundColor: robot.color,
                transform: `translate(${translateX}%, ${translateY}%)`
              }}
            >
              <span style={{ fontSize: '8px' }}>🤖</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCellContent = (x, y) => {
    const robotsHere = robots.filter(r => r.x === x && r.y === y && r.active);
    const hasRobots = robotsHere.length > 0;

    return (
      <>
        {hasRobots && renderRobots(x, y)}
        {!hasRobots && getCellIcon(x, y)}
      </>
    );
  };

  const handleCellClick = (x, y) => {
    if (gameState === 'SETUP') {
      onPlaceCharger(x, y);
    } else {
      onCellClick(x, y);
    }
  };

  const handleCellHover = (x, y) => {
    // This would be handled by parent component through props
  };

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

        <div className="game-header">
          <div className="game-info">
            <h1>Level {levelData.level}</h1>
            <p>Grid: {levelData.gridSize}×{levelData.gridSize} | Robots: {levelData.robotCount}</p>
          </div>
          
          <div className="game-info" style={{ textAlign: 'right' }}>
            {currentRobot && (
              <>
                <p style={{ 
                  color: currentRobot.id === currentRobotIndex ? '#ffa500' : '#6496ff', 
                  fontWeight: 'bold', 
                  fontSize: '18px' 
                }}>
                  {currentRobot.id === currentRobotIndex ? '🟡' : '🔵'} Current: Robot {currentRobotIndex + 1}
                </p>
                <div className="battery-container">
                  <span style={{ 
                    color: currentRobot.id === currentRobotIndex ? '#ffa500' : '#6496ff',
                    fontWeight: 'bold' 
                  }}>
                    🔋 {currentRobot.battery}/{levelData.batteryCapacity}
                  </span>
                  <div className="battery-bar">
                    <div 
                      className="battery-fill"
                      style={{ 
                        width: `${(currentRobot.battery / levelData.batteryCapacity) * 100}%`,
                        backgroundColor: currentRobot.battery < levelData.batteryCapacity * 0.3 ? '#ff6464' : 
                                       currentRobot.battery < levelData.batteryCapacity * 0.6 ? '#ffa500' : '#64c864'
                      }}
                    />
                  </div>
                </div>
              </>
            )}
            <p style={{ color: '#c864ff', fontWeight: 'bold', fontSize: '16px' }}>
              📊 Moves: {moves}
            </p>
          </div>
        </div>

        {message && (
          <div className="game-message">
            💡 {message}
          </div>
        )}

        <div className="game-main">
          <div className="game-grid-container">
            <div 
              className="game-grid"
              style={{
                gridTemplateColumns: `repeat(${levelData.gridSize}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${levelData.gridSize}, ${cellSize}px)`
              }}
              onMouseLeave={() => handleCellHover(null, null)}
            >
              {Array.from({ length: levelData.gridSize * levelData.gridSize }, (_, index) => {
                const x = index % levelData.gridSize;
                const y = Math.floor(index / levelData.gridSize);
                return (
                  <div
                    key={`${x}-${y}`}
                    className={getCellClass(x, y)}
                    style={{ width: cellSize, height: cellSize }}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => handleCellHover(x, y)}
                    title={`Cell (${x}, ${y})`}
                  >
                    {renderCellContent(x, y)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="game-sidebar">
            <button 
              className="game-button game-button-dark"
              onClick={onMenu}
            >
              🏠 Menu
            </button>

            {gameState === 'SETUP' && (
              <>
                <button 
                  className="game-button game-button-primary"
                  onClick={onStartGame}
                >
                  🚀 START GAME
                </button>
                <button 
                  className="game-button game-button-danger"
                  onClick={onClearChargers}
                  disabled={chargers.length === 0}
                >
                  🗑️ Clear All Chargers
                </button>
              </>
            )}

            <button 
              className="game-button game-button-warning"
              onClick={onResetLevel}
              disabled={isMoving}
            >
              🔄 Reset Level
            </button>

            {gameState === 'PLAYING' && robots.length > 1 && (
              <button 
                className="game-button game-button-secondary"
                onClick={onSwitchRobot}
                disabled={isMoving}
              >
                🔄 Switch Robot
              </button>
            )}

            <button 
              className="game-button game-button-dark"
              onClick={onPause}
            >
              ⏸️ Pause
            </button>
            <button 
              className="game-button game-button-danger"
              onClick={onExitLevel}
            >
              🚪 Exit Level
            </button>
            <div className="sidebar-section">
              <h3>⚡ Charger Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span>Placed:</span>
                  <span>{chargers.length}</span>
                </div>
                <div className="stat-item">
                  <span>Used:</span>
                  <span>{chargersUsed} times</span>
                </div>
                {/* <div className="stat-item">
                  <span>Optimal:</span>
                  <span>{levelData.optimalChargers}</span>
                </div> */}
                <div className="stat-item">
                  <span>Maximum:</span>
                  <span>{levelData.maxChargers}</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>📖 Symbols Legend</h3>
              <div className="legend-grid">
                {[
                  { icon: '🔵', label: 'Robot', desc: 'Inactive robot' },
                  { icon: '🟡', label: 'Robot', desc: 'Active robot' },
                  { icon: '🚩', label: 'Start', desc: 'Starting position' },
                  { icon: '🎯', label: 'Target', desc: 'Goal position' },
                  { icon: '🚫', label: 'Obstacle', desc: 'Blocks movement' },
                  { icon: '💀', label: 'Power Drain', desc: 'Costs 2 battery' },
                  { icon: '⚡', label: 'Charger', desc: 'Infinite recharges' },
                  { icon: '🔋', label: 'Battery+', desc: '+2 battery' }
                ].map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-icon">
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;