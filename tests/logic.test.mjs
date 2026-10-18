import { boardForStage, starsFor } from '../js/logic.js';
import { BOARDS, genEndless } from '../js/config.js';
import assert from 'assert';

assert.equal(BOARDS.length, 8);
const b = boardForStage(1);
assert.ok(b.stacks.length >= 3);
// force a clear scenario
b.stacks = [[0,0,0], [0], []];
const r = b.move(1, 0);
assert.ok(r.ok);
assert.ok(b.won || b.stacks[0].length === 0, 'should clear full mono pipe');
const e = genEndless(123, 2);
assert.ok(e.stacks.length >= 3);
console.log('sort logic OK', { boards: BOARDS.length, endlessPipes: e.pipes });
