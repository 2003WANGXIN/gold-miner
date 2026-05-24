// Canvas
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Hook
const PIVOT_X = 400;
const PIVOT_Y = 70;
const MAX_SWING_ANGLE = 1.4;
const EXTENSION_SPEED = 550;
const BASE_RETRACT_SPEED = 280;
const MIN_HOOK_LENGTH = 40;
const MAX_HOOK_LENGTH = 420;

// Game states
const STATE = {
  TITLE: 0,
  PLAYING: 1,
  LEVEL_COMPLETE: 2,
  SHOP: 3,
  GAME_OVER: 4,
};

// Hook states
const HOOK_STATE = {
  SWINGING: 0,
  EXTENDING: 1,
  RETRACTING: 2,
};

// Mineral type definitions
const MINERAL_TYPES = {
  small_gold:  { radius: 14, weight: 1.0,  minVal: 25,  maxVal: 100,  color: '#FFD700', highlight: '#FFF176' },
  medium_gold: { radius: 20, weight: 2.0,  minVal: 150, maxVal: 300,  color: '#FFB300', highlight: '#FFD54F' },
  large_gold:  { radius: 28, weight: 4.0,  minVal: 500, maxVal: 800,  color: '#FF8F00', highlight: '#FFB300' },
  diamond:     { radius: 10, weight: 0.5,  minVal: 500, maxVal: 1000, color: '#00E5FF', highlight: '#B2FFFF' },
  stone:       { radius: 24, weight: 8.0,  minVal: 10,  maxVal: 50,   color: '#757575', highlight: '#9E9E9E' },
};

// Shop item definitions
const SHOP_ITEM_DEFS = [
  {
    id: 'dynamite',
    cost: 150,
    usage: 'active',
    hotkey: 'D',
    effect: { blastRadius: 70 },
  },
  {
    id: 'strength_potion',
    cost: 200,
    usage: 'passive',
    effect: { multiplier: 2, uses: 5 },
  },
  {
    id: 'lucky_clover',
    cost: 280,
    usage: 'passive',
    effect: { multiplier: 3 },
  },
  {
    id: 'time_freeze',
    cost: 220,
    usage: 'active',
    hotkey: 'F',
    effect: { duration: 8 },
  },
];

// Playable area for mineral placement
const PLAY_AREA = { xMin: 70, xMax: 730, yMin: 160, yMax: 500 };

// ---- Chinese Strings ----
const STR = {
  mineral: {
    small_gold: '小金块',
    medium_gold: '金块',
    large_gold: '大金块',
    diamond: '钻石',
    stone: '石头',
  },
  items: {
    dynamite: { name: '炸药', desc: '投下炸弹，炸毁范围内的矿物（无得分）。' },
    strength_potion: { name: '力量药水', desc: '接下来5次回收速度翻倍。' },
    lucky_clover: { name: '幸运草', desc: '下一次收集的矿物价值3倍。' },
    time_freeze: { name: '时间冻结', desc: '冻结计时器8秒。' },
  },
  upgrades: {
    chain: { name: '强化链条', desc: '增加钩子最大长度（每级+45px）' },
    motor: { name: '加速马达', desc: '提升延伸速度（每级+15%）' },
    winch: { name: '强力绞盘', desc: '提升回收速度（每级+20%）' },
    miner: { name: '矿工外观', desc: '升级矿工的外观造型' },
  },
  ui: {
    level: '关卡',
    score: '分数',
    target: '目标',
    time: '时间',
    money: '金币',
    frozen: '冻结',
    shop: '商店',
    items_tab: '道  具',
    upgrades_tab: '升  级',
    start_btn: '开始下一关',
    buy: '[点击购买]',
    owned: '拥有',
    maxed: '已满级',
    title: '黄金矿工',
    subtitle: '点击或按空格开始',
    instructions: [
      '空格/点击: 发射钩子    D: 炸药    F: 冻结时间',
      '抓取金块和钻石达到目标分数！',
      '避开石头——它们很重且不值钱。',
    ],
    start_prompt: '▼  开  始  ▼',
    level_splash: function (n) { return '第 ' + n + ' 关'; },
    target_label: function (n) { return '目标: $' + n; },
    level_complete: '关卡通过！',
    times_up: '时间到！',
    score_line: function (s, t) { return '分数: $' + s + ' / $' + t; },
    needed_line: function (s, t) { return '分数: $' + s + '（目标 $' + t + '）'; },
    continue_prompt: '点击或按空格继续',
    game_over: '游戏结束',
    final_score: function (m) { return '最终金币: $' + m; },
    reached_level: function (l) { return '到达第 ' + l + ' 关'; },
    restart: '点击或按空格重新开始',
    page_title: '黄金矿工 - Gold Miner',
  },
};

// ---- Upgrade Definitions ----
const UPGRADE_DEFS = [
  {
    id: 'chain',
    costs: [300, 600, 1000],
    maxLevel: 3,
    apply: function (hook, level) { hook.maxLength = MAX_HOOK_LENGTH + level * 45; },
  },
  {
    id: 'motor',
    costs: [300, 600, 1000],
    maxLevel: 3,
    apply: function (hook, level) { hook.extendMult = 1 + level * 0.15; },
  },
  {
    id: 'winch',
    costs: [400, 700, 1200],
    maxLevel: 3,
    apply: function (hook, level) { hook.winchBoost = 1 + level * 0.20; },
  },
  {
    id: 'miner',
    costs: [200, 400, 700, 1100, 1600],
    maxLevel: 5,
    apply: function (hook, level) { /* cosmetic only */ },
  },
];
