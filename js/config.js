export const GAME_ID = 'neon-sort';
export const KIT = '0.3.16';
export const TRIAL = { runsPerDay: 3, stages: 5, endlessScore: 5000 };
export const ADS = {
  interstitialCooldownSec: 180,
  breaksBetweenInterstitials: 3,
  graceSec: 120,
  units: { android: {} },
};

export const STACK_MAX = 4; // clear when N same colour stacked in a pipe
export const COLORS = [
  { id: 0, hex: 0x00e5ff, zh: '青', en: 'CYAN' },
  { id: 1, hex: 0xff2bd6, zh: '粉', en: 'MAGENTA' },
  { id: 2, hex: 0xffe600, zh: '黃', en: 'YELLOW' },
  { id: 3, hex: 0x3bff8a, zh: '綠', en: 'LIME' },
  { id: 4, hex: 0xff6b35, zh: '橙', en: 'ORANGE' },
  { id: 5, hex: 0xb388ff, zh: '紫', en: 'VIOLET' },
];

/** Each board: array of pipes; each pipe is bottom→top colour ids. Empty pipes = []. */
export const BOARDS = [
  // Each colour count must be a multiple of STACK_MAX (4). Last pipe(s) act as buffers.
  // 1 tutorial — 3 pipes, 2 colours
  { id: 1, pipes: 3, stacks: [[0, 0, 0, 1], [1, 1, 1, 0], []] },
  // 2
  { id: 2, pipes: 3, stacks: [[0, 1, 0, 1], [1, 0, 1, 0], []] },
  // 3 — 3 colours
  { id: 3, pipes: 4, stacks: [[0, 0, 1, 2], [1, 1, 2, 0], [2, 2, 0, 1], []] },
  // 4
  { id: 4, pipes: 4, stacks: [[0, 1, 2, 0], [1, 2, 0, 1], [2, 0, 1, 2], []] },
  // 5
  { id: 5, pipes: 4, stacks: [[0, 0, 1, 1], [2, 2, 2, 0], [1, 1, 0, 2], []] },
  // 6 — 4 colours
  { id: 6, pipes: 5, stacks: [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2], []] },
  // 7
  { id: 7, pipes: 5, stacks: [[0, 1, 0, 2], [1, 2, 3, 1], [2, 3, 0, 3], [3, 0, 1, 2], []] },
  // 8 — 5 colours, one empty buffer
  { id: 8, pipes: 6, stacks: [[0, 4, 1, 0], [1, 2, 4, 3], [2, 3, 0, 1], [3, 1, 2, 4], [4, 0, 3, 2], []] },
];

export function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Endless: generate a solvable-ish board with capped colour/pipe counts */
export function genEndless(seed, depth = 0) {
  const rng = mulberry32(seed >>> 0);
  const nCol = Math.min(6, 3 + Math.floor(Math.min(3, depth / 4)));
  const nPipes = Math.min(5, nCol + 1);
  const stacks = Array.from({ length: nPipes }, () => []);
  // fill nCol full tubes worth, then shuffle into pipes leaving ≥1 empty slot total
  const bag = [];
  for (let c = 0; c < nCol; c++) for (let i = 0; i < STACK_MAX; i++) bag.push(c);
  // Fisher-Yates
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  let pi = 0;
  for (const c of bag) {
    // leave last pipe emptier
    while (stacks[pi].length >= STACK_MAX - (pi === nPipes - 1 ? STACK_MAX : 0) || (pi === nPipes - 1 && stacks[pi].length >= 0 && rng() < 0.5)) {
      pi = (pi + 1) % (nPipes - 1); // never fill last as full dump — keep empty buffer
      if (stacks.slice(0, -1).every((s) => s.length >= STACK_MAX)) break;
    }
    if (pi >= nPipes - 1) pi = 0;
    if (stacks[pi].length < STACK_MAX) stacks[pi].push(c);
    else {
      const open = stacks.findIndex((s, idx) => idx < nPipes - 1 && s.length < STACK_MAX);
      if (open >= 0) stacks[open].push(c);
    }
    pi = (pi + 1) % (nPipes - 1);
  }
  return { id: 1000 + depth, pipes: nPipes, stacks, endless: true, depth };
}
