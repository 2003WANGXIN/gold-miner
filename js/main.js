const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let game;
let lastTimestamp = 0;
let particles = [];
let levelSplashTimer = 0;

function initGame() {
  game = {
    state: STATE.TITLE,
    level: 1,
    score: 0,
    money: 0,
    targetScore: 0,
    timeRemaining: 0,
    minerals: [],
    hook: new Hook(PIVOT_X, PIVOT_Y),
    inventory: { dynamite: 0, strength_potion: 0, lucky_clover: 0, time_freeze: 0 },
    dynamiteActive: null,
    timeFreezeRemaining: 0,
    upgrades: { chain: 0, motor: 0, winch: 0, miner: 0 },
    shopTab: 'items',
  };
  particles = [];
  levelSplashTimer = 0;
}

// ---- State transitions ----

function changeState(newState) {
  game.state = newState;
  switch (newState) {
    case STATE.PLAYING:
      enterPlaying();
      break;
    case STATE.SHOP:
      game.shopTab = 'items';
      break;
    case STATE.TITLE:
      initGame();
      break;
    case STATE.LEVEL_COMPLETE:
      break;
    case STATE.GAME_OVER:
      break;
  }
}

function enterPlaying() {
  const levelDef = getLevelDef(game.level);
  game.targetScore = levelDef.targetScore;
  game.timeRemaining = levelDef.timeLimit;
  game.score = 0;
  game.minerals = createMinerals(levelDef);
  game.hook.reset(levelDef, game.upgrades);
  game.dynamiteActive = null;
  game.timeFreezeRemaining = 0;
  levelSplashTimer = 1.5;
}

function nextLevel() {
  game.level++;
  changeState(STATE.PLAYING);
}

// ---- Main loop ----

function gameLoop(timestamp) {
  const rawDt = (timestamp - lastTimestamp) / 1000;
  const dt = Math.min(rawDt, 0.1);
  lastTimestamp = timestamp;

  const justClicked = mouseJustClicked;
  mouseJustClicked = false;
  handleInput(justClicked);
  update(dt);
  render();
  updateInputState();
  updateTouchButtons();

  requestAnimationFrame(gameLoop);
}

function handleInput(justClicked) {
  switch (game.state) {
    case STATE.TITLE:
      if (justClicked || justPressed(' ')) {
        game.level = 1;
        game.money = 0;
        game.inventory = { dynamite: 0, strength_potion: 0, lucky_clover: 0, time_freeze: 0 };
        game.upgrades = { chain: 0, motor: 0, winch: 0, miner: 0 };
        changeState(STATE.PLAYING);
      }
      break;

    case STATE.PLAYING:
      if (justClicked || justPressed(' ')) {
        game.hook.shoot(game);
      }
      if ((justPressed('d') || btnDynamitePressed) && game.dynamiteActive === null && game.inventory.dynamite > 0) {
        game.inventory.dynamite--;
        game.dynamiteActive = { x: PIVOT_X, y: PIVOT_Y, vy: 400 };
      }
      if ((justPressed('f') || btnFreezePressed) && game.inventory.time_freeze > 0) {
        game.inventory.time_freeze--;
        game.timeFreezeRemaining += SHOP_ITEM_DEFS[3].effect.duration;
      }
      btnDynamitePressed = false;
      btnFreezePressed = false;
      break;

    case STATE.LEVEL_COMPLETE:
      if (justClicked || justPressed(' ')) {
        if (game.score >= game.targetScore) {
          changeState(STATE.SHOP);
        } else {
          changeState(STATE.GAME_OVER);
        }
      }
      break;

    case STATE.SHOP:
      if (justClicked) {
        handleShopClick(mouseX, mouseY);
      }
      break;

    case STATE.GAME_OVER:
      if (justClicked || justPressed(' ')) {
        changeState(STATE.TITLE);
      }
      break;
  }
}

function update(dt) {
  // Update particles in all states
  updateParticles(dt);

  // Update level splash
  if (levelSplashTimer > 0) {
    levelSplashTimer -= dt;
  }

  if (game.state === STATE.PLAYING) {
    updatePlaying(dt);
  }
}

