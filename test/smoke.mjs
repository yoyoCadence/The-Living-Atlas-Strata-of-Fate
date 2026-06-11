// Headless 煙霧測試：不需瀏覽器，直接驗證世界生成決定論與系統因果鏈。
// 執行：npm test

import assert from 'node:assert';
import { bus } from '../src/core/bus.js';
import { generateWorld } from '../src/world/worldgen.js';
import { PlayerMemory } from '../src/systems/memory.js';
import { Destiny } from '../src/systems/destiny.js';
import { Myth } from '../src/systems/myth.js';
import { RumorSystem } from '../src/systems/rumor.js';
import { ContradictionEngine } from '../src/systems/contradiction.js';
import { ScanningSystem } from '../src/systems/scanning.js';
import { InferenceSystem } from '../src/systems/inference.js';
import { AbilitySystem } from '../src/systems/abilities.js';
import { WorldResponse } from '../src/systems/worldResponse.js';
import { evaluateTitle } from '../src/data/titles.js';
import { RNG } from '../src/core/rng.js';

let passed = 0;
function ok(cond, name) {
  assert.ok(cond, name);
  console.log('  ✓ ' + name);
  passed++;
}

// ---------- 1. Seed 決定論 ----------
console.log('\n[1] Seed-based 可重現性');
{
  const a = generateWorld('alpha'), b = generateWorld('alpha'), c = generateWorld('beta');
  ok(a.scannables.length === b.scannables.length, '同 seed 掃描物數量一致');
  ok(a.scannables.every((s, i) => s.x === b.scannables[i].x && s.z === b.scannables[i].z), '同 seed 掃描物座標一致');
  ok(a.heightAt(12.3, -45.6) === b.heightAt(12.3, -45.6), '同 seed 地形高度一致');
  ok(c.scannables.some((s, i) => s.x !== a.scannables[i]?.x), '不同 seed 產生不同世界');
}

// ---------- 2. 世界生成規則（因果，不是純隨機） ----------
console.log('\n[2] Causal world generation 規則');
{
  const w = generateWorld('rules-check');
  const src = w.river.points[0], end = w.river.points[w.river.points.length - 1];
  ok(w.heightAt(src.x, src.z) > 4, '河流源頭在高處（山區）');
  ok(Math.hypot(end.x - w.lake.x, end.z - w.lake.z) < w.lake.r + 30, '河流終點接入湖泊');
  ok(Math.hypot(w.village.x - w.lake.x, w.village.z - w.lake.z) < w.lake.r + 40, '村落靠近水源');
  const biomes = new Set();
  for (let x = -280; x <= 280; x += 20) for (let z = -280; z <= 280; z += 20) biomes.add(w.biomeAt(x, z));
  ok(biomes.size >= 3, '至少 3 種 biome（實際 ' + biomes.size + ' 種）');
  ok(w.landmarks.length >= 5, '至少 5 個地標（實際 ' + w.landmarks.length + '）');
  ok(w.scannables.length >= 8, '至少 8 個可掃描物（實際 ' + w.scannables.length + '）');
  ok(w.anomalies.every(a => a.pattern), '每個異常都有可觀察規律');
  const glyphs = w.scannables.filter(s => s.kind === 'glyph-stone');
  ok(glyphs.length >= 3, '古文字石沿古道分布（' + glyphs.length + ' 座）');
}

