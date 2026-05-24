const LEVEL_DEFS = [
  {
    level: 1,
    targetScore: 600,
    timeLimit: 65,
    swingSpeed: 1.5,
    maxLength: 420,
    mineralCounts: { small_gold: 10, medium_gold: 3, large_gold: 1, diamond: 1, stone: 2 },
  },
  {
    level: 2,
    targetScore: 750,
    timeLimit: 60,
    swingSpeed: 1.7,
    maxLength: 420,
    mineralCounts: { small_gold: 8, medium_gold: 5, large_gold: 2, diamond: 1, stone: 4 },
  },
  {
    level: 3,
    targetScore: 900,
    timeLimit: 55,
    swingSpeed: 1.9,
    maxLength: 420,
    mineralCounts: { small_gold: 6, medium_gold: 5, large_gold: 3, diamond: 1, stone: 5 },
  },
  {
    level: 4,
    targetScore: 1100,
    timeLimit: 50,
    swingSpeed: 2.1,
    maxLength: 420,
    mineralCounts: { small_gold: 5, medium_gold: 4, large_gold: 4, diamond: 1, stone: 6 },
  },
  {
    level: 5,
    targetScore: 1300,
    timeLimit: 50,
    swingSpeed: 2.3,
    maxLength: 420,
    mineralCounts: { small_gold: 4, medium_gold: 4, large_gold: 5, diamond: 0, stone: 7 },
  },
];

function generateLevel(levelNum) {
  const scale = 1 + (levelNum - 5) * 0.12;
  return {
    level: levelNum,
    targetScore: Math.floor(1300 * scale),
    timeLimit: Math.max(30, Math.floor(50 - (levelNum - 5) * 2)),
    swingSpeed: Math.min(4.0, 2.3 + (levelNum - 5) * 0.2),
    maxLength: 420,
    mineralCounts: {
      small_gold: Math.max(2, 4 - Math.floor((levelNum - 5) * 0.3)),
      medium_gold: Math.max(2, 4 - Math.floor((levelNum - 5) * 0.2)),
      large_gold: Math.min(8, 5 + Math.floor((levelNum - 5) * 0.3)),
      diamond: levelNum % 3 === 0 ? 1 : 0,
      stone: Math.min(12, 7 + Math.floor((levelNum - 5) * 0.5)),
    },
  };
}

function getLevelDef(levelNum) {
  if (levelNum <= LEVEL_DEFS.length) {
    return LEVEL_DEFS[levelNum - 1];
  }
  return generateLevel(levelNum);
}
