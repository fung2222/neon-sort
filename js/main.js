// NEON SORT — v0.1 sort/stack hybrid slice
import * as THREE from 'three';
import {
  i18n, t, flags, createStore, createStage, ThemeController, NeonCity, CyberUI, Platform,
  createAds, returnToHub as kitReturnToHub, shouldShowArcadeMenu,
} from 'cyber-kit';
import { GAME_ID, ADS, TRIAL, BOARDS } from './config.js';
import './strings.js';
import { boardForStage, starsFor } from './logic.js';
import { View } from './view.js';
import { SortAudio } from './audio.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const ENT = (() => { try { return JSON.parse(localStorage.getItem('cyber.entitlement') || 'null'); } catch { return null; } })();
const HUB = {
  on: Q.get('hub') === '1',
  tier: Q.get('tier') || ENT?.tier || 'free',
  ads: Q.get('ads'),
  trial: Q.get('trial') === '1',
  trialLeft: Q.get('trialLeft'),
  ret: Q.get('ret'),
};
if (HUB.on && HUB.ads == null && ENT?.tier) HUB.ads = ENT.tier === 'free' ? '1' : '0';
const ADS_ON = HUB.ads === '1' || (!HUB.on && (flags.adsim || Platform.isNative));
const AD_FLAGS = { adsim: flags.adsim || HUB.ads === '1', debug: flags.debug };

const store = createStore(GAME_ID);
if (flags.reset) store.clear();
const ui = new CyberUI({ screens: ['start', 'stages', 'pause', 'over'] });
const stage = createStage({
  canvas: $('scene'), bloom: 0.8, bloomRadius: 0.4, bloomThreshold: 0.82, fov: 42, exposure: 1.05,
  onFatal: (m) => ui.fatal(m),
});
ui.glowToggle(stage);
const theme = new ThemeController(); theme.set(2, true);
const city = new NeonCity(stage, {
  floor: 'plain', floorY: -1.2, innerRadius: 11, buildings: 180,
  billboard: { zh: '霓虹歸位', en: 'N E O N   S O R T', pos: [0, 13, -20], width: 18 },
  dustArea: 12, dustHeight: 5,
});
void city;

const view = new View(stage);
view.setVisible(false);
const audio = new SortAudio(store);
ui.setMuted(audio.muted);
const ads = createAds({ gameId: GAME_ID, ...ADS, flags: AD_FLAGS, onAdOpen: (on) => audio.duckAll(on) });

const S = {
  state: 'menu', demo: !!flags.demo, board: null, stageN: 1, mode: 'stages',
  hub: HUB, totalScore: 0, demoStep: 0, demoT: 0,
};
window.__sort = S;

function starsMap() { return store.getJSON('stars', {}) || {}; }
function setStar(id, n) {
  const s = starsMap();
  if ((s[id] || 0) < n) { s[id] = n; store.setJSON('stars', s); }
}
function totalStars() { return Object.values(starsMap()).reduce((a, b) => a + (b | 0), 0); }
function unlocked(id) {
  if (flags.get('unlockall') === '1') return true;
  if (id === 1) return true;
  if (id > BOARDS.length) return true; // endless
  return (starsMap()[id - 1] || 0) > 0;
}
function trialLocked(id) { return HUB.trial && id > TRIAL.stages; }

function refreshMenu() {
  $('start-best').textContent = String(store.getNum('best', 0));
  $('start-stars').textContent = String(totalStars());
}

function showMenu() {
  S.state = 'menu';
  document.body.classList.add('in-menu');
  view.setVisible(false);
  $('hud').classList.add('hidden');
  ui.show('start');
  refreshMenu();
  if (HUB.trial) {
    const el = $('start-trial');
    el.classList.remove('hidden');
    el.textContent = i18n.isZh()
      ? `試玩模式${HUB.trialLeft != null ? ` · 今日剩 ${HUB.trialLeft} 局` : ''}`
      : `Trial${HUB.trialLeft != null ? ` · ${HUB.trialLeft} left today` : ''}`;
  }
}

function buildStageGrid() {
  const grid = $('stage-grid');
  grid.innerHTML = '';
  for (let i = 1; i <= BOARDS.length; i++) {
    const b = document.createElement('button');
    b.className = 'stage-btn';
    b.type = 'button';
    const lock = !unlocked(i) || trialLocked(i);
    if (lock) b.classList.add('locked');
    const st = starsMap()[i] || 0;
    b.innerHTML = `<b>${i}</b><small>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</small>`;
    b.addEventListener('click', () => {
      if (lock) return;
      startStage(i);
    });
    grid.appendChild(b);
  }
}

function showStages() {
  S.state = 'stages';
  buildStageGrid();
  ui.show('stages');
}