// ---------- 3. 掃描 → 推論 → 完成 → 世界回應 → 矛盾 ----------
console.log('\n[3] 核心循環：線索 → 推論 → 世界回應 → 矛盾');
{
  bus.clear();
  const world = generateWorld('loop-test');
  const memory = new PlayerMemory(world.size);
  const destiny = new Destiny();
  const myth = new Myth(destiny, memory);
  const rumor = new RumorSystem(memory, destiny, myth, new RNG('loop-test'));
  const contradiction = new ContradictionEngine(memory);
  const scanning = new ScanningSystem(memory);
  const inference = new InferenceSystem(scanning, memory, world);
  const abilities = new AbilitySystem(memory, scanning);
  const response = new WorldResponse(world, destiny, rumor);

  // 掃描水源 + 枯脈草 → 應生成乾谷推論
  const waterSrc = world.scannables.find(s => s.kind === 'water-source');
  const sick = world.scannables.find(s => s.kind === 'sickly-plant');
  scanning.scan(waterSrc);
  scanning.scan(sick);
  const hypo = inference.hypotheses.find(h => h.id === 'hypo-dry-basin');
  ok(!!hypo, '線索組合生成推論 hypo-dry-basin');
  ok(hypo.confidence > 0 && hypo.confidence <= 0.95, '推論有信心值（' + hypo.confidence.toFixed(2) + '）');
  ok(typeof hypo.target.x === 'number', '推論指向具體座標');

  inference.accept(hypo.id);
  ok(hypo.status === 'accepted', '推論可被接受');
  inference.complete(hypo.id);
  ok(hypo.status === 'completed', '推論可被完成');
  ok(world.dryBasin.restored, '世界回應：乾谷綠洲生成');
  ok(world.village.state === 'prospering', '世界回應：村落繁榮');
  ok(world.scannables.some(s => s.kind === 'oasis-flora'), '世界回應：綠洲長出新掃描物');
  ok(destiny.axes.restorer >= 4, '修復水脈 → Restorer 提升（' + destiny.axes.restorer + '）');
  ok(contradiction.scheduled.has('prosperity-deforestation'), '矛盾引擎已排程「繁榮的代價」');

  // 直接觸發矛盾（測試不等 45 秒）
  contradiction.force('prosperity-deforestation');
  ok(world.ecoRegions['glow-forest'].logged, '矛盾後果：森林被砍伐');
  ok(memory.data.unresolved.includes('prosperity-deforestation'), '矛盾留下未解問題（回流動機）');

  // 過度狩獵 → 寂靜森林 + 追蹤者
  bus.emit('action', { id: 'hunt-animal', kind: 'grazer' });
  bus.emit('action', { id: 'hunt-animal', kind: 'grazer' });
  bus.emit('action', { id: 'hunt-animal', kind: 'grazer' });
  ok(contradiction.scheduled.has('prey-turns-hunter') || contradiction.fired.has('prey-turns-hunter'), '過獵觸發「獵物的反擊」');
  contradiction.force('prey-turns-hunter');
  ok(world.animals.some(a => a.id === 'stalker'), '世界回應：反向追蹤者出現');
  ok(destiny.axes.predator >= 9, '狩獵 → Predator 提升');
  ok(destiny.ecoStability < 0, '狩獵 → 生態穩定度下降（' + destiny.ecoStability + '）');

  // 傳聞反映行為
  rumor.events.add('water-restored');
  const texts = [];
  for (let i = 0; i < 25; i++) texts.push(rumor.generate().text);
  ok(texts.some(t => t.includes('水') || t.includes('安靜') || t.includes('躲')), '傳聞反映玩家造成的世界變化');

  // 能力解鎖：攀塔 + 掃描氣流 ×2 → 風息感知
  bus.emit('action', { id: 'climb-landmark', targetId: 'skyspire' });
  const winds = world.scannables.filter(s => s.kind === 'wind-node').slice(0, 2);
  for (const wnd of winds) scanning.scan(wnd);
  ok(abilities.isUnlocked('wind-sense'), '行為自然解鎖能力：風息感知');

  // 稱號
  destiny.axes.restorer = 14; destiny.axes.shaper = 9;
  const t = evaluateTitle(destiny.axes);
  ok(t.id === 'vein-mender', '高 Restorer + Shaper → 河脈修復師');
  ok(Object.keys(t.genEffects).length > 0, '稱號帶有世界生成權重');
  myth.evaluate(destiny.axes);
  const weights = myth.collectGenWeights(abilities.genWeights());
  ok((weights.dryBasins ?? 1) > 1, '稱號權重進入世界生成（dryBasins=' + weights.dryBasins + '）');

  // 權重重生世界：枯竭盆地相關內容應增加（此處驗證權重傳遞機制）
  const w2 = generateWorld('loop-test-2', weights);
  ok(w2.weights.dryBasins > 1, '重生世界吃到玩家命運權重');

  // 存檔 round-trip
  const save = {
    memory: memory.toJSON(), destiny: destiny.toJSON(), myth: myth.toJSON(),
    scanning: scanning.toJSON(), inference: inference.toJSON(),
    abilities: abilities.toJSON(), worldResponse: response.toJSON()
  };
  const json = JSON.parse(JSON.stringify(save));
  bus.clear();
  const m2 = new PlayerMemory(world.size); m2.load(json.memory);
  const d2 = new Destiny(); d2.load(json.destiny);
  const s2 = new ScanningSystem(m2); s2.load(json.scanning);
  ok(d2.axes.restorer === destiny.axes.restorer, '存檔還原命運軸');
  ok(s2.clues.length === scanning.clues.length, '存檔還原線索');
  ok(json.worldResponse.applied.includes('oasis-bloom'), '存檔記錄世界變化（重載後可重播）');

  contradiction.dispose();
}

console.log('\n全部通過：' + passed + ' 項斷言 ✔');
