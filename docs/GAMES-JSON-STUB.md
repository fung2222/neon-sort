# games.json stub — neon-sort

Paste into `fung2222/cyber-arcade/games.json` **after Roy confirms** slug + tier.

```json
{
  "id": "neon-sort",
  "name": { "zh": "霓虹歸位", "en": "NEON SORT" },
  "genre": {
    "zh": "3D 分類／堆疊混合休閒解謎",
    "en": "3D sort / stack hybrid-casual puzzle"
  },
  "repo": "https://github.com/fung2222/neon-sort",
  "url": "https://fung2222.github.io/neon-sort/",
  "demo": "https://fung2222.github.io/neon-sort/?demo=1",
  "thumb": "assets/thumbs/neon-sort.webp",
  "thumbAlt": {
    "zh": "霓虹歸位遊戲畫面：將霓虹數據磚拖入發光管道堆疊清除",
    "en": "NEON SORT gameplay: dragging neon data-bricks into glowing pipes to clear stacks"
  },
  "status": "wip",
  "stage": {
    "zh": "網頁版 scaffolding · v0.1 切片未開工 · 未包裝 Android",
    "en": "web scaffolding · v0.1 slice not started · not packaged for Android"
  },
  "kit": "v0.3.16",
  "play": "not-submitted",
  "i18n": true,
  "endless": true,
  "tier": "silver",
  "trial": {
    "runsPerDay": 3,
    "caps": { "stages": 5, "endlessScore": 5000 },
    "rule": {
      "zh": "每日 3 局；只開放第 1–5 關，無盡模式分數閘門後彈解鎖提示（待實作）",
      "en": "3 runs per day; stages 1–5 only and endless until a score gate, then unlock prompt (to implement)"
    }
  }
}
```
