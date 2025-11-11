import React, { useState, useEffect, useCallback } from 'react';
import GameMenu from './components/GameMenu';
import LevelSelect from './components/LevelSelect';
import GameBoard from './components/GameBoard';
import GameWon from './components/GameWon';
import GameLost from './components/GameLost';
import PauseMenu from './components/PauseMenu';
import Tutorial from './components/Tutorial';
import Settings from './components/Settings';
import Achievements from './components/Achievements';
import {
  GameState,
  generateLevel,
  findRandomStartPositions,
  findPath,
  Robot,
  Charger,
  MAX_LEVEL,
  ACHIEVEMENTS
} from './utils/gameLogic';
import { soundManager } from './utils/soundManager';
import './styles/Game.css';

function App() {
  const [gameState, setGameState] = useState(GameState.MENU);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelData, setLevelData] = useState(null);
  const [robots, setRobots] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [visualPath, setVisualPath] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [moves, setMoves] = useState(0);
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState('');
  const [chargersUsed, setChargersUsed] = useState(0);
  const [currentRobotIndex, setCurrentRobotIndex] = useState(0);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [starRatings, setStarRatings] = useState({});
  const [movementData, setMovementData] = useState(null);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [gameStats, setGameStats] = useState({
    levelsCompleted: 0,
    totalMoves: 0,
    totalChargersUsed: 0,
    threeStarLevels: 0,
    perfectLevels: 0
  });
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [showAchievement, setShowAchievement] = useState(null);
  const [cellsVisited, setCellsVisited] = useState(new Set());

  const updateRobotColors = useCallback(() => {
    setRobots(prevRobots => 
      prevRobots.map((robot, index) => {
        const updatedRobot = { ...robot };
        if (index === currentRobotIndex && robot.active) {
          updatedRobot.color = '#ffd700'; // Gold yellow for active robot
        } else {
          updatedRobot.color = '#6496ff'; // Blue for inactive robots
        }
        return updatedRobot;
      })
    );
  }, [currentRobotIndex]);

  const checkAchievements = useCallback((levelStats) => {
    const newAchievements = [...achievements];
    let unlockedNew = false;
    let newAchievement = null;

    newAchievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(gameStats, levelStats)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        unlockedNew = true;
        newAchievement = achievement;
        
        // Play achievement sound
        soundManager.play('win');
      }
    });

    if (unlockedNew) {
      setAchievements(newAchievements);
      setShowAchievement(newAchievement);
      setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [achievements, gameStats]);

  const setupLevel = useCallback(() => {
    const newLevelData = generateLevel(currentLevel);
    newLevelData.level = currentLevel;
    setLevelData(newLevelData);

    const startPositions = newLevelData.startPositions || findRandomStartPositions(newLevelData, newLevelData.robotCount);
    const newRobots = startPositions.map((pos, i) => {
      const robot = new Robot(pos[0], pos[1], i);
      robot.battery = newLevelData.batteryCapacity;
      return robot;
    });

    setRobots(newRobots);
    setVisualPath([]);
    setChargers([]);
    setMoves(0);
    setChargersUsed(0);
    setCurrentRobotIndex(0);
    setCellsVisited(new Set());
    setMessage(`Place chargers (Optional | Max: ${newLevelData.maxChargers})`);
    
    // Update robot colors after a brief delay to ensure state is set
    setTimeout(updateRobotColors, 100);
    
    soundManager.play('click');
  }, [currentLevel, updateRobotColors]);

  useEffect(() => {
    if (gameState === GameState.SETUP) {
      setupLevel();
    }
  }, [gameState, setupLevel]);

  useEffect(() => {
    updateRobotColors();
  }, [currentRobotIndex, updateRobotColors]);

  const getCurrentRobot = () => {
    return robots[currentRobotIndex];
  };

  const placeCharger = (x, y) => {
    if (!levelData || gameState !== GameState.SETUP || isMoving) return;

    const pos = [x, y];
    
    if (levelData.obstacles.some(obs => obs[0] === x && obs[1] === y) ||
        levelData.powerDrains.some(pd => pd[0] === x && pd[1] === y) ||
        robots.some(r => r.x === x && r.y === y) ||
        (x === levelData.target[0] && y === levelData.target[1]) ||
        (x === levelData.start[0] && y === levelData.start[1])) {
      setMessage('Cannot place charger here!');
      soundManager.play('error');
      return;
    }

    const existingChargerIndex = chargers.findIndex(c => c.x === x && c.y === y);
    if (existingChargerIndex !== -1) {
      const newChargers = chargers.filter((_, i) => i !== existingChargerIndex);
      setChargers(newChargers);
      setMessage(`Charger removed (${newChargers.length}/${levelData.maxChargers})`);
      soundManager.play('click');
      return;
    }

    if (chargers.length >= levelData.maxChargers) {
      setMessage(`Maximum ${levelData.maxChargers} chargers allowed!`);
      soundManager.play('error');
      return;
    }

    const newChargers = [...chargers, new Charger(x, y)];
    setChargers(newChargers);
    setMessage(`Charger placed (${newChargers.length}/${levelData.maxChargers})`);
    soundManager.play('placement');
  };

  const clearAllChargers = () => {
    setChargers([]);
    setMessage('All chargers cleared');
    soundManager.play('click');
  };

  const startGame = () => {
    if (!levelData) return;
    setGameState(GameState.PLAYING);
    setMessage(`Click any cell to move! Current: Robot ${currentRobotIndex + 1}`);
    updateRobotColors();
    soundManager.play('click');
  };

  const animateMovement = (path) => {
    if (isMoving || !levelData) return;

    setIsMoving(true);
    setVisualPath(path);

    const currentRobot = getCurrentRobot();
    if (!currentRobot) return;

    // Track visited cells
    const newCellsVisited = new Set(cellsVisited);
    path.forEach(pos => newCellsVisited.add(pos.toString()));
    setCellsVisited(newCellsVisited);

    setMovementData({
      path,
      currentIndex: 1,
      currentBattery: currentRobot.battery,
      usedChargers: chargersUsed,
      robotId: currentRobotIndex
    });
    setLastMoveTime(Date.now());
    
    soundManager.play('move');
  };

  const updateMovement = useCallback(() => {
    if (!movementData) {
      setIsMoving(false);
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastMoveTime < 250) return;

    const data = movementData;
    const i = data.currentIndex;
    const path = data.path;
    const robotId = data.robotId;

    if (i >= path.length || robotId >= robots.length) {
      setIsMoving(false);
      setVisualPath([]);
      setMovementData(null);
      return;
    }

    const currentRobot = robots[robotId];
    const nextPos = path[i];
    const [x, y] = nextPos;

    // Create updated robots array
    const updatedRobots = [...robots];
    const movingRobot = { ...updatedRobots[robotId] };
    
    // Update robot position
    movingRobot.x = x;
    movingRobot.y = y;

    // Calculate movement cost
    let cost = 1;
    if (levelData.powerDrains.some(pd => pd[0] === x && pd[1] === y)) {
      cost = 2;
      soundManager.play('powerDrain');
    } else {
      soundManager.play('move');
    }

    // Deduct battery cost
    movingRobot.battery = Math.max(0, movingRobot.battery - cost);

    // Check for charger collision FIRST (before battery check)
    let wasCharged = false;
    for (const charger of chargers) {
      if (charger.x === x && charger.y === y) {
        movingRobot.battery = levelData.batteryCapacity;
        setChargersUsed(prev => prev + 1);
        setMessage(`Robot ${robotId + 1} battery recharged!`);
        wasCharged = true;
        soundManager.play('charge');
        break;
      }
    }

    // Check for booster collision
    const updatedBoosters = [...levelData.boosters];
    let boosterCollected = false;
    for (const booster of updatedBoosters) {
      if (booster.x === x && booster.y === y && !booster.collected) {
        booster.collected = true;
        if (booster.type === 1) { // BATTERY
          movingRobot.battery = Math.min(levelData.batteryCapacity, movingRobot.battery + 2);
          setMessage(`Robot ${robotId + 1} +2 Battery!`);
        }
        boosterCollected = true;
        soundManager.play('boost');
        break;
      }
    }

    if (boosterCollected) {
      setLevelData(prev => ({ ...prev, boosters: updatedBoosters }));
    }

    // Update the robot in the array
    updatedRobots[robotId] = movingRobot;
    setRobots(updatedRobots);

    // Check if battery is depleted (AFTER all updates)
    if (movingRobot.battery <= 0 && !(x === levelData.target[0] && y === levelData.target[1])) {
      const deactivatedRobots = updatedRobots.map(r =>
        r.id === robotId ? { ...r, active: false } : r
      );
      setRobots(deactivatedRobots);
      setIsMoving(false);
      setVisualPath([]);
      setMovementData(null);
      setMessage(`Robot ${robotId + 1} out of battery! Game Over!`);
      soundManager.play('lose');
      setGameState(GameState.LOST);
      return;
    }

    // Check if reached target
    if (x === levelData.target[0] && y === levelData.target[1]) {
      setIsMoving(false);
      setVisualPath([]);
      
      const targetReachedRobots = updatedRobots.map(r =>
        r.id === robotId ? { ...r, active: false } : r
      );
      setRobots(targetReachedRobots);
      setMessage(`Robot ${robotId + 1} reached target!`);
      soundManager.play('win');

      const allAtTarget = targetReachedRobots.every(robot => !robot.active);
      if (allAtTarget) {
        // Calculate stars based on PLACED chargers (not used chargers)
        calculateStars(chargers.length);
        
        // Update game stats
        const levelStats = {
          chargersPlaced: chargers.length,
          moves: moves + 1,
          finalBatteryPercent: Math.min(...targetReachedRobots.map(r => (r.battery / levelData.batteryCapacity) * 100)),
          robotCount: levelData.robotCount,
          gridSize: levelData.gridSize,
          cellsVisited: cellsVisited.size
        };
        
        setGameStats(prev => ({
          ...prev,
          levelsCompleted: prev.levelsCompleted + 1,
          totalMoves: prev.totalMoves + moves,
          totalChargersUsed: prev.totalChargersUsed + chargersUsed,
          threeStarLevels: stars === 3 ? prev.threeStarLevels + 1 : prev.threeStarLevels,
          perfectLevels: stars === 3 && chargers.length <= levelData.optimalChargers ? prev.perfectLevels + 1 : prev.perfectLevels
        }));

        // Check achievements
        checkAchievements(levelStats);
        
        setGameState(GameState.WON);
      } else {
        switchToNextRobot();
      }

      setMovementData(null);
      return;
    }

    // Continue movement
    setMovementData({
      ...data,
      currentIndex: i + 1,
      currentBattery: movingRobot.battery,
      usedChargers: data.usedChargers + (wasCharged ? 1 : 0)
    });
    setLastMoveTime(currentTime);
  }, [movementData, lastMoveTime, robots, levelData, chargers, moves, chargersUsed, cellsVisited, checkAchievements]);

  useEffect(() => {
    if (isMoving) {
      const interval = setInterval(updateMovement, 50);
      return () => clearInterval(interval);
    }
  }, [isMoving, updateMovement]);

  const switchToNextRobot = () => {
    const startIndex = currentRobotIndex;
    let newIndex = currentRobotIndex;
    
    do {
      newIndex = (newIndex + 1) % robots.length;
      if (robots[newIndex].active) {
        setCurrentRobotIndex(newIndex);
        setMessage(`Now controlling: Robot ${newIndex + 1}`);
        updateRobotColors();
        soundManager.play('robotSwitch');
        return;
      }
    } while (newIndex !== startIndex);
    
    setMessage('No active robots remaining!');
  };

  const handleCellClick = (targetX, targetY) => {
    soundManager.play('click');
    
    if (gameState === GameState.SETUP) {
      placeCharger(targetX, targetY);
    } else if (gameState === GameState.PLAYING && !isMoving) {
      const currentRobot = getCurrentRobot();
      if (!currentRobot || !currentRobot.active) return;

      if (targetX === currentRobot.x && targetY === currentRobot.y) return;

      const path = findPath(levelData, [currentRobot.x, currentRobot.y], [targetX, targetY]);

      if (!path || path.length <= 1) {
        setMessage('Cannot reach that cell!');
        soundManager.play('error');
        return;
      }

      setMoves(moves + 1);
      setMessage(`Robot ${currentRobotIndex + 1} moving to (${targetX}, ${targetY})...`);
      animateMovement(path);
    }
  };

  const calculateStars = (placedChargers) => {
    let newStars;
    if (placedChargers <= levelData.optimalChargers) {
      newStars = 3;
    } else if (placedChargers <= levelData.optimalChargers + 1) {
      newStars = 2;
    } else {
      newStars = 1;
    }
    
    setStars(newStars);

    // Update star ratings
    if (newStars > (starRatings[currentLevel] || 0)) {
      setStarRatings(prev => ({ ...prev, [currentLevel]: newStars }));
    }
  };

  const resetLevel = () => {
    setGameState(GameState.SETUP);
    setIsMoving(false);
    setVisualPath([]);
    soundManager.play('click');
  };

  const exitLevel = () => {
    setGameState(GameState.LEVEL_SELECT);
    soundManager.play('click');
  };

  const nextLevel = () => {
    if (currentLevel < MAX_LEVEL) {
      setCurrentLevel(prev => prev + 1);
      setGameState(GameState.SETUP);
    } else {
      setGameState(GameState.MENU);
    }
    soundManager.play('click');
  };

  const handlePause = () => {
    setGameState(GameState.PAUSED);
    soundManager.play('click');
  };

  const handleResume = () => {
    setGameState(GameState.PLAYING);
    soundManager.play('click');
  };

  const handleCellHover = (x, y) => {
    setHoveredCell(x !== null && y !== null ? [x, y] : null);
  };

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setMessage(muted ? 'Sound muted' : 'Sound enabled');
    setTimeout(() => setMessage(''), 1500);
  };

  // Render based on game state
  const renderGameState = () => {
    switch (gameState) {
      case GameState.MENU:
        return (
          <GameMenu
            onStartGame={() => {
              setGameState(GameState.LEVEL_SELECT);
              soundManager.play('click');
            }}
            onLevelSelect={() => {
              setGameState(GameState.LEVEL_SELECT);
              soundManager.play('click');
            }}
            onTutorial={() => {
              setGameState(GameState.TUTORIAL);
              soundManager.play('click');
            }}
            onSettings={() => {
              setGameState(GameState.SETTINGS);
              soundManager.play('click');
            }}
            onAchievements={() => {
              setGameState(GameState.ACHIEVEMENTS);
              soundManager.play('click');
            }}
            onToggleMute={toggleMute}
          />
        );

      case GameState.LEVEL_SELECT:
        return (
          <LevelSelect
            onSelectLevel={(level) => {
              setCurrentLevel(level);
              setGameState(GameState.SETUP);
              soundManager.play('click');
            }}
            onBack={() => {
              setGameState(GameState.MENU);
              soundManager.play('click');
            }}
            starRatings={starRatings}
          />
        );

      case GameState.TUTORIAL:
        return (
          <Tutorial onBack={() => {
            setGameState(GameState.MENU);
            soundManager.play('click');
          }} />
        );

      case GameState.SETTINGS:
        return (
          <Settings 
            onBack={() => {
              setGameState(GameState.MENU);
              soundManager.play('click');
            }}
            onToggleMute={toggleMute}
          />
        );

      case GameState.ACHIEVEMENTS:
        return (
          <Achievements 
            achievements={achievements}
            onBack={() => {
              setGameState(GameState.MENU);
              soundManager.play('click');
            }}
          />
        );

      case GameState.SETUP:
      case GameState.PLAYING:
        return (
          <GameBoard
            levelData={levelData}
            robots={robots}
            currentRobotIndex={currentRobotIndex}
            chargers={chargers}
            visualPath={visualPath}
            isMoving={isMoving}
            hoveredCell={hoveredCell}
            moves={moves}
            message={message}
            chargersUsed={chargersUsed}
            gameState={gameState === GameState.SETUP ? 'SETUP' : 'PLAYING'}
            onCellClick={handleCellClick}
            onPlaceCharger={placeCharger}
            onStartGame={startGame}
            onResetLevel={resetLevel}
            onSwitchRobot={switchToNextRobot}
            onPause={handlePause}
            onMenu={() => {
              setGameState(GameState.LEVEL_SELECT);
              soundManager.play('click');
            }}
            onExitLevel={exitLevel}
            onClearChargers={clearAllChargers}
            onToggleMute={toggleMute}
          />
        );

      case GameState.WON:
        return (
          <GameWon
            stars={stars}
            chargersPlaced={chargers.length}
            optimalChargers={levelData?.optimalChargers}
            onNextLevel={nextLevel}
            onLevelSelect={() => {
              setGameState(GameState.LEVEL_SELECT);
              soundManager.play('click');
            }}
            isLastLevel={currentLevel === MAX_LEVEL}
          />
        );

      case GameState.LOST:
        return (
          <GameLost
            onRetry={resetLevel}
            onLevelSelect={() => {
              setGameState(GameState.LEVEL_SELECT);
              soundManager.play('click');
            }}
          />
        );

      case GameState.PAUSED:
        return (
          <PauseMenu
            onResume={handleResume}
            onRestart={resetLevel}
            onMenu={() => {
              setGameState(GameState.MENU);
              soundManager.play('click');
            }}
          />
        );

      default:
        return <GameMenu onStartGame={() => setGameState(GameState.LEVEL_SELECT)} />;
    }
  };

  return (
    <div className="App">
      {renderGameState()}
      
      {/* Achievement Notification */}
      {showAchievement && (
        <div className="achievement-notification">
          <div className="achievement-popup">
            <div className="achievement-icon">🏆</div>
            <div className="achievement-content">
              <h3>Achievement Unlocked!</h3>
              <h4>{showAchievement.name}</h4>
              <p>{showAchievement.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;