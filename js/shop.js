function handleShopClick(mx, my) {
  // Tab switching
  if (isInRect(mx, my, 220, 102, 160, 32)) {
    game.shopTab = 'items';
    return;
  }
  if (isInRect(mx, my, 420, 102, 160, 32)) {
    game.shopTab = 'upgrades';
    return;
  }

  if (game.shopTab === 'items') {
    // Item cards
    for (let i = 0; i < SHOP_ITEM_DEFS.length; i++) {
      const cardX = 50 + i * 185;
      const cardY = 150;
      const cardW = 165;
      const cardH = 340;
      if (isInRect(mx, my, cardX, cardY, cardW, cardH)) {
        buyItem(i);
        return;
      }
    }
  } else {
    // Upgrade cards
    for (let i = 0; i < UPGRADE_DEFS.length; i++) {
      const cardX = 50 + i * 185;
      const cardY = 150;
      const cardW = 165;
      const cardH = 340;
      if (isInRect(mx, my, cardX, cardY, cardW, cardH)) {
        buyUpgrade(i);
        return;
      }
    }
  }

  // "Start Next Level" button
  if (isInRect(mx, my, 300, 530, 200, 45)) {
    nextLevel();
  }
}

function buyItem(index) {
  const item = SHOP_ITEM_DEFS[index];
  if (game.money >= item.cost) {
    game.money -= item.cost;
    game.inventory[item.id]++;
  }
}

function buyUpgrade(index) {
  const def = UPGRADE_DEFS[index];
  const currentLevel = game.upgrades[def.id];
  if (currentLevel >= def.maxLevel) return;
  const cost = def.costs[currentLevel];
  if (game.money >= cost) {
    game.money -= cost;
    game.upgrades[def.id]++;
  }
}
