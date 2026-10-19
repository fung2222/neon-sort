# NEON SORT 霓虹歸位 — Handoff

> Brief state for the next AI. Full series rules: `fung2222/cyber-arcade` (`AGENT_HANDOFF.md` / `docs/ARCADE-HANDOFF.md`).  
> **Contact style (Roy):** 解釋用 zh-HK（廣東話都睇得明）；code／路徑／commits 用英文。UI：**zh-HK 先行** + EN under.

**Status:** **v0.2 polish** · kit **v0.3.16** · CYBER ARCADE tier **Silver** · `games.json` status **wip**  
**HEAD:** `77536f0` (`77536f053443a93bf7de5d8964755fb899360164`) · 2026-10-18 HKT  
**Live:** https://fung2222.github.io/neon-sort/ · `?demo=1` · trial `?hub=1&trial=1`  
**Repo:** https://github.com/fung2222/neon-sort

## Current state
- 3D sort / stack hybrid-casual puzzle: drag neon bricks / orbs into glowing pipes to clear stacks.
- **12 authored boards** + endless (empty buffer, capped colours/pipes).
- Clearer tap feedback: lift float, green valid-drop rings, illegal flash/shake.
- Larger hit volumes + screen-near fallback for mobile / hub trial.
- Undo/restart polish; win stars + particle juice; howto updated.
- Trial: locks stages **> 5** when `trial=1`; endless score gate `5000` (`js/config.js` `TRIAL`).
- Must call **`stage.render` every frame** (black-canvas bug fixed in `16c8d57`).
- Home: kit **menu-home** (house / book / gear); bilingual howto + settings.
- Ads: `naturalBreak` on board-clear when `ads=1`.

## SHA timeline
| SHA | Note |
|---|---|
| `204b3c6` | v0.0 scaffold — kit v0.3.16 menu-home |
| `c1239cc` | v0.1 sort/stack playable slice |
| `16c8d57` | fix: `stage.render` (WebGL not black) |
| **`77536f0`** | **v0.2 polish** — 12 boards, tap feedback, trial (**HEAD**) |

## Gaps / next
1. Roy playtest (phone portrait + hub trial).
2. Wire full trial unlock → hub store when stage/endless gate hits.
3. More boards / difficulty curve polish; endless variety.
4. Full Playwright smoke parity with older games → then consider `done`.
5. Android packaging only after Roy go-ahead.

## Hub stub
See `docs/GAMES-JSON-STUB.md` · hub entry already in `cyber-arcade/games.json` (Silver, wip).