function updateHUD() {
  const b = S.board; if (!b) return;
  $('hud-score').textContent = String(Math.floor(b.score + S.totalScore));
  $('hud-moves').textContent = String(b.moves);
  $('hud-stage').textContent = S.mode === 'endless' ? `∞${S.stageN - BOARDS.length}` : String(S.stageN);
  $('btn-undo').disabled = !b.undosLeft || !b.history.length;
  $('btn-undo').querySelector('small').textContent = `${b.undosLeft}×`;
}

function startStage(n, { endless = false } = {}) {
  audio.init();
  if (endless) {
    S.mode = 'endless';
    S.stageN = BOARDS.length + Math.max(1, n);
  } else {
    S.mode = 'stages';
    S.stageN = n;
  }
  S.board = boardForStage(S.stageN);
  S.state = 'play';
  S.demoStep = 0; S.demoT = 0;
  document.body.classList.remove('in-menu');
  view.setVisible(true);
  view.build(S.board);
  ui.show(null);
  $('hud').classList.remove('hidden');
  $('demo-tag').classList.toggle('hidden', !S.demo);
  updateHUD();
  audio.click();
}

function winBoard() {
  const b = S.board;
  const stars = starsFor(b);
  if (S.mode === 'stages' && S.stageN <= BOARDS.length) setStar(S.stageN, stars);
  S.totalScore += b.score;
  const best = store.getNum('best', 0);
  if (S.totalScore > best) store.setNum('best', S.totalScore);
  if (HUB.trial && S.mode === 'endless' && S.totalScore >= TRIAL.endlessScore) {
    // stop at score gate
  }
  $('over-score').textContent = String(Math.floor(b.score));
  $('over-best').textContent = String(store.getNum('best', 0));
  $('over-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('over-moves').textContent = String(b.moves);
  const nextBtn = $('btn-next');
  if (S.mode === 'endless') {
    nextBtn.classList.remove('hidden');
  } else if (S.stageN < BOARDS.length && !trialLocked(S.stageN + 1)) {
    nextBtn.classList.remove('hidden');
  } else if (S.stageN >= BOARDS.length) {
    nextBtn.classList.remove('hidden'); // go endless
  } else nextBtn.classList.add('hidden');
  S.state = 'over';
  $('hud').classList.add('hidden');
  ui.show('over');
  audio.win();
  if (ADS_ON) ads.naturalBreak('clear').catch(() => {});
}

function onPipe(i) {
  if (S.state !== 'play' || !S.board || i < 0) return;
  const before = S.board.selected;
  const r = S.board.select(i);
  if (!r.ok) {
    if (r.reason === 'illegal') { audio.deny(); view.shake(i); }
    view.sync(S.board);
    return;
  }
  if (r.picked) audio.pick();
  else if (r.clearedSel) audio.click();
  else if (r.moved) {
    audio.drop();
    for (const ev of r.events || []) {
      if (ev.type === 'clear') audio.clear(1);
      if (ev.type === 'win') winBoard();
    }
  }
  view.sync(S.board);
  updateHUD();
  void before;
}

// pointer pick
$('scene').addEventListener('pointerdown', (e) => {
  if (S.state !== 'play') return;
  if (e.target.closest?.('button')) return;
  audio.init();
  const i = view.pickPipe(e.clientX, e.clientY);
  onPipe(i);
});

$('btn-play')?.addEventListener('click', () => startStage(1));
$('btn-endless')?.addEventListener('click', () => { S.totalScore = 0; startStage(1, { endless: true }); });
$('btn-stages')?.addEventListener('click', () => showStages());
$('btn-stages-back')?.addEventListener('click', () => showMenu());
$('btn-pause')?.addEventListener('click', () => { if (S.state === 'play') { S.state = 'pause'; ui.show('pause'); } });
$('btn-resume')?.addEventListener('click', () => { S.state = 'play'; ui.show(null); $('hud').classList.remove('hidden'); });
$('btn-restart')?.addEventListener('click', () => {
  if (S.board) { S.board.restart(); view.sync(S.board); updateHUD(); }
  S.state = 'play'; ui.show(null); $('hud').classList.remove('hidden');
});
$('btn-quit')?.addEventListener('click', () => showMenu());
$('btn-retry')?.addEventListener('click', () => startStage(S.stageN, { endless: S.mode === 'endless' }));
$('btn-next')?.addEventListener('click', () => {
  if (S.mode === 'endless') startStage((S.stageN - BOARDS.length) + 1, { endless: true });
  else if (S.stageN >= BOARDS.length) { S.totalScore = store.getNum('best', 0) ? S.totalScore : S.totalScore; startStage(1, { endless: true }); }
  else startStage(S.stageN + 1);
});
$('btn-menu')?.addEventListener('click', () => showMenu());
$('btn-mute')?.addEventListener('click', () => { audio.toggleMute(); ui.setMuted(audio.muted); });
$('btn-undo')?.addEventListener('click', () => {
  if (S.board?.undo()) { audio.undo(); view.sync(S.board); updateHUD(); }
});
$('btn-restart-hud')?.addEventListener('click', () => {
  if (S.board) { S.board.restart(); view.build(S.board); updateHUD(); audio.click(); }
});

window.addEventListener('keydown', (e) => {
  audio.init();
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (S.state === 'play') { S.state = 'pause'; ui.show('pause'); }
    else if (S.state === 'pause') { S.state = 'play'; ui.show(null); $('hud').classList.remove('hidden'); }
  }
  if (e.code === 'KeyM') { audio.toggleMute(); ui.setMuted(audio.muted); }
  if ((e.code === 'KeyZ' || e.code === 'KeyU') && S.state === 'play') {
    if (S.board?.undo()) { audio.undo(); view.sync(S.board); updateHUD(); }
  }
  if (e.code === 'KeyR' && S.state === 'play') {
    S.board?.restart(); view.build(S.board); updateHUD();
  }
});

