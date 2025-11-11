// Constants
export const MAX_LEVEL = 50;
export const MOVE_DELAY = 250; // ms

// Game States
export const GameState = {
  MENU: 1,
  LEVEL_SELECT: 2,
  SETUP: 3,
  PLAYING: 4,
  WON: 5,
  LOST: 6,
  TUTORIAL: 7,
  PAUSED: 8,
  SETTINGS: 9,
  ACHIEVEMENTS: 10
};

export const BoosterType = {
  BATTERY: 1,
  SPEED: 2,
  TELEPORT: 3
};

export const SpecialCellType = {
  TELEPORT: 'TELEPORT',
  BARRIER: 'BARRIER',
  SPEED_BOOST: 'SPEED_BOOST',
  BATTERY_SAP: 'BATTERY_SAP',
  WORMHOLE: 'WORMHOLE'
};

// Colors
export const COLORS = {
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#c8c8c8',
  DARK_GRAY: '#646464',
  BLUE: '#6496ff',
  DARK_BLUE: '#3264c8',
  GREEN: '#64c864',
  DARK_GREEN: '#329632',
  RED: '#ff6464',
  DARK_RED: '#cc0000',
  YELLOW: '#ffff64',
  GOLD_YELLOW: '#ffd700',
  PURPLE: '#c864ff',
  ORANGE: '#ffa500',
  CYAN: '#64ffff',
  EMERALD: '#64ffc8',
  LIGHT_BLUE: '#c8e6ff',
  LIGHT_GREEN: '#c8ffc8',
  LIGHT_RED: '#ffc8c8',
  GOLD: '#ffd700',
  TEAL: '#008080',
  MAGENTA: '#ff00ff'
};

export class Charger {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.used = false;
  }
}

export class Booster {
  constructor(x, y, boosterType) {
    this.x = x;
    this.y = y;
    this.type = boosterType;
    this.collected = false;
  }
}

export class SpecialCell {
  constructor(x, y, type, duration = 0, pairedWith = null) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.duration = duration;
    this.active = true;
    this.pairedWith = pairedWith; // For teleporters and wormholes
    this.uses = type === SpecialCellType.TELEPORT ? 3 : Infinity; // Limited uses for teleporters
  }
}

export class Robot {
  constructor(x, y, robotId) {
    this.x = x;
    this.y = y;
    this.id = robotId;
    this.battery = 0;
    this.active = true;
    this.color = COLORS.BLUE;
    this.speedBoost = 0;
    this.teleportCooldown = 0;
    this.pathHistory = [];
  }

  setActive() {
    this.color = COLORS.GOLD_YELLOW;
  }

  setInactive() {
    this.color = COLORS.BLUE;
  }

  addToPathHistory(x, y) {
    this.pathHistory.push([x, y]);
    // Keep only last 20 positions to prevent memory issues
    if (this.pathHistory.length > 20) {
      this.pathHistory.shift();
    }
  }
}

export class Achievement {
  constructor(id, name, description, condition, icon = '🏆') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.condition = condition;
    this.icon = icon;
    this.unlocked = false;
    this.unlockedAt = null;
    this.progress = 0;
    this.maxProgress = 1;
  }
}

export class GameStats {
  constructor() {
    this.levelsCompleted = 0;
    this.totalMoves = 0;
    this.totalChargersUsed = 0;
    this.threeStarLevels = 0;
    this.perfectLevels = 0;
    this.totalBatteryCollected = 0;
    this.totalPowerDrainsAvoided = 0;
    this.fastestCompletion = Infinity;
    this.levelsPlayed = new Set();
  }
}

