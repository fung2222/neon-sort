# NEON SORT 霓虹歸位 — Handoff (scaffold)

Status: **v0.0 shell** (2026-10-18) · Pages-ready menu-home + NeonCity attract · **not playable slice yet** · kit **v0.3.16** · proposed CYBER ARCADE tier **Silver**.
Series rules: `fung2222/cyber-arcade/docs/ARCADE-HANDOFF.md`. No Capacitor yet. Do not commit any unlisted hub lab path.

## Pitch
Sort / stack / block hybrid-casual: drag coloured neon bricks into pipes or stacks; clear when a column matches; light block-drop spice.

## Proposed names
| | zh-HK | EN | slug |
|---|---|---|---|
| **Pick** | 霓虹歸位 | NEON SORT | `neon-sort` |
| Alt A | 霓虹堆疊 | NEON STACK | `neon-stack` |
| Alt B | 數據歸檔 | DATA ARCHIVE | `data-archive` |

## Tier suggestion — Silver (HK$18)
Genre has many free Play clones → could argue Free (like DATA FUSE). Silver if we keep hybrid 3D juice + authored packs + endless. Trial (planned): daily 3 runs; stages 1–5 + endless to score gate.

## v0.1 vertical slice (must feel fun in 60s) — NOT built yet
1. 3–5 vertical **pipes** on a tilted neon desk; bricks are glowing capsules.
2. Drag-and-drop (touch + mouse) one brick at a time; illegal moves shake + soft deny SFX.
3. Clear a pipe when **N same colour** stacked (N=4); cascade / combo multiplier.
4. One authored puzzle pack (8 boards) solvable in ~45–90 s each; star by moves leftover.
5. Restart / undo once per board (web free); best stars + endless high score stubs in store.
6. Bilingual + menu-home; `?demo=1` auto-solves slowly.
7. Endless planned v0.2+: infinite generated boards with capped colour count / pipe count curve.

Out of v0.1: full meta themes, repaid undo ads, Capacitor, complex block-drop gravity mode.

## Shell now
- Kit menu-home pattern; Play/Endless → scaffold timer stub.
- Hub hooks + privacy + noindex.

## Next coding steps
1. `js/logic.js` pure board model (move/undo/clear/combo) + unit tests first.
2. `js/view.js` Three.js pipes + drag picking (raycaster).
3. Level JSON pack + endless generator.
4. Smoke + hub stub entry when Roy confirms.
5. Re-vendor from tagged cyber-kit only.

## Ad breaks (planned)
Interstitial on board-clear Next / game-over when `ads=1`. Never mid-drag or during cascade animation.
