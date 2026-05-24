function render() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  switch (game.state) {
    case STATE.TITLE:
      drawBackground();
      drawTitleScreen();
      break;
    case STATE.PLAYING:
    case STATE.LEVEL_COMPLETE:
      drawBackground();
      drawMinerals();
      drawHookRope();
      drawGrabbedMineral();
      drawHookClaw();
      drawDynamite();
      drawParticles();
      drawUI();
      if (levelSplashTimer > 0) drawLevelSplash();
      if (game.state === STATE.LEVEL_COMPLETE) drawLevelCompleteOverlay();
      break;
    case STATE.SHOP:
      drawBackground();
      drawMinerals();
      drawHookRope();
      drawHookClaw();
      drawUI();
      drawShopOverlay();
      break;
    case STATE.GAME_OVER:
      drawBackground();
      drawGameOverOverlay();
      break;
  }
}

// ---- Background ----

function drawBackground() {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, PIVOT_Y + 20);
  skyGrad.addColorStop(0, '#1a237e');
  skyGrad.addColorStop(0.5, '#42a5f5');
  skyGrad.addColorStop(1, '#90caf9');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Ground
  const groundGrad = ctx.createLinearGradient(0, PIVOT_Y + 20, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#8D6E63');
  groundGrad.addColorStop(0.3, '#6D4C41');
  groundGrad.addColorStop(1, '#3E2723');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, PIVOT_Y + 20, CANVAS_WIDTH, CANVAS_HEIGHT - PIVOT_Y - 20);

  // Ground line
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, PIVOT_Y + 20);
  ctx.lineTo(CANVAS_WIDTH, PIVOT_Y + 20);
  ctx.stroke();

  // Dirt texture dots
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  const seed = 42;
  for (let i = 0; i < 80; i++) {
    const sx = ((i * 137 + seed * 53) % CANVAS_WIDTH);
    const sy = PIVOT_Y + 30 + ((i * 97 + seed * 71) % (CANVAS_HEIGHT - PIVOT_Y - 40));
    const sr = 2 + ((i * 43) % 4);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Miner character at pivot
  drawMiner();
}

function drawMiner() {
  const x = PIVOT_X;
  const y = PIVOT_Y - 15;
  const level = game.upgrades ? game.upgrades.miner : 0;

  // Body color by level
  const bodyColors = ['#E65100', '#1565C0', '#F57C00', '#4E342E', '#5D4037', '#FFB300'];
  const bodyColor = bodyColors[level] || bodyColors[0];
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - 10, y - 5, 20, 22);

  // Level 2+: reflective vest stripe
  if (level >= 2) {
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(x - 10, y - 1, 20, 4);
  }

  // Head
  ctx.fillStyle = '#FFCC80';
  ctx.beginPath();
  ctx.arc(x, y - 12, 10, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 3, y - 14, 1.5, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 14, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Level 3+: sunglasses
  if (level >= 3) {
    ctx.fillStyle = '#111';
    ctx.fillRect(x - 6, y - 17, 6, 4);
    ctx.fillRect(x + 1, y - 17, 6, 4);
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 4, y - 18, 10, 2);
  }

  // Hat / Headwear by level
  ctx.fillStyle = ['#5D4037', '#FFC107', '#FFC107', '#3E2723', '#8D6E63', '#FFD700'][level];
  if (level <= 1) {
    // Simple cap
    ctx.fillRect(x - 12, y - 28, 24, 8);
    ctx.fillRect(x - 7, y - 35, 14, 8);
  } else if (level === 2) {
    // Hard hat with headlamp
    ctx.fillRect(x - 13, y - 27, 26, 10);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x - 1, y - 29, 5, 5);
  } else if (level === 3) {
    // Fancy fedora
    ctx.fillRect(x - 14, y - 26, 28, 6);
    ctx.fillRect(x - 9, y - 34, 18, 9);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x - 13, y - 26, 26, 2);
  } else if (level === 4) {
    // Cowboy hat
    ctx.fillRect(x - 15, y - 25, 30, 6);
    ctx.fillRect(x - 8, y - 34, 16, 10);
    ctx.fillRect(x - 17, y - 26, 34, 3);
  } else if (level >= 5) {
    // Crown
    ctx.fillRect(x - 10, y - 30, 20, 5);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x - 5 + i * 5, y - 37 + i * 3, 5, 8 - i * 2);
    }
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x - 6, y - 36, 3, 3);
    ctx.fillRect(x + 3, y - 36, 3, 3);
    ctx.fillStyle = '#00F';
    ctx.fillRect(x - 1, y - 36, 3, 3);
  }

  // Level 4+: gold chain necklace
  if (level >= 4) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 5, 8, Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();
  }

  // Level 5: cape
  if (level >= 5) {
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 6);
    ctx.lineTo(x - 20, y + 15);
    ctx.lineTo(x + 20, y + 15);
    ctx.lineTo(x + 10, y - 6);
    ctx.fill();
    // Gold trim
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ---- Minerals ----