export const getLevelConfig = (level) => {
  let gridSize = 8 + Math.floor((level - 1) / 2);
  gridSize = Math.min(gridSize, 32);

  let batteryCapacity;
  if (gridSize <= 12) batteryCapacity = 4;
  else if (gridSize <= 18) batteryCapacity = 4;
  else if (gridSize <= 24) batteryCapacity = 6;
  else if (gridSize <= 30) batteryCapacity = 8;
  else batteryCapacity = 10;

  const robotCount = 1 + Math.floor((level - 1) / 2);
  const obstacleDensity = Math.min(0.10 + (level * 0.002), 0.25);
  const powerDrainCount = level >= 5 ? Math.floor(gridSize * gridSize * 0.04) : 0;
  const boosterCount = level >= 3 ? Math.max(1, Math.floor(gridSize * 0.3)) : 0;
  
  // New special features based on level
  const hasTeleporters = level >= 8;
  const hasBarriers = level >= 12;
  const hasSpeedBoosts = level >= 15;
  const hasBatterySaps = level >= 18;
  const hasWormholes = level >= 25;
  const hasMultipleTargets = level >= 30;

  return {
    gridSize,
    batteryCapacity,
    robotCount,
    obstacleDensity,
    powerDrainCount,
    boosterCount,
    hasTeleporters,
    hasBarriers,
    hasSpeedBoosts,
    hasBatterySaps,
    hasWormholes,
    hasMultipleTargets,
    difficulty: Math.min(10, Math.ceil(level / 5))
  };
};

export const calculateOptimalChargersBalanced = (levelData, startPositions, batteryCapacity) => {
  const gridSize = levelData.gridSize;
  const target = levelData.target;
  
  let maxDistance = 0;
  for (const startPos of startPositions) {
    const distance = Math.abs(target[0] - startPos[0]) + Math.abs(target[1] - startPos[1]);
    maxDistance = Math.max(maxDistance, distance);
  }
  
  // Account for obstacles and power drains in distance calculation
  const baseChargers = Math.max(0, Math.ceil((maxDistance - batteryCapacity) / batteryCapacity));
  const robotCount = startPositions.length;
  
  // Adjust for level difficulty and special features
  let difficultyMultiplier = 1 + (levelData.config?.difficulty || 1) * 0.1;
  
  if (robotCount === 1) {
    return Math.ceil(baseChargers * difficultyMultiplier);
  } else if (robotCount === 2) {
    return Math.ceil((baseChargers + 1) * difficultyMultiplier);
  } else {
    return Math.ceil((baseChargers + 2) * difficultyMultiplier);
  }
};

export const getMaxChargers = (level, optimalChargers) => {
  let multiplier;
  if (level <= 10) multiplier = 2.0;
  else if (level <= 20) multiplier = 1.75;
  else if (level <= 30) multiplier = 1.5;
  else if (level <= 40) multiplier = 1.35;
  else multiplier = 1.25;

  return Math.max(optimalChargers + 2, Math.ceil(multiplier * optimalChargers));
};