if (shouldShowArcadeMenu(HUB)) {
  const b = $('btn-arcade-menu');
  if (b) {
    b.classList.remove('hidden');
    b.addEventListener('click', () => kitReturnToHub({ gameId: GAME_ID, openStore: false }, location.search));
  }
}

ui.mountHowto({
  privacyUrl: './privacy.html',
  onOpen: () => { try { audio.click(); } catch (_) {} },
  getContent: () => ({
    kicker: 'NEON SORT',
    title: t('kit.howto'),
    sections: [
      { heading: t('kit.rules'), body: t('help.rules') },
      { heading: t('kit.controls'), body: t('help.controls') },
    ],
  }),
});
ui.mountSettings({
  audio, stage,
  onOpen: () => { try { audio.click(); } catch (_) {} },
});

i18n.onChange(() => { refreshMenu(); if (S.state === 'stages') buildStageGrid(); });
Platform.onBack(() => {
  if (S.state === 'pause') { S.state = 'play'; ui.show(null); $('hud').classList.remove('hidden'); return true; }
  if (S.state === 'over') { showMenu(); return true; }
  if (S.state === 'stages') { showMenu(); return true; }
  if (S.state === 'play') { S.state = 'pause'; ui.show('pause'); return true; }
  return false;
});

function demoAI(dt) {
  if (!S.demo || S.state !== 'play' || !S.board) return;
  S.demoT += dt;
  if (S.demoT < 0.55) return;
  S.demoT = 0;
  const b = S.board;
  let best = null, bestScore = -1e9;
  for (let from = 0; from < b.stacks.length; from++) {
    for (let to = 0; to < b.stacks.length; to++) {
      if (!b.canMove(from, to)) continue;
      const { color, count } = b.topRun(from);
      const dst = b.stacks[to];
      let sc = count;
      if (dst.length && dst[dst.length - 1] === color) sc += 10 + dst.length; // prefer stacking same
      if (!dst.length) sc -= 3; // deprioritize empty unless needed
      if (dst.length + Math.min(count, 4 - dst.length) === 4) sc += 30; // completing clear
      if (sc > bestScore) { bestScore = sc; best = [from, to]; }
    }
  }
  if (best) {
    b.selected = -1;
    const r = b.move(best[0], best[1]);
    view.sync(b); updateHUD();
    if (r.events?.some((e) => e.type === 'win')) winBoard();
    return;
  }
  b.restart(); view.sync(b);
}

function tick(dt) {
  if (S.state === 'menu' || S.state === 'stages') {
    view.setVisible(false);
    const cam = stage.camera;
    const t = performance.now() * 0.00012;
    cam.position.set(Math.sin(t) * 2.5, 13, 17);
    cam.lookAt(0, 2, 0);
    return;
  }
  if (S.board && (S.state === 'play' || S.state === 'pause' || S.state === 'over')) {
    view.frameCamera(stage.camera, S.board.stacks.length, dt, false);
  }
  if (S.state === 'play') demoAI(dt);
}

async function boot() {
  if (document.fonts) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  if (flags.mute) { audio.muted = true; ui.setMuted(true); }
  showMenu();
  ui.loaded();
  const lvl = Math.min(BOARDS.length, Math.max(1, flags.level || 1));
  if (S.demo || flags.autostart) startStage(lvl);
  stage.loop((dt, time, rawDt) => {
    tick(Math.min(0.05, dt));
    city.update(time, dt, stage.camera);
    stage.render(rawDt);
  }, { isActive: () => true, fpsEl: $('fps') });
  if (flags.fps) $('fps').classList.remove('hidden');
  ads.init().catch(() => {});
}
boot().catch((e) => { console.error(e); ui.fatal('載入失敗 Failed to start: ' + e.message); });
