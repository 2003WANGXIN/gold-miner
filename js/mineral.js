class Mineral {
  constructor(typeKey, x, y) {
    const def = MINERAL_TYPES[typeKey];
    this.type = typeKey;
    this.x = x;
    this.y = y;
    this.radius = def.radius;
    this.weight = def.weight;
    this.value = randInt(def.minVal, def.maxVal);
    this.color = def.color;
    this.highlight = def.highlight;
    this.name = def.name;
    this.grabbed = false;
    this.sparklePhase = Math.random() * Math.PI * 2;
    this.removed = false; // marked for removal by dynamite
  }
}

function createMinerals(levelDef) {
  const minerals = [];
  const { mineralCounts } = levelDef;
  const area = PLAY_AREA;

  function tryPlace(typeKey) {
    const def = MINERAL_TYPES[typeKey];
    for (let attempt = 0; attempt < 200; attempt++) {
      const x = randRange(area.xMin + def.radius, area.xMax - def.radius);
      const y = randRange(area.yMin + def.radius, area.yMax - def.radius);

      let overlaps = false;
      for (const m of minerals) {
        const dist = Math.hypot(m.x - x, m.y - y);
        if (dist < m.radius + def.radius + 6) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        const mineral = new Mineral(typeKey, x, y);
        minerals.push(mineral);
        return;
      }
    }
  }

  for (const [type, count] of Object.entries(mineralCounts)) {
    for (let i = 0; i < count; i++) {
      tryPlace(type);
    }
  }

  return minerals;
}
