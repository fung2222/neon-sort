import { boardForStage, starsFor } from '../js/logic.js';
import { BOARDS, genEndless } from '../js/config.js';
import assert from 'assert';

assert.equal(BOARDS.length, 12);
const b = boardForStage(1);
assert.ok(b.stacks.length >= 3);
b.stacks = [[0,0,0], [0], []];
const r = b.move(1, 0);
assert.ok(r.ok);
assert.ok(b.won || b.stacks[0].length === 0, 'should clear full mono pipe');
const e = genEndless(123, 2);
assert.ok(e.stacks.length >= 3);
assert.ok(e.stacks[e.stacks.length - 1].length === 0, 'endless keeps empty buffer');
// keep selection on illegal
const b2 = boardForStage(1);
b2.select(0);
const bad = b2.move(0, 0);
assert.equal(bad.ok, false);
assert.equal(b2.selected, 0);
console.log('sort logic OK', { boards: BOARDS.length, endlessPipes: e.pipes });
