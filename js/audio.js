import { SynthAudio, mtof } from 'cyber-kit';

export class SortAudio extends SynthAudio {
  constructor(store) {
    super({ store, music: 'chill', musicTrimDb: 1, sfxTrimDb: 3 });
  }
  pick() { this.osc({ type: 'triangle', f: 660, f2: 920, dur: 0.07, vol: 0.045 }); }
  drop() { this.osc({ type: 'sine', f: 420, f2: 260, dur: 0.09, vol: 0.05 }); }
  deny() { this.osc({ type: 'sawtooth', f: 140, f2: 80, dur: 0.12, vol: 0.045, lp: 600 }); }
  clear(n = 1) {
    [0, 4, 7, 12].slice(0, 1 + n).forEach((x, i) => this.osc({ type: 'square', f: mtof(72 + x), t: i * 0.05, dur: 0.16, vol: 0.05, lp: 3800, send: 0.35 }));
  }
  win() {
    [0, 4, 7, 12, 16, 19].forEach((x, i) => this.osc({ type: 'triangle', f: mtof(67 + x), t: i * 0.07, dur: 0.24, vol: 0.055, send: 0.45 }));
  }
  undo() { this.whoosh(0.045); }
  star() { this.osc({ type: 'triangle', f: mtof(84), dur: 0.2, vol: 0.06, send: 0.4 }); }
}
