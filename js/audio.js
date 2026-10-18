import { SynthAudio, mtof } from 'cyber-kit';

export class SortAudio extends SynthAudio {
  constructor(store) {
    super({ store, music: 'chill', musicTrimDb: 1, sfxTrimDb: 3 });
  }
  pick() { this.osc({ type: 'triangle', f: 660, f2: 880, dur: 0.06, vol: 0.04 }); }
  drop() { this.osc({ type: 'sine', f: 420, f2: 280, dur: 0.08, vol: 0.045 }); }
  deny() { this.osc({ type: 'sawtooth', f: 140, f2: 90, dur: 0.1, vol: 0.04, lp: 600 }); }
  clear(n = 1) {
    [0, 4, 7].slice(0, 1 + n).forEach((x, i) => this.osc({ type: 'square', f: mtof(72 + x), t: i * 0.05, dur: 0.16, vol: 0.05, lp: 3800, send: 0.35 }));
  }
  win() {
    [0, 4, 7, 12, 16].forEach((x, i) => this.osc({ type: 'triangle', f: mtof(67 + x), t: i * 0.07, dur: 0.22, vol: 0.05, send: 0.4 }));
  }
  undo() { this.whoosh(0.04); }
}
