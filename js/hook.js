class Hook {
  constructor(pivotX, pivotY) {
    this.pivotX = pivotX;
    this.pivotY = pivotY;
    this.angle = 0;
    this.length = MIN_HOOK_LENGTH;
    this.phase = 0;
    this.swingSpeed = 1.5;
    this.maxLength = MAX_HOOK_LENGTH;
    this.state = HOOK_STATE.SWINGING;
    this.grabbed = null;
    this.extendingAt = 0;
    this.retractMult = 1.0;
    this.strengthUses = 0;
    this.extendMult = 1.0;
    this.winchBoost = 1.0;
  }

  get tipX() { return this.pivotX + Math.sin(this.angle) * this.length; }
  get tipY() { return this.pivotY + Math.cos(this.angle) * this.length; }
  get hookAngle() { return this.state === HOOK_STATE.SWINGING ? this.angle : this.extendingAt; }

  reset(levelDef, upgrades) {
    this.state = HOOK_STATE.SWINGING;
    this.length = MIN_HOOK_LENGTH;
    this.grabbed = null;
    this.swingSpeed = levelDef.swingSpeed;
    this.maxLength = (levelDef.maxLength || MAX_HOOK_LENGTH) + (upgrades.chain || 0) * 45;
    this.phase = Math.random() * Math.PI * 2;
    this.angle = 0;
    this.extendMult = 1 + (upgrades.motor || 0) * 0.15;
    this.winchBoost = 1 + (upgrades.winch || 0) * 0.20;
  }

  updateSwing(dt) {
    this.phase += this.swingSpeed * dt;
    this.angle = Math.sin(this.phase) * MAX_SWING_ANGLE;
  }

  shoot(game) {
    if (this.state !== HOOK_STATE.SWINGING) return;
    this.extendingAt = this.angle;
    this.state = HOOK_STATE.EXTENDING;

    // Use strength potion if available
    if (game.inventory.strength_potion > 0 && this.strengthUses <= 0) {
      this.strengthUses = SHOP_ITEM_DEFS[1].effect.uses;
      game.inventory.strength_potion--;
    }
  }

  updateExtending(dt, minerals) {
    const prevTipX = this.tipX;
    const prevTipY = this.tipY;
    this.length += EXTENSION_SPEED * this.extendMult * dt;

    if (this.length >= this.maxLength) {
      this.length = this.maxLength;
      this.state = HOOK_STATE.RETRACTING;
      return;
    }

    for (const m of minerals) {
      if (m.grabbed || m.removed) continue;
      if (segmentCircleIntersection(prevTipX, prevTipY, this.tipX, this.tipY, m.x, m.y, m.radius)) {
        m.grabbed = true;
        this.grabbed = m;
        this.state = HOOK_STATE.RETRACTING;
        return;
      }
    }
  }

  updateRetracting(dt) {
    const weight = this.grabbed ? this.grabbed.weight : 0.5;
    let mult = 1.0;
    if (this.strengthUses > 0) {
      mult = SHOP_ITEM_DEFS[1].effect.multiplier;
    }
    const retractSpeed = (BASE_RETRACT_SPEED / weight) * mult * this.winchBoost;
    this.length -= retractSpeed * dt;

    if (this.grabbed) {
      this.grabbed.x = this.tipX;
      this.grabbed.y = this.tipY;
    }

    if (this.length <= MIN_HOOK_LENGTH) {
      this.length = MIN_HOOK_LENGTH;
      const mineral = this.grabbed;
      this.grabbed = null;
      this.state = HOOK_STATE.SWINGING;
      if (this.strengthUses > 0) {
        this.strengthUses--;
      }
      return { collected: true, mineral: mineral };
    }
    return { collected: false };
  }
}
