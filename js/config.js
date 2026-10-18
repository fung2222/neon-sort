export const GAME_ID = 'neon-sort';
export const KIT = '0.3.16';
export const TRIAL = { runsPerDay: 3, stages: 5, endlessScore: 5000 };
export const ADS = {
  interstitialCooldownSec: 180,
  breaksBetweenInterstitials: 3,
  graceSec: 120,
  units: { android: {} },
};

export const STACK_MAX = 4;
export const COLORS = [
  { id: 0, hex: 0x00e5ff, zh: '青', en: 'CYAN' },
  { id: 1, hex: 0xff2bd6, zh: '粉', en: 'MAGENTA' },
  { id: 2, hex: 0xffe600, zh: '黃', en: 'YELLOW' },
  { id: 3, hex: 0x3bff8a, zh: '綠', en: 'LIME' },
  { id: 4, hex: 0xff6b35, zh: '橙', en: 'ORANGE' },
  { id: 5, hex: 0xb388ff, zh: '紫', en: 'VIOLET' },
];

/** Colour counts always multiple of STACK_MAX; ≥1 empty buffer pipe. */
export const BOARDS = [
  { id: 1, pipes: 3, stacks: [[0, 0, 0, 1], [1, 1, 1, 0], []] },
  { id: 2, pipes: 3, stacks: [[0, 1, 0, 1], [1, 0, 1, 0], []] },
  { id: 3, pipes: 4, stacks: [[0, 0, 1, 2], [1, 1, 2, 0], [2, 2, 0, 1], []] },
  { id: 4, pipes: 4, stacks: [[0, 1, 2, 0], [1, 2, 0, 1], [2, 0, 1, 2], []] },
  { id: 5, pipes: 4, stacks: [[0, 0, 1, 1], [2, 2, 2, 0], [1, 1, 0, 2], []] },
  { id: 6, pipes: 5, stacks: [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2], []] },
  { id: 7, pipes: 5, stacks: [[0, 1, 0, 2], [1, 2, 3, 1], [2, 3, 0, 3], [3, 0, 1, 2], []] },
  { id: 8, pipes: 6, stacks: [[0, 4, 1, 0], [1, 2, 4, 3], [2, 3, 0, 1], [3, 1, 2, 4], [4, 0, 3, 2], []] },
  // 9–12 new
  { id: 9, pipes: 5, stacks: [[0, 0, 2, 1], [1, 1, 0, 3], [2, 2, 3, 0], [3, 3, 1, 2], []] },
  { id: 10, pipes: 5, stacks: [[0, 3, 1, 2], [1, 0, 2, 3], [2, 1, 3, 0], [3, 2, 0, 1], []] },
  { id: 11, pipes: 6, stacks: [[0, 1, 4, 2], [1, 2, 0, 3], [2, 3, 1, 4], [3, 4, 2, 0], [4, 0, 3, 1], []] },
  { id: 12, pipes: 6, stacks: [[0, 4, 1, 2], [1, 0, 3, 4], [2, 1, 0, 3], [3, 2, 4, 0], [4, 3, 2, 1], []] },
];

export function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Endless: always leave one empty buffer; cap colours/pipes for playability */
export function genEndless(seed, depth = 0) {
  const rng = mulberry32(seed >>> 0);
  const nCol = Math.min(6, 3 + Math.floor(Math.min(3, depth / 3)));
  const nPipes = Math.min(6, nCol + 1); // +1 buffer
  const stacks = Array.from({ length: nPipes }, () => []);
  const bag = [];
  for (let c = 0; c < nCol; c++) for (let i = 0; i < STACK_MAX; i++) bag.push(c);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  const fillSlots = nPipes - 1; // last pipe stays empty buffer
  let pi = 0;
  for (const c of bag) {
    let guard = 0;
    while (stacks[pi].length >= STACK_MAX && guard++ < fillSlots * 2) pi = (pi + 1) % fillSlots;
    if (stacks[pi].length < STACK_MAX) stacks[pi].push(c);
    else {
      const open = stacks.findIndex((s, idx) => idx < fillSlots && s.length < STACK_MAX);
      if (open >= 0) stacks[open].push(c);
    }
    pi = (pi + 1) % fillSlots;
  }
  return { id: 1000 + depth, pipes: nPipes, stacks, endless: true, depth };
}