function drawMinerals() {
  for (const m of game.minerals) {
    if (m.grabbed) continue;
    drawMineral(m);
  }
}

function drawMineral(m) {
  ctx.save();
  ctx.translate(m.x, m.y);

  if (m.type === 'diamond') {
    // Sparkle animation
    const sparkle = Math.sin(game.hook.phase * 3 + m.sparklePhase) * 0.3 + 0.7;
    // Diamond shape (rotated square)
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = m.color;
    ctx.globalAlpha = 0.7 + sparkle * 0.3;
    ctx.fillRect(-m.radius * 0.7, -m.radius * 0.7, m.radius * 1.4, m.radius * 1.4);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(-m.radius * 0.2, -m.radius * 0.2, m.radius * 0.4, m.radius * 0.4);
    ctx.globalAlpha = 1;
    // Outline
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-m.radius * 0.7, -m.radius * 0.7, m.radius * 1.4, m.radius * 1.4);
  } else if (m.type === 'stone') {
    // Irregular stone shape
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      const rr = m.radius * (0.82 + 0.18 * Math.sin(a * 5 + m.sparklePhase));
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Highlight crack
    ctx.beginPath();
    ctx.moveTo(-m.radius * 0.3, -m.radius * 0.4);
    ctx.lineTo(m.radius * 0.1, -m.radius * 0.1);
    ctx.lineTo(m.radius * 0.3, -m.radius * 0.3);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // Gold: circle with highlight
    ctx.beginPath();
    ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Highlight crescent
    ctx.beginPath();
    ctx.arc(-m.radius * 0.25, -m.radius * 0.25, m.radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  }

  // Value label
  if (!m.grabbed) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('$' + m.value, 0, m.radius + 5);
  }

  ctx.restore();
}

// ---- Hook ----

