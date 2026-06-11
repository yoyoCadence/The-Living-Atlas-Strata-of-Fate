// 組裝點：建立世界 → 接上所有系統 → 遊戲迴圈。邏輯都在 systems/，這裡只做接線。

import { bus } from './core/bus.js';
import { RNG } from './core/rng.js';
import { generateWorld } from './world/worldgen.js';
import { PlayerMemory } from './systems/memory.js';
import { Destiny } from './systems/destiny.js';
import { Myth } from './systems/myth.js';
import { RumorSystem } from './systems/rumor.js';
import { ContradictionEngine } from './systems/contradiction.js';
import { ScanningSystem } from './systems/scanning.js';
import { InferenceSystem } from './systems/inference.js';
import { AbilitySystem } from './systems/abilities.js';
import { WorldResponse } from './systems/worldResponse.js';
import { LivingMap } from './map/livingMap.js';
import { HUD } from './ui/hud.js';
import { DisplaySettingsPanel } from './ui/displaySettings.js';
import { SaveSystem } from './save/saveSystem.js';
import { WorldRenderer } from './render/scene.js';
import { PlayerController } from './player/controller.js';
import { DebugConsole } from './debug/console.js';

if ('ontouchstart' in window) document.body.classList.add('touch');

const game = {};

function buildGame(seed, savedData = null) {
  bus.clear();
  game.world = generateWorld(seed);
  game.memory = new PlayerMemory(game.world.size);
  game.destiny = new Destiny();
  game.myth = new Myth(game.destiny, game.memory);
  game.rumor = new RumorSystem(game.memory, game.destiny, game.myth, new RNG(seed));
  game.contradiction = new ContradictionEngine(game.memory);
  game.scanning = new ScanningSystem(game.memory);
  game.inference = new InferenceSystem(game.scanning, game.memory, game.world);
  game.abilities = new AbilitySystem(game.memory, game.scanning);
  game.worldResponse = new WorldResponse(game.world, game.destiny, game.rumor);

  if (!game.renderer) game.renderer = new WorldRenderer(document.getElementById('app'));
  game.player = new PlayerController(game.world, game.renderer.camera, game.abilities);
  game.renderer.build(game.world, game);
  game.renderer.scene.add(game.player.mesh);

  game.hud = new HUD(game);
  if (!game.displaySettings) game.displaySettings = new DisplaySettingsPanel(game.renderer);
  else game.displaySettings.setRenderer(game.renderer);
  game.map = new LivingMap(game);
  game.saver = new SaveSystem(game);

  if (savedData) game.saver.apply(savedData);
  game.hud.renderRibbon();
  game.hud.renderAbilities();

  /** debug：用（可能不同的）seed 重生世界，保留玩家記憶與命運 → 生成權重生效 */
  game.restart = (newSeed) => {
    const weights = game.myth.collectGenWeights(game.abilities.genWeights());
    game.world = generateWorld(newSeed, weights);
    game.inference.setWorld(game.world);
    game.worldResponse.setWorld(game.world);
    game.player.setWorld(game.world);
    game.player.pos.y = game.world.heightAt(game.player.pos.x, game.player.pos.z) + 2;
    game.renderer.build(game.world, game);
    game.renderer.scene.add(game.player.mesh);
    game.map.setWorld();
    bus.emit('toast', { text: '世界已依你的命運重新生成（seed: ' + newSeed + '）', kind: '' });
  };
}

// ---------- 互動系統 ----------
function nearestInteractable() {
  const p = game.player.pos, w = game.world;
  const d2 = (x, z) => (x - p.x) * (x - p.x) + (z - p.z) * (z - p.z);
  // 1. 推論驗證點
  const hypo = game.inference.pendingAt(p.x, p.z, 16);
  if (hypo) return { type: 'hypothesis', obj: hypo, prompt: '［E］驗證推論：' + hypo.suggestedAction };
  // 2. 可掃描物
  let best = null, bd = 7 * 7;
  for (const s of w.scannables) {
    if (s.scanned) continue;
    const d = d2(s.x, s.z);
    if (d < bd) { bd = d; best = { type: 'scannable', obj: s, prompt: '［E］掃描：' + s.name }; }
  }
  if (best) return best;
  // 3. NPC
  bd = 6 * 6;
  for (const n of w.npcs) {
    const d = d2(n.x, n.z);
    if (d < bd) {
      bd = d;
      best = { type: 'npc', obj: n, prompt: '［E］交談：' + n.name + (n.helped ? '' : ' ｜［F］協助') };
    }
  }
  if (best) return best;
  // 4. 動物
  bd = 7 * 7;
  for (const a of w.animals) {
    if (!a.alive) continue;
    if (a.appearCondition && !a.appearCondition({ ecoStability: game.destiny.ecoStability })) continue;
    const d = d2(a.x, a.z);
    if (d < bd) {
      bd = d;
      const scanPart = a.scanned ? '' : '［E］掃描 ';
      best = { type: 'animal', obj: a, prompt: scanPart + '［F］狩獵：' + a.name };
    }
  }
  if (best) return best;
  // 5. 可攀爬地標
  bd = 9 * 9;
  for (const lm of w.landmarks) {
    if (!lm.climbable) continue;
    const d = d2(lm.x, lm.z);
    if (d < bd) { bd = d; best = { type: 'climb', obj: lm, prompt: '［E］攀上' + lm.name }; }
  }
  return best;
}