function updatePlaying(dt) {
  // Timer
  if (game.timeFreezeRemaining > 0) {
    game.timeFreezeRemaining -= dt;
  } else {
    game.timeRemaining -= dt;
  }

  // Hook
  const hook = game.hook;
  switch (hook.state) {
    case HOOK_STATE.SWINGING:
      hook.updateSwing(dt);
      break;

    case HOOK_STATE.EXTENDING:
      hook.updateExtending(dt, game.minerals);
      break;

    case HOOK_STATE.RETRACTING:
      const result = hook.updateRetracting(dt);
      if (result.collected && result.mineral) {
        let earned = result.mineral.value;
        // Lucky clover
        if (game.inventory.lucky_clover > 0) {
          earned *= SHOP_ITEM_DEFS[2].effect.multiplier;
          game.inventory.lucky_clover--;
        }
        game.score += earned;
        game.money += earned;
        // Remove mineral and spawn particles
        spawnCollectParticles(result.mineral.x, result.mineral.y, result.mineral.color);
        game.minerals = game.minerals.filter(m => m !== result.mineral);
      }
      break;
  }

  // Dynamite
  if (game.dynamiteActive) {
    const bomb = game.dynamiteActive;
    bomb.y += bomb.vy * dt;
    // Check collision with minerals or ground
    let exploded = false;
    for (const m of game.minerals) {
      if (m.grabbed || m.removed) continue;
      if (Math.hypot(bomb.x - m.x, bomb.y - m.y) < m.radius + 10) {
        explode(bomb, game.minerals);
        exploded = true;
        break;
      }
    }
    if (!exploded && bomb.y > PLAY_AREA.yMax) {
      explode(bomb, game.minerals);
      exploded = true;
    }
    if (exploded) {
      game.dynamiteActive = null;
    }
  }

  // Check level end
  if (game.timeRemaining <= 0) {
    game.timeRemaining = 0;
    changeState(STATE.LEVEL_COMPLETE);
  }
}

function explode(bomb, minerals) {
  const blastRadius = SHOP_ITEM_DEFS[0].effect.blastRadius;
  spawnExplosionParticles(bomb.x, bomb.y);
  for (const m of minerals) {
    if (m.grabbed || m.removed) continue;
    if (Math.hypot(bomb.x - m.x, bomb.y - m.y) < blastRadius) {
      m.removed = true;
      spawnCollectParticles(m.x, m.y, m.color);
    }
  }
  // Actually remove them
  for (let i = minerals.length - 1; i >= 0; i--) {
    if (minerals[i].removed) {
      minerals.splice(i, 1);
    }
  }
}

// ---- Particles ----

function spawnCollectParticles(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + randRange(-0.3, 0.3);
    const speed = randRange(80, 200);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randRange(0.3, 0.6),
      maxLife: 0.6,
      color,
      radius: randRange(2, 5),
    });
  }
}

function spawnExplosionParticles(x, y) {
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + randRange(-0.2, 0.2);
    const speed = randRange(100, 300);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randRange(0.4, 0.8),
      maxLife: 0.8,
      color: i % 2 === 0 ? '#FF5722' : '#FFC107',
      radius: randRange(3, 6),
    });
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
}

function updateTouchButtons() {
  const btnD = document.getElementById('btnDynamite');
  const btnF = document.getElementById('btnFreeze');
  if (!btnD && !btnF) return;

  const inGame = game.state === STATE.PLAYING;
  const hasD = game.inventory.dynamite > 0;
  const hasF = game.inventory.time_freeze > 0;
  const dynamiteActive = game.dynamiteActive !== null;

  if (btnD) {
    btnD.style.display = inGame ? '' : 'none';
    btnD.style.opacity = hasD && !dynamiteActive ? '1' : '0.4';
    btnD.textContent = '炸x' + game.inventory.dynamite;
  }
  if (btnF) {
    btnF.style.display = inGame ? '' : 'none';
    btnF.style.opacity = hasF ? '1' : '0.4';
    btnF.textContent = '冻x' + game.inventory.time_freeze;
  }
}

function resizeCanvas() {
  const hasTouchControls = window.matchMedia('(pointer: coarse)').matches;
  const isLandscape = window.innerWidth > window.innerHeight;

  let availW = window.innerWidth;
  let availH = window.innerHeight;

  // Reserve space for touch buttons on mobile portrait
  if (hasTouchControls && !isLandscape) {
    availH -= 60;
  }

  const ratio = CANVAS_WIDTH / CANVAS_HEIGHT;
  let w, h;
  if (availW / availH > ratio) {
    h = availH;
    w = h * ratio;
  } else {
    w = availW;
    h = w / ratio;
  }

  canvas.style.width = Math.floor(w) + 'px';
  canvas.style.height = Math.floor(h) + 'px';
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', function () {
  setTimeout(resizeCanvas, 100);
});

// ---- Bootstrap ----

function start() {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  resizeCanvas();
  setupInput(canvas);
  initGame();
  lastTimestamp = performance.now();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load', start);