export const generateLevel = (level) => {
  const config = getLevelConfig(level);
  const { 
    gridSize, batteryCapacity, robotCount, obstacleDensity, 
    powerDrainCount, boosterCount, hasTeleporters, hasBarriers,
    hasSpeedBoosts, hasBatterySaps, hasWormholes, hasMultipleTargets 
  } = config;

  const obstacles = new Set();
  const powerDrains = new Set();
  const boosters = [];
  const specialCells = [];

  const start = [0, 0];
  const target = [gridSize - 1, gridSize - 1];
  const additionalTargets = [];

  const criticalCells = new Set();
  criticalCells.add(start.toString());
  criticalCells.add(target.toString());

  // Add surrounding cells to critical cells
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    const nx = start[0] + dx, ny = start[1] + dy;
    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
      criticalCells.add([nx, ny].toString());
    }

    const tx = target[0] + dx, ty = target[1] + dy;
    if (tx >= 0 && tx < gridSize && ty >= 0 && ty < gridSize) {
      criticalCells.add([tx, ty].toString());
    }
  });

  // Generate additional targets for higher levels
  if (hasMultipleTargets && robotCount > 1) {
    const targetCount = Math.min(robotCount - 1, 3);
    for (let i = 0; i < targetCount; i++) {
      let newTarget;
      let attempts = 0;
      do {
        newTarget = [
          Math.floor(Math.random() * (gridSize - 4)) + 2,
          Math.floor(Math.random() * (gridSize - 4)) + 2
        ];
        attempts++;
      } while (
        criticalCells.has(newTarget.toString()) || 
        obstacles.has(newTarget.toString()) ||
        attempts < 50
      );
      
      if (newTarget) {
        additionalTargets.push(newTarget);
        criticalCells.add(newTarget.toString());
      }
    }
  }

  const totalCells = gridSize * gridSize;
  const obstacleCount = Math.floor(totalCells * obstacleDensity);

  let attempts = 0;
  while (obstacles.size < obstacleCount && attempts < 200) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const pos = [x, y].toString();

    if (!criticalCells.has(pos)) {
      obstacles.add(pos);
    }
    attempts++;
  }

  attempts = 0;
  while (powerDrains.size < powerDrainCount && attempts < 100) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const pos = [x, y].toString();

    if (!obstacles.has(pos) && !criticalCells.has(pos)) {
      powerDrains.add(pos);
    }
    attempts++;
  }

  attempts = 0;
  while (boosters.length < boosterCount && attempts < 100) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const pos = [x, y];

    if (!obstacles.has(pos.toString()) && !powerDrains.has(pos.toString()) && !criticalCells.has(pos.toString())) {
      // Random booster type based on level
      let boosterType = BoosterType.BATTERY;
      if (level >= 20 && Math.random() < 0.3) {
        boosterType = BoosterType.SPEED;
      }
      boosters.push(new Booster(x, y, boosterType));
    }
    attempts++;
  }

  // Generate special cells based on level
  if (hasTeleporters) {
    const teleporterCount = Math.min(2, Math.floor(gridSize / 8));
    const teleporterPairs = [];
    
    for (let i = 0; i < teleporterCount; i++) {
      const pair = [];
      for (let j = 0; j < 2; j++) {
        let x, y;
        let pos;
        let attempt = 0;
        do {
          x = Math.floor(Math.random() * gridSize);
          y = Math.floor(Math.random() * gridSize);
          pos = [x, y];
          attempt++;
        } while (
          (obstacles.has(pos.toString()) || 
           powerDrains.has(pos.toString()) || 
           criticalCells.has(pos.toString()) ||
           boosters.some(b => b.x === x && b.y === y) ||
           teleporterPairs.some(pair => pair.some(t => t.x === x && t.y === y))) &&
          attempt < 50
        );
        
        if (attempt < 50) {
          pair.push({ x, y });
        }
      }
      
      if (pair.length === 2) {
        const teleporter1 = new SpecialCell(pair[0].x, pair[0].y, SpecialCellType.TELEPORT, 0, pair[1]);
        const teleporter2 = new SpecialCell(pair[1].x, pair[1].y, SpecialCellType.TELEPORT, 0, pair[0]);
        specialCells.push(teleporter1, teleporter2);
        teleporterPairs.push(pair);
      }
    }
  }

  if (hasSpeedBoosts) {
    const speedBoostCount = Math.min(3, Math.floor(gridSize / 6));
    for (let i = 0; i < speedBoostCount; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const pos = [x, y];
      
      if (!obstacles.has(pos.toString()) && !powerDrains.has(pos.toString()) && 
          !criticalCells.has(pos.toString()) && !boosters.some(b => b.x === x && b.y === y) &&
          !specialCells.some(sc => sc.x === x && sc.y === y)) {
        specialCells.push(new SpecialCell(x, y, SpecialCellType.SPEED_BOOST, 5));
      }
    }
  }

  if (hasBatterySaps) {
    const batterySapCount = Math.min(2, Math.floor(gridSize / 10));
    for (let i = 0; i < batterySapCount; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const pos = [x, y];
      
      if (!obstacles.has(pos.toString()) && !powerDrains.has(pos.toString()) && 
          !criticalCells.has(pos.toString()) && !boosters.some(b => b.x === x && b.y === y) &&
          !specialCells.some(sc => sc.x === x && sc.y === y)) {
        specialCells.push(new SpecialCell(x, y, SpecialCellType.BATTERY_SAP, 0));
      }
    }
  }

  if (hasWormholes) {
    const wormholeCount = Math.min(1, Math.floor(gridSize / 12));
    for (let i = 0; i < wormholeCount; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const pos = [x, y];
      
      if (!obstacles.has(pos.toString()) && !powerDrains.has(pos.toString()) && 
          !criticalCells.has(pos.toString()) && !boosters.some(b => b.x === x && b.y === y) &&
          !specialCells.some(sc => sc.x === x && sc.y === y)) {
        // Wormholes teleport to random empty cell
        let targetX, targetY;
        let attempt = 0;
        do {
          targetX = Math.floor(Math.random() * gridSize);
          targetY = Math.floor(Math.random() * gridSize);
          attempt++;
        } while (
          (obstacles.has([targetX, targetY].toString()) || 
           powerDrains.has([targetX, targetY].toString()) || 
           criticalCells.has([targetX, targetY].toString())) &&
          attempt < 30
        );
        
        if (attempt < 30) {
          specialCells.push(new SpecialCell(x, y, SpecialCellType.WORMHOLE, 0, [targetX, targetY]));
        }
      }
    }
  }

  // Create the complete level data
  const levelData = {
    gridSize,
    start,
    target,
    additionalTargets,
    obstacles: Array.from(obstacles).map(pos => pos.split(',').map(Number)),
    powerDrains: Array.from(powerDrains).map(pos => pos.split(',').map(Number)),
    boosters,
    specialCells
  };

  // Generate start positions
  const startPositions = findRandomStartPositions(levelData, robotCount);

  // Calculate optimal chargers using balanced approach
  const optimalChargers = calculateOptimalChargersBalanced(levelData, startPositions, batteryCapacity);
  const maxChargers = getMaxChargers(level, optimalChargers);

  // Add the remaining fields to levelData
  levelData.level = level;
  levelData.batteryCapacity = batteryCapacity;
  levelData.robotCount = robotCount;
  levelData.optimalChargers = optimalChargers;
  levelData.maxChargers = maxChargers;
  levelData.startPositions = startPositions;
  levelData.config = config;

  return levelData;
};