function interact(key) {
  if (game.hud.dialogOpen) { game.hud.closeDialog(); return; }
  const target = nearestInteractable();
  if (!target) return;
  const { type, obj } = target;
  if (key === 'E') {
    if (type === 'scannable') {
      const clue = game.scanning.scan(obj);
      if (clue) game.renderer.markScanned(obj.id);
    } else if (type === 'hypothesis') {
      game.inference.complete(obj.id);
    } else if (type === 'npc') {
      const rumor = game.rumor.generate(obj.role);
      const greet = game.myth.title.id === 'nameless-walker'
        ? '外地人，你好。'
        : '是你啊——' + game.myth.title.name + '。';
      game.hud.showDialog(obj.name + '（' + obj.role + '）', greet + ' ' + rumor.text);
    } else if (type === 'animal' && !obj.scanned) {
      obj.biome = game.world.biomeAt(obj.x, obj.z);
      obj.clueText = obj.kind === 'lumen-deer'
        ? '燈苔鹿的角苔與燈苔草同種——牠們在森林裡播種光。'
        : obj.kind === 'apex'
          ? '巨獸的足壓制著整片區域的小型獸數量。牠是天平上最重的砝碼。'
          : '蹄獸的移動路線避開窪地，與獸徑的弧線一致。';
      obj.action = obj.scanAction;
      const clue = game.scanning.scan(obj);
      if (clue) obj.scanned = true;
    } else if (type === 'climb') {
      game.player.pos.x = obj.x;
      game.player.pos.z = obj.z;
      game.player.pos.y = game.world.heightAt(obj.x, obj.z) + 29;
      game.player.onGround = false;
      bus.emit('action', { id: 'climb-landmark', targetId: obj.id });
      bus.emit('toast', { text: '你攀上了' + obj.name + '。世界在腳下展開——按住空白鍵可以滑翔（若已覺醒風息）。', kind: '' });
    }
  } else if (key === 'F') {
    if (type === 'npc' && !obj.helped) {
      obj.helped = true;
      bus.emit('action', { id: 'help-npc', npcId: obj.id });
      bus.emit('toast', { text: '你' + obj.helpText + '。' + obj.name + '記住了你。', kind: '' });
    } else if (type === 'animal') {
      obj.alive = false;
      bus.emit('action', { id: obj.huntAction ?? 'hunt-animal', kind: obj.kind, targetId: obj.id });
      game.renderer.removeAnimal(obj.id);
      bus.emit('toast', { text: '你獵殺了' + obj.name + '。大地記下了這件事。', kind: 'contradiction' });
    }
  }
}

// ---------- 啟動 ----------
function start(seed, savedData) {
  buildGame(seed, savedData);
  new DebugConsole(game);
  document.getElementById('boot').style.display = 'none';
  // Pointer lock starts when the player clicks the canvas, keeping HUD controls clickable.

  // 鍵盤
  window.addEventListener('keydown', (e) => {
    if (document.getElementById('debug-console').classList.contains('open')) return;
    if (e.code === 'KeyM') game.map.toggle();
    if (e.code === 'KeyE') interact('E');
    if (e.code === 'KeyF') interact('F');
    const keyAb = { Digit1: 'wind-sense', Digit2: 'echo-vision', Digit3: 'geopulse', Digit4: 'ecology-hearing', Digit5: 'time-residue', Digit6: 'star-navigation', Digit7: 'myth-sight' };
    if (keyAb[e.code]) game.abilities.toggle(keyAb[e.code]);
  });
  document.getElementById('btn-map').addEventListener('touchstart', (e) => { e.preventDefault(); game.map.toggle(); });
  document.getElementById('btn-scan').addEventListener('touchstart', (e) => { e.preventDefault(); interact('E'); });

  // 環境傳聞（自然回流鉤子，而非焦慮推播）
  setInterval(() => { if (!document.hidden) game.rumor.ambient(); }, 95000);
  // 自動存檔
  setInterval(() => game.saver.save(), 30000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) game.saver.save(); });

  // 開場引導
  setTimeout(() => bus.emit('toast', { text: '遠方有一座白塔（▲）。靠近發光的事物可以掃描［E］。按 M 打開活地圖。', kind: '' }), 1200);

  // 遊戲迴圈
  let last = performance.now();
  let visitTimer = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const uiBlocked = game.map.open;
    game.player.update(dt, uiBlocked);
    game.renderer.update(dt, game.player.pos);
    // 探索記錄（每 0.5s 一次）
    visitTimer += dt;
    if (visitTimer > 0.5) {
      visitTimer = 0;
      game.memory.visit(game.player.pos.x, game.player.pos.z,
        game.world.biomeAt(game.player.pos.x, game.player.pos.z));
    }
    // 互動提示
    if (!uiBlocked && !game.hud.dialogOpen) {
      const t = nearestInteractable();
      game.hud.prompt(t ? t.prompt : null);
    } else {
      game.hud.prompt(null);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// boot 畫面
const saved = SaveSystem.peek();
const hint = document.getElementById('boot-save-hint');
if (saved) {
  hint.textContent = '找到既有旅程（seed: ' + saved.seed + '）。留空 seed 即繼續；輸入新 seed 則展開新命運。';
}
const urlSeed = new URLSearchParams(location.search).get('seed');
if (urlSeed) document.getElementById('boot-seed').value = urlSeed;

document.getElementById('boot-start').addEventListener('click', () => {
  const input = document.getElementById('boot-seed').value.trim();
  if (saved && !input) start(saved.seed, saved);
  else start(input || String(Math.floor(Math.random() * 1e9)), null);
});
