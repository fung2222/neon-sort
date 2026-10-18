import { STACK_MAX, BOARDS, genEndless } from './config.js';

function cloneStacks(stacks) {
  return stacks.map((s) => s.slice());
}

export class Board {
  constructor(spec) {
    this.spec = spec;
    this.stacks = cloneStacks(spec.stacks);
    // pad pipe count
    while (this.stacks.length < spec.pipes) this.stacks.push([]);
    this.moves = 0;
    this.undosLeft = 1;
    this.history = [];
    this.combo = 0;
    this.score = 0;
    this.cleared = 0;
    this.won = false;
    this.selected = -1; // pipe index holding a lifted brick colour sequence
    this.liftCount = 0; // how many same-colour from top are lifted
  }

  topColor(i) {
    const s = this.stacks[i];
    return s.length ? s[s.length - 1] : -1;
  }

  /** Count contiguous same colour from top */
  topRun(i) {
    const s = this.stacks[i];
    if (!s.length) return { color: -1, count: 0 };
    const c = s[s.length - 1];
    let n = 0;
    for (let k = s.length - 1; k >= 0 && s[k] === c; k--) n++;
    return { color: c, count: n };
  }

  canMove(from, to) {
    if (from === to || from < 0 || to < 0) return false;
    if (from >= this.stacks.length || to >= this.stacks.length) return false;
    const src = this.stacks[from];
    if (!src.length) return false;
    const { color, count } = this.topRun(from);
    const dst = this.stacks[to];
    if (dst.length >= STACK_MAX) return false;
    if (dst.length && dst[dst.length - 1] !== color) return false;
    const space = STACK_MAX - dst.length;
    return Math.min(count, space) > 0;
  }

  select(i) {
    if (this.won) return { ok: false };
    if (this.selected === i) {
      this.selected = -1;
      this.liftCount = 0;
      return { ok: true, clearedSel: true };
    }
    if (this.selected < 0) {
      if (!this.stacks[i].length) return { ok: false, reason: 'empty' };
      const { count } = this.topRun(i);
      this.selected = i;
      this.liftCount = count;
      return { ok: true, picked: true };
    }
    // try move selected → i
    return this.move(this.selected, i);
  }

  move(from, to) {
    if (!this.canMove(from, to)) {
      // keep lift so player can try another pipe
      return { ok: false, reason: 'illegal' };
    }
    const { color, count } = this.topRun(from);
    const space = STACK_MAX - this.stacks[to].length;
    const n = Math.min(count, space);
    this.history.push({ stacks: cloneStacks(this.stacks), moves: this.moves, score: this.score, combo: this.combo, cleared: this.cleared });
    for (let k = 0; k < n; k++) this.stacks[to].push(this.stacks[from].pop());
    this.moves++;
    this.selected = -1;
    this.liftCount = 0;

    const events = [];
    // clear completed mono pipes
    let clearedNow = 0;
    for (let i = 0; i < this.stacks.length; i++) {
      const s = this.stacks[i];
      if (s.length === STACK_MAX && s.every((c) => c === s[0])) {
        this.stacks[i] = [];
        clearedNow++;
        this.cleared++;
        events.push({ type: 'clear', pipe: i, color: s[0] });
      }
    }
    if (clearedNow) {
      this.combo += clearedNow;
      const gain = clearedNow * 100 * this.combo;
      this.score += gain;
      events.push({ type: 'combo', n: this.combo, gain });
    } else {
      this.combo = 0;
    }

    // win: every non-empty pipe is a full mono stack OR all empty (all cleared into "done" by emptying)
    // Actually after clear we empty pipes — win when all bricks gone
    const bricks = this.stacks.reduce((a, s) => a + s.length, 0);
    if (bricks === 0) {
      this.won = true;
      const leftoverBonus = Math.max(0, 40 - this.moves) * 15;
      this.score += 500 + leftoverBonus;
      events.push({ type: 'win', bonus: leftoverBonus });
    }
    return { ok: true, moved: n, color, events };
  }

  undo() {
    if (!this.undosLeft || !this.history.length || this.won) return false;
    const h = this.history.pop();
    this.stacks = h.stacks;
    this.moves = h.moves;
    this.score = h.score;
    this.combo = h.combo;
    this.cleared = h.cleared;
    this.undosLeft--;
    this.selected = -1;
    this.liftCount = 0;
    this.won = false;
    return true;
  }

  restart() {
    this.stacks = cloneStacks(this.spec.stacks);
    while (this.stacks.length < this.spec.pipes) this.stacks.push([]);
    this.moves = 0;
    this.undosLeft = 1;
    this.history = [];
    this.combo = 0;
    this.score = 0;
    this.cleared = 0;
    this.won = false;
    this.selected = -1;
    this.liftCount = 0;
  }
}

export function boardForStage(n) {
  if (n >= 1 && n <= BOARDS.length) return new Board(BOARDS[n - 1]);
  return new Board(genEndless(n * 9973 + 11, n - BOARDS.length));
}

export function starsFor(board) {
  if (!board.won) return 0;
  if (board.moves <= 12) return 3;
  if (board.moves <= 22) return 2;
  return 1;
}