function drawHookRope() {
  const hook = game.hook;
  const chainLevel = game.upgrades ? game.upgrades.chain : 0;
  // Pulley wheel
  ctx.beginPath();
  ctx.arc(hook.pivotX, hook.pivotY, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#444';
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Wheel spokes
  ctx.beginPath();
  ctx.moveTo(hook.pivotX - 5, hook.pivotY);
  ctx.lineTo(hook.pivotX + 5, hook.pivotY);
  ctx.moveTo(hook.pivotX, hook.pivotY - 5);
  ctx.lineTo(hook.pivotX, hook.pivotY + 5);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Rope — color and thickness based on chain level
  const ropeColors = ['#4E342E', '#8D6E63', '#BDBDBD', '#FFD700'];
  const ropeWidths = [2.5, 3, 3.5, 4];
  ctx.beginPath();
  ctx.moveTo(hook.pivotX, hook.pivotY);
  ctx.lineTo(hook.tipX, hook.tipY);
  ctx.strokeStyle = ropeColors[chainLevel] || ropeColors[0];
  ctx.lineWidth = ropeWidths[chainLevel] || ropeWidths[0];
  ctx.stroke();

  // Draw chain links for level 2+
  if (chainLevel >= 2) {
    const len = hook.length;
    const a = hook.hookAngle;
    const steps = Math.floor(len / 20);
    ctx.fillStyle = chainLevel >= 3 ? '#FFD700' : '#E0E0E0';
    for (let i = 0; i < steps; i++) {
      const lx = hook.pivotX + Math.sin(a) * (i * 20 + 10);
      const ly = hook.pivotY + Math.cos(a) * (i * 20 + 10);
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawHookClaw() {
  const hook = game.hook;
  const tipX = hook.tipX;
  const tipY = hook.tipY;
  const a = hook.hookAngle;
  const clawLen = 10;

  // Claw arms
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX + Math.sin(a - 0.5) * clawLen, tipY + Math.cos(a - 0.5) * clawLen);
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX + Math.sin(a + 0.5) * clawLen, tipY + Math.cos(a + 0.5) * clawLen);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Claw joint circle
  ctx.beginPath();
  ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#666';
  ctx.fill();
}

function drawGrabbedMineral() {
  const hook = game.hook;
  if (!hook.grabbed) return;
  drawMineral(hook.grabbed);
}

// ---- Dynamite ----

function drawDynamite() {
  if (!game.dynamiteActive) return;
  const b = game.dynamiteActive;
  ctx.save();
  ctx.translate(b.x, b.y);

  // Bomb body
  ctx.fillStyle = '#E53935';
  ctx.fillRect(-6, -12, 12, 18);
  // Highlight
  ctx.fillStyle = '#EF5350';
  ctx.fillRect(-3, -10, 4, 8);
  // Fuse
  ctx.strokeStyle = '#795548';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(3, -20);
  ctx.stroke();
  // Spark
  ctx.fillStyle = '#FFC107';
  ctx.beginPath();
  ctx.arc(3, -21, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(3, -21, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---- Particles ----

function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---- UI Bar ----

function drawUI() {
  // Background bar
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 48);

  ctx.fillStyle = '#FFF';
  ctx.textBaseline = 'middle';

  // Level
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(STR.ui.level + ' ' + game.level, 15, 24);

  // Score / Target
  ctx.fillText(STR.ui.score + ': $' + game.score + ' / $' + game.targetScore, 115, 24);

  // Timer
  const timeLeft = Math.ceil(game.timeRemaining);
  if (timeLeft <= 10) {
    ctx.fillStyle = timeLeft % 2 === 0 ? '#FF5252' : '#FFF';
  }
  ctx.textAlign = 'center';
  ctx.fillText(STR.ui.time + ': ' + timeLeft + 's', 440, 24);
  ctx.fillStyle = '#FFF';

  // Money
  ctx.textAlign = 'right';
  ctx.fillText(STR.ui.money + ': $' + game.money, 590, 24);

  // Freeze indicator
  if (game.timeFreezeRemaining > 0) {
    ctx.fillStyle = '#64B5F6';
    ctx.fillText(STR.ui.frozen + ' ' + Math.ceil(game.timeFreezeRemaining) + 's', 730, 24);
  }

  // Inventory icons (bottom row)
  const invX = 15;
  const invY = 54;
  ctx.textAlign = 'left';
  ctx.font = '11px Arial';
  const invItems = [
    { id: 'dynamite', label: '炸', color: '#E53935' },
    { id: 'strength_potion', label: '力', color: '#43A047' },
    { id: 'lucky_clover', label: '幸', color: '#7CB342' },
    { id: 'time_freeze', label: '冻', color: '#1E88E5' },
  ];
  for (let i = 0; i < invItems.length; i++) {
    const ix = invX + i * 45;
    // Icon background
    ctx.fillStyle = invItems[i].color;
    ctx.fillRect(ix, invY, 22, 22);
    // Count
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(invItems[i].label, ix + 11, invY + 14);
    ctx.font = '10px Arial';
    ctx.fillText('x' + game.inventory[invItems[i].id], ix + 11, invY + 28);
    ctx.textAlign = 'left';
  }
}

// ---- Overlay screens ----

function drawTitleScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(STR.ui.title, CANVAS_WIDTH / 2, 200);

  ctx.fillStyle = '#FFF';
  ctx.font = '18px Arial';
  ctx.fillText(STR.ui.subtitle, CANVAS_WIDTH / 2, 310);

  ctx.font = '14px Arial';
  for (let i = 0; i < STR.ui.instructions.length; i++) {
    ctx.fillText(STR.ui.instructions[i], CANVAS_WIDTH / 2, 380 + i * 25);
  }

  const alpha = Math.sin(Date.now() / 500) * 0.4 + 0.6;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 22px Arial';
  ctx.fillText(STR.ui.start_prompt, CANVAS_WIDTH / 2, 500);
  ctx.globalAlpha = 1;
}

function drawLevelSplash() {
  const alpha = Math.min(1, levelSplashTimer / 0.5);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(STR.ui.level_splash(game.level), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.fillStyle = '#FFF';
  ctx.font = '18px Arial';
  ctx.fillText(STR.ui.target_label(game.targetScore), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
  ctx.globalAlpha = 1;
}

function drawLevelCompleteOverlay() {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const passed = game.score >= game.targetScore;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (passed) {
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(STR.ui.level_complete, CANVAS_WIDTH / 2, 200);
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText(STR.ui.score_line(game.score, game.targetScore), CANVAS_WIDTH / 2, 250);
  } else {
    ctx.fillStyle = '#F44336';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(STR.ui.times_up, CANVAS_WIDTH / 2, 200);
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText(STR.ui.needed_line(game.score, game.targetScore), CANVAS_WIDTH / 2, 250);
  }

  ctx.fillStyle = '#FFD700';
  ctx.font = '18px Arial';
  ctx.fillText(STR.ui.continue_prompt, CANVAS_WIDTH / 2, 320);
}

function drawShopOverlay() {
  ctx.fillStyle = 'rgba(0,0,0,0.78)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Title
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(STR.ui.shop, CANVAS_WIDTH / 2, 50);

  // Money display
  ctx.fillStyle = '#FFF';
  ctx.font = '16px Arial';
  ctx.fillText(STR.ui.money + ': $' + game.money + '  |  ' + STR.ui.level + ' ' + (game.level + 1), CANVAS_WIDTH / 2, 85);

  // ---- Tab bar ----
  const itemsTabHover = isInRect(mouseX, mouseY, 220, 102, 160, 32);
  const upgradesTabHover = isInRect(mouseX, mouseY, 420, 102, 160, 32);
  const activeTab = game.shopTab || 'items';

  // Items tab
  ctx.fillStyle = activeTab === 'items' ? '#FFD700' : (itemsTabHover ? '#AAA' : '#888');
  ctx.fillRect(220, 102, 160, 32);
  ctx.fillStyle = activeTab === 'items' ? '#000' : '#FFF';
  ctx.font = 'bold 15px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(STR.ui.items_tab, 300, 122);

  // Upgrades tab
  ctx.fillStyle = activeTab === 'upgrades' ? '#FFD700' : (upgradesTabHover ? '#AAA' : '#888');
  ctx.fillRect(420, 102, 160, 32);
  ctx.fillStyle = activeTab === 'upgrades' ? '#000' : '#FFF';
  ctx.fillText(STR.ui.upgrades_tab, 500, 122);

  ctx.textAlign = 'left';

  // Cards based on active tab
  if (activeTab === 'items') {
    for (let i = 0; i < SHOP_ITEM_DEFS.length; i++) {
      drawItemCard(i);
    }
  } else {
    for (let i = 0; i < UPGRADE_DEFS.length; i++) {
      drawUpgradeCard(i);
    }
  }

  // Start button
  const btnX = 300;
  const btnY = 530;
  const btnW = 200;
  const btnH = 45;
  const hover = isInRect(mouseX, mouseY, btnX, btnY, btnW, btnH);
  ctx.fillStyle = hover ? '#66BB6A' : '#4CAF50';
  ctx.fillRect(btnX, btnY, btnW, btnH);
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 2;
  ctx.strokeRect(btnX, btnY, btnW, btnH);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(STR.ui.start_btn + ' (' + STR.ui.level + ' ' + (game.level + 1) + ')', CANVAS_WIDTH / 2, btnY + btnH / 2 + 1);
  ctx.textAlign = 'left';
}

function drawItemCard(index) {
  const item = SHOP_ITEM_DEFS[index];
  const info = STR.items[item.id];
  const cardX = 50 + index * 185;
  const cardY = 150;
  const cardW = 165;
  const cardH = 340;

  const hover = isInRect(mouseX, mouseY, cardX, cardY, cardW, cardH);
  const canAfford = game.money >= item.cost;

  ctx.fillStyle = hover ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = canAfford ? 'rgba(255,255,255,0.4)' : 'rgba(255,100,100,0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // Icon
  const iconColors = ['#E53935', '#43A047', '#7CB342', '#1E88E5'];
  const iconLabels = ['炸', '力', '幸', '冻'];
  ctx.fillStyle = iconColors[index];
  ctx.fillRect(cardX + 55, cardY + 15, 55, 55);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconLabels[index], cardX + 82, cardY + 42);

  // Name
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 15px Arial';
  ctx.fillText(info.name, cardX + cardW / 2, cardY + 90);

  // Description
  ctx.font = '11px Arial';
  ctx.fillStyle = '#CCC';
  wrapText(info.desc, cardX + cardW / 2, cardY + 120, cardW - 20, 14);

  // Cost
  ctx.fillStyle = canAfford ? '#FFD700' : '#F44336';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('$' + item.cost, cardX + cardW / 2, cardY + 210);

  // Owned count
  ctx.fillStyle = '#FFF';
  ctx.font = '14px Arial';
  ctx.fillText(STR.ui.owned + ': ' + game.inventory[item.id], cardX + cardW / 2, cardY + 240);

  // Buy prompt
  if (canAfford) {
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(STR.ui.buy, cardX + cardW / 2, cardY + 265);
  }

  ctx.textAlign = 'left';
}

function drawUpgradeCard(index) {
  const def = UPGRADE_DEFS[index];
  const info = STR.upgrades[def.id];
  const level = game.upgrades[def.id];
  const maxed = level >= def.maxLevel;
  const cost = maxed ? 0 : def.costs[level];
  const canAfford = !maxed && game.money >= cost;

  const cardX = 50 + index * 185;
  const cardY = 150;
  const cardW = 165;
  const cardH = 340;

  const hover = isInRect(mouseX, mouseY, cardX, cardY, cardW, cardH);

  ctx.fillStyle = maxed ? 'rgba(255,215,0,0.1)' : (hover ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)');
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = maxed ? '#FFD700' : (canAfford ? 'rgba(255,255,255,0.4)' : 'rgba(255,100,100,0.4)');
  ctx.lineWidth = maxed ? 2 : 1.5;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // Level indicator (stars)
  const iconColors = ['#F57C00', '#FF9800', '#FFC107'];
  ctx.textAlign = 'center';
  ctx.font = '20px Arial';
  for (let s = 0; s < def.maxLevel; s++) {
    ctx.fillStyle = s < level ? '#FFD700' : '#555';
    ctx.fillText('★', cardX + 40 + s * 28, cardY + 35);
  }

  // Name
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 15px Arial';
  ctx.fillText(info.name, cardX + cardW / 2, cardY + 65);

  // Current level text
  ctx.fillStyle = '#FFD700';
  ctx.font = '12px Arial';
  ctx.fillText('Lv.' + level + '/' + def.maxLevel, cardX + cardW / 2, cardY + 85);

  // Description
  ctx.font = '11px Arial';
  ctx.fillStyle = '#CCC';
  wrapText(info.desc, cardX + cardW / 2, cardY + 120, cardW - 20, 14);

  // Price or maxed
  if (maxed) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(STR.ui.maxed, cardX + cardW / 2, cardY + 210);
  } else {
    ctx.fillStyle = canAfford ? '#FFD700' : '#F44336';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('$' + cost, cardX + cardW / 2, cardY + 210);

    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.fillText(STR.ui.owned + ': ' + level, cardX + cardW / 2, cardY + 240);

    if (canAfford) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(STR.ui.buy, cardX + cardW / 2, cardY + 265);
    }
  }

  ctx.textAlign = 'left';
}

function wrapText(text, cx, y, maxWidth, lineHeight) {
  const hasSpaces = text.includes(' ');
  const words = hasSpaces ? text.split(' ') : text.split('');
  let line = '';
  let currentY = y;
  const sep = hasSpaces ? ' ' : '';
  ctx.textAlign = 'center';
  for (const word of words) {
    const testLine = line + word + sep;
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), cx, currentY);
      line = word + sep;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), cx, currentY);
}

function drawGameOverOverlay() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#F44336';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(STR.ui.game_over, CANVAS_WIDTH / 2, 200);

  ctx.fillStyle = '#FFF';
  ctx.font = '22px Arial';
  ctx.fillText(STR.ui.final_score(game.money), CANVAS_WIDTH / 2, 260);
  ctx.fillText(STR.ui.reached_level(game.level), CANVAS_WIDTH / 2, 295);

  const alpha = Math.sin(Date.now() / 500) * 0.4 + 0.6;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(STR.ui.restart, CANVAS_WIDTH / 2, 370);
  ctx.globalAlpha = 1;
}