export const findRandomStartPositions = (levelData, robotCount) => {
  const { gridSize, obstacles, powerDrains, target, additionalTargets } = levelData;
  const startPositions = [levelData.start];

  const availablePositions = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const pos = [x, y];
      if (!obstacles.some(obs => obs[0] === x && obs[1] === y) &&
          !powerDrains.some(pd => pd[0] === x && pd[1] === y) &&
          !(pos[0] === target[0] && pos[1] === target[1]) &&
          !additionalTargets.some(at => at[0] === x && at[1] === y) &&
          !startPositions.some(sp => sp[0] === x && sp[1] === y)) {
        availablePositions.push(pos);
      }
    }
  }

  // Shuffle available positions
  for (let i = availablePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
  }

  for (let i = 1; i < robotCount; i++) {
    if (availablePositions.length > 0) {
      startPositions.push(availablePositions.pop());
    } else {
      // Fallback: find any non-obstacle position
      let fallbackPos;
      for (let x = 0; x < gridSize && !fallbackPos; x++) {
        for (let y = 0; y < gridSize && !fallbackPos; y++) {
          const pos = [x, y];
          if (!obstacles.some(obs => obs[0] === x && obs[1] === y) &&
              !(pos[0] === target[0] && pos[1] === target[1])) {
            fallbackPos = pos;
          }
        }
      }
      startPositions.push(fallbackPos || levelData.start);
    }
  }

  return startPositions;
};

export const findOptimalPath = (levelData, fromPos, toPos, avoidPowerDrains = true) => {
  if (!levelData) return null;

  // Use A* algorithm for better pathfinding
  const openSet = new Set([fromPos.toString()]);
  const cameFrom = new Map();
  const gScore = new Map(); // Cost from start to current node
  const fScore = new Map(); // Estimated total cost

  gScore.set(fromPos.toString(), 0);
  fScore.set(fromPos.toString(), heuristic(fromPos, toPos));

  const openSetValues = [{
    pos: fromPos,
    fScore: fScore.get(fromPos.toString())
  }];

  while (openSetValues.length > 0) {
    // Get node with lowest fScore
    openSetValues.sort((a, b) => a.fScore - b.fScore);
    const current = openSetValues.shift();
    const currentStr = current.pos.toString();

    if (current.pos[0] === toPos[0] && current.pos[1] === toPos[1]) {
      return reconstructPath(cameFrom, current.pos);
    }

    openSet.delete(currentStr);

    const neighbors = getNeighbors(levelData, current.pos);
    
    for (const neighbor of neighbors) {
      const neighborStr = neighbor.toString();
      
      // Calculate tentative gScore
      const moveCost = calculateMoveCost(levelData, neighbor, avoidPowerDrains);
      const tentativeGScore = gScore.get(currentStr) + moveCost;

      if (!gScore.has(neighborStr) || tentativeGScore < gScore.get(neighborStr)) {
        cameFrom.set(neighborStr, current.pos);
        gScore.set(neighborStr, tentativeGScore);
        fScore.set(neighborStr, tentativeGScore + heuristic(neighbor, toPos));
        
        if (!openSet.has(neighborStr)) {
          openSet.add(neighborStr);
          openSetValues.push({
            pos: neighbor,
            fScore: fScore.get(neighborStr)
          });
        }
      }
    }
  }

  return null; // No path found
};

const heuristic = (pos, target) => {
  // Manhattan distance
  return Math.abs(pos[0] - target[0]) + Math.abs(pos[1] - target[1]);
};

const getNeighbors = (levelData, pos) => {
  const [x, y] = pos;
  const neighbors = [
    [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
  ];

  return neighbors.filter(([nx, ny]) => 
    nx >= 0 && nx < levelData.gridSize && 
    ny >= 0 && ny < levelData.gridSize &&
    !levelData.obstacles.some(obs => obs[0] === nx && obs[1] === ny)
  );
};

const calculateMoveCost = (levelData, pos, avoidPowerDrains) => {
  let cost = 1;
  
  // Power drains cost more
  if (avoidPowerDrains && levelData.powerDrains.some(pd => pd[0] === pos[0] && pd[1] === pos[1])) {
    cost += 2;
  }
  
  // Special cells might affect cost
  const specialCell = levelData.specialCells.find(sc => 
    sc.x === pos[0] && sc.y === pos[1] && sc.active
  );
  
  if (specialCell) {
    switch (specialCell.type) {
      case SpecialCellType.BATTERY_SAP:
        cost += 1; // Additional cost for battery saps
        break;
      case SpecialCellType.SPEED_BOOST:
        cost -= 0.5; // Reduced cost for speed boosts
        break;
    }
  }
  
  return Math.max(0.1, cost);
};

const reconstructPath = (cameFrom, current) => {
  const path = [current];
  let currentStr = current.toString();
  
  while (cameFrom.has(currentStr)) {
    current = cameFrom.get(currentStr);
    path.unshift(current);
    currentStr = current.toString();
  }
  
  return path;
};

export const findPath = (levelData, fromPos, toPos) => {
  // Try to find path avoiding power drains first
  let path = findOptimalPath(levelData, fromPos, toPos, true);
  
  // If no path found while avoiding power drains, try without avoiding them
  if (!path) {
    path = findOptimalPath(levelData, fromPos, toPos, false);
  }
  
  return path;
};

// Special cell interactions
export const handleSpecialCellInteraction = (robot, specialCell, levelData) => {
  if (!specialCell.active) return null;
  
  switch (specialCell.type) {
    case SpecialCellType.TELEPORT:
      if (specialCell.uses > 0 && specialCell.pairedWith) {
        specialCell.uses--;
        if (specialCell.uses <= 0) {
          specialCell.active = false;
        }
        return {
          newX: specialCell.pairedWith.x,
          newY: specialCell.pairedWith.y,
          message: `Robot ${robot.id + 1} teleported!`,
          sound: 'teleport'
        };
      }
      break;
      
    case SpecialCellType.SPEED_BOOST:
      robot.speedBoost = specialCell.duration;
      return {
        message: `Robot ${robot.id + 1} speed boosted!`,
        sound: 'boost'
      };
      
    case SpecialCellType.BATTERY_SAP:
      const sapAmount = Math.floor(robot.battery * 0.3); // Sap 30% of current battery
      robot.battery = Math.max(0, robot.battery - sapAmount);
      return {
        message: `Robot ${robot.id + 1} battery sapped!`,
        sound: 'powerDrain'
      };
      
    case SpecialCellType.WORMHOLE:
      if (specialCell.pairedWith) {
        return {
          newX: specialCell.pairedWith[0],
          newY: specialCell.pairedWith[1],
          message: `Robot ${robot.id + 1} went through a wormhole!`,
          sound: 'teleport'
        };
      }
      break;
  }
  
  return null;
};

// Helper functions for collision detection
export const handleChargerCollision = (robot, chargers, batteryCapacity) => {
  for (const charger of chargers) {
    if (charger.x === robot.x && charger.y === robot.y) {
      robot.battery = batteryCapacity;
      charger.used = true;
      return {
        charged: true,
        message: `Robot ${robot.id + 1} battery recharged!`,
        sound: 'charge'
      };
    }
  }
  return { charged: false };
};

export const handleBoosterCollision = (robot, boosters, batteryCapacity) => {
  for (const booster of boosters) {
    if (booster.x === robot.x && booster.y === robot.y && !booster.collected) {
      booster.collected = true;
      
      switch (booster.type) {
        case BoosterType.BATTERY:
          robot.battery = Math.min(batteryCapacity, robot.battery + 2);
          return {
            boosted: true,
            message: `Robot ${robot.id + 1} +2 Battery!`,
            sound: 'boost'
          };
          
        case BoosterType.SPEED:
          robot.speedBoost = 5; // 5 moves of speed boost
          return {
            boosted: true,
            message: `Robot ${robot.id + 1} speed boosted!`,
            sound: 'boost'
          };
          
        default:
          return { boosted: false };
      }
    }
  }
  return { boosted: false };
};

export const calculateMovementCost = (robot, powerDrains) => {
  const isOnPowerDrain = powerDrains.some(pd => pd[0] === robot.x && pd[1] === robot.y);
  let cost = isOnPowerDrain ? 2 : 1;
  
  // Apply speed boost reduction
  if (robot.speedBoost > 0) {
    cost = Math.max(0.5, cost * 0.7); // 30% reduction
    robot.speedBoost--;
  }
  
  return cost;
};

// Achievement system
export const ACHIEVEMENTS = [
  new Achievement(
    'first_win', 
    'First Steps', 
    'Complete your first level', 
    (gameStats) => gameStats.levelsCompleted >= 1,
    '🎯'
  ),
  new Achievement(
    'charger_master', 
    'Charger Master', 
    'Complete a level without placing any chargers', 
    (gameStats, levelData) => levelData.chargersPlaced === 0,
    '⚡'
  ),
  new Achievement(
    'speed_runner', 
    'Speed Runner', 
    'Complete a level in under 10 moves', 
    (gameStats, levelData) => levelData.moves <= 10,
    '💨'
  ),
  new Achievement(
    'battery_saver', 
    'Battery Saver', 
    'Complete a level with all robots having more than 50% battery', 
    (gameStats, levelData) => levelData.finalBatteryPercent >= 50,
    '🔋'
  ),
  new Achievement(
    'perfectionist', 
    'Perfectionist', 
    'Get 3 stars on 10 different levels', 
    (gameStats) => gameStats.threeStarLevels >= 10,
    '⭐'
  ),
  new Achievement(
    'robot_master', 
    'Robot Master', 
    'Control 5 or more robots in a single level', 
    (gameStats, levelData) => levelData.robotCount >= 5,
    '🤖'
  ),
  new Achievement(
    'explorer', 
    'Explorer', 
    'Visit every cell on the grid in a single level', 
    (gameStats, levelData) => levelData.cellsVisited >= levelData.gridSize * levelData.gridSize * 0.8,
    '🧭'
  ),
  new Achievement(
    'veteran', 
    'Veteran', 
    'Complete 25 levels', 
    (gameStats) => gameStats.levelsCompleted >= 25,
    '🎖️'
  ),
  new Achievement(
    'legend', 
    'Legend', 
    'Complete all 50 levels', 
    (gameStats) => gameStats.levelsCompleted >= 50,
    '👑'
  ),
  new Achievement(
    'efficient', 
    'Efficient', 
    'Use fewer than optimal chargers on 5 levels', 
    (gameStats) => gameStats.perfectLevels >= 5,
    '🎯'
  ),
  new Achievement(
    'lucky', 
    'Lucky', 
    'Find and use a teleporter', 
    (gameStats, levelData) => levelData.usedTeleporter === true,
    '🍀'
  ),
  new Achievement(
    'avoidance', 
    'Avoidance Master', 
    'Complete a level without hitting any power drains', 
    (gameStats, levelData) => levelData.powerDrainsHit === 0,
    '🛡️'
  )
];

// Utility functions
export const getCellColor = (levelData, x, y, chargers = [], robots = []) => {
  const pos = [x, y];
  
  if (levelData.obstacles.some(obs => obs[0] === x && obs[1] === y)) {
    return COLORS.DARK_GRAY;
  }
  
  if (levelData.powerDrains.some(pd => pd[0] === x && pd[1] === y)) {
    return COLORS.LIGHT_RED;
  }
  
  if (x === levelData.target[0] && y === levelData.target[1]) {
    return COLORS.RED;
  }
  
  if (levelData.additionalTargets.some(at => at[0] === x && at[1] === y)) {
    return COLORS.ORANGE;
  }
  
  if (x === levelData.start[0] && y === levelData.start[1]) {
    return COLORS.LIGHT_GREEN;
  }
  
  if (chargers.some(c => c.x === x && c.y === y)) {
    return COLORS.DARK_GREEN;
  }
  
  const booster = levelData.boosters.find(b => b.x === x && b.y === y && !b.collected);
  if (booster) {
    return booster.type === BoosterType.BATTERY ? COLORS.EMERALD : COLORS.CYAN;
  }
  
  const specialCell = levelData.specialCells.find(sc => 
    sc.x === x && sc.y === y && sc.active
  );
  if (specialCell) {
    switch (specialCell.type) {
      case SpecialCellType.TELEPORT:
        return COLORS.PURPLE;
      case SpecialCellType.SPEED_BOOST:
        return COLORS.CYAN;
      case SpecialCellType.BATTERY_SAP:
        return COLORS.DARK_RED;
      case SpecialCellType.WORMHOLE:
        return COLORS.MAGENTA;
    }
  }
  
  const robotHere = robots.find(r => r.x === x && r.y === y && r.active);
  if (robotHere) {
    return robotHere.color;
  }
  
  return COLORS.WHITE;
};

export const calculateLevelScore = (levelData, moves, chargersPlaced, finalBatteryPercent) => {
  const baseScore = 1000;
  const movePenalty = Math.max(0, moves - levelData.gridSize) * 10;
  const chargerPenalty = Math.max(0, chargersPlaced - levelData.optimalChargers) * 50;
  const batteryBonus = finalBatteryPercent * 2;
  
  return Math.max(0, baseScore - movePenalty - chargerPenalty + batteryBonus);
};

export const isLevelComplete = (robots, levelData) => {
  const activeRobots = robots.filter(r => r.active);
  
  // Check if all active robots are on targets
  const robotsOnTargets = activeRobots.filter(robot => 
    (robot.x === levelData.target[0] && robot.y === levelData.target[1]) ||
    levelData.additionalTargets.some(target => 
      target[0] === robot.x && target[1] === robot.y
    )
  );
  
  return robotsOnTargets.length >= activeRobots.length;
};

export const getAvailableTargets = (levelData) => {
  return [levelData.target, ...levelData.additionalTargets];
};

// Save/Load functionality
export const saveGame = (gameState, currentLevel, starRatings, gameStats, achievements) => {
  const saveData = {
    gameState,
    currentLevel,
    starRatings,
    gameStats,
    achievements: achievements.map(ach => ({
      id: ach.id,
      unlocked: ach.unlocked,
      unlockedAt: ach.unlockedAt,
      progress: ach.progress
    })),
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem('batteryQuestSave', JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

export const loadGame = () => {
  try {
    const saveData = localStorage.getItem('batteryQuestSave');
    if (!saveData) return null;
    
    const parsed = JSON.parse(saveData);
    
    // Reconstruct achievements with proper class instances
    const achievements = ACHIEVEMENTS.map(defaultAch => {
      const savedAch = parsed.achievements.find(ach => ach.id === defaultAch.id);
      if (savedAch) {
        const achievement = new Achievement(
          defaultAch.id,
          defaultAch.name,
          defaultAch.description,
          defaultAch.condition,
          defaultAch.icon
        );
        achievement.unlocked = savedAch.unlocked;
        achievement.unlockedAt = savedAch.unlockedAt;
        achievement.progress = savedAch.progress;
        return achievement;
      }
      return defaultAch;
    });
    
    return {
      gameState: parsed.gameState,
      currentLevel: parsed.currentLevel,
      starRatings: parsed.starRatings,
      gameStats: parsed.gameStats,
      achievements,
      timestamp: parsed.timestamp
    };
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const resetGame = () => {
  try {
    localStorage.removeItem('batteryQuestSave');
    return true;
  } catch (error) {
    console.error('Failed to reset game:', error);
    return false;
  }
};