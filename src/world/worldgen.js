// World Generation 總指揮：terrain → ecology → civilization → anomaly → 可掃描物件。
// 純資料、無 three.js 依賴（可在 Node headless 測試）。
// genWeights 來自 Memory + Destiny + 稱號（玩家的命運會改變下一次生成）。

import { RNG } from '../core/rng.js';
import { buildTerrain } from './terrain.js';
import { buildEcology } from './ecology.js';
import { buildCivilization } from './civilization.js';
import { buildAnomalies } from './anomaly.js';

const DEFAULT_WEIGHTS = {
  verticality: 1, fogZones: 1, watchtowers: 1, lostRoutes: 1, dryBasins: 1,
  waterworks: 1, rebuildQuests: 1, glyphPuzzles: 1, archives: 1, historyConflicts: 1,
  beastTrails: 1, dangerTerrain: 1, counterHunts: 1, reconfigMazes: 1, floatMachines: 1,
  leyworks: 1, caves: 1, undergroundCities: 1, rareSpecies: 1, sanctuaries: 1,
  glideRoutes: 1, skyAnchors: 1, cullQuests: 1, plagueBeasts: 1
};

/** 在地標附近找一個合法擺放點 */
function near(r, cx, cz, radius) {
  return { x: cx + r.float(-radius, radius), z: cz + r.float(-radius, radius) };
}

function buildScannables(terrain, civ, rng, weights) {
  const r = rng.fork('scan');
  const list = [];
  let n = 0;
  const add = (kind, name, action, tags, pos, clueText, biomeOverride) => {
    list.push({
      id: 'scn-' + kind + '-' + (n++),
      kind, name, action, tags,
      x: pos.x, z: pos.z,
      biome: biomeOverride ?? terrain.biomeAt(pos.x, pos.z),
      clueText, scanned: false
    });
  };
  const gate = civ.landmarks.find(l => l.id === 'ancient-gate');
  const obs = civ.landmarks.find(l => l.id === 'observatory');
  const tree = civ.landmarks.find(l => l.id === 'lumen-tree');
  const node = civ.landmarks.find(l => l.id === 'water-node');
  const tower = civ.landmarks.find(l => l.id === 'skyspire');

  // 發光植物（森林）：光暈統一偏向燈心巨樹 → 一致規律供推理
  const floraCount = Math.round(4 * (weights.rareSpecies ?? 1));
  for (let i = 0; i < floraCount; i++) {
    const p = near(r, tree.x + 40, tree.z - 10, 60);
    add('lumen-flora', '燈苔草', 'scan-plant', ['flora'], p,
      '光暈不對稱：亮側一致朝向森林深處某一點。這不是趨光性，是被牽引。');
  }
  // 獸徑（平原，繞開窪地）
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    add('beast-track', '獸徑', 'scan-track', ['track'],
      { x: 60 + Math.cos(a) * 52, z: 30 + Math.sin(a) * 52 },
      '蹄印密集但全部繞開窪地中心，弧線整齊得像有人畫過。獸群在迴避什麼。');
  }
  // 古文字石（沿古道，朝向古道之門 → 一致語法）
  const glyphCount = Math.round(4 * (weights.glyphPuzzles ?? 1));
  for (let i = 0; i < glyphCount; i++) {
    const road = civ.roads[0];
    const t = (i + 1) / (glyphCount + 1);
    const idx = Math.min(road.length - 2, Math.floor(t * (road.length - 1)));
    const a = road[idx], b = road[idx + 1];
    const tt = (t * (road.length - 1)) % 1;
    const p = { x: a.x + (b.x - a.x) * tt + r.float(-8, 8), z: a.z + (b.z - a.z) * tt + r.float(-8, 8) };
    const ch = civ.glyphSyntax.charset[i % civ.glyphSyntax.charset.length];
    add('glyph-stone', '刻文石「' + ch + '」', 'scan-glyph', ['glyph'], p,
      '符號「' + ch + '」的筆畫重心偏向西北。和其他刻文石相同語法、相同朝向——它們是路標。');
  }
  // 氣流節點（高處：塔頂、山腰）
  const windCount = Math.round(3 * (weights.verticality ?? 1));
  const windSpots = [
    { x: tower.x + 6, z: tower.z + 6 },
    { x: terrain.mountCenter.x - 90, z: terrain.mountCenter.z + 60 },
    { x: 120, z: 40 }
  ];
  for (let i = 0; i < windCount; i++) {
    const p = windSpots[i % windSpots.length];
    add('wind-node', '上升氣流', 'scan-wind', ['wind'], near(r, p.x, p.z, 10),
      '氣流穩定向上，足以托住展開的披風。從這裡起跳，可以滑得很遠。');
  }
  // 水源（河源 + 湖泉）
  add('water-source', '河源湧泉', 'scan-water', ['water'], terrain.river.points[0],
    '水量充沛，但流入南向支脈的水在中途消失——下游的乾谷不是天生乾的。');
  add('water-source', '湖底冷泉', 'scan-water', ['water'], { x: terrain.lake.x + terrain.lake.r - 4, z: terrain.lake.z },
    '湖水溫度分層異常，底部有持續補水。這個水系統還活著。');
  // 礦脈（山區）
  for (let i = 0; i < 3; i++) {
    const p = near(r, terrain.mountCenter.x - 60, terrain.mountCenter.z + 50, 40);
    add('mineral-vein', '星銀礦脈', 'scan-mineral', ['mineral'], p,
      '礦脈帶有微弱規律脈動，頻率與浮島的升降一致。地脈是通電的。');
  }
  // 記憶殘留（遺跡）
  add('memory-residue', '記憶殘留', 'scan-memory', ['memory'], near(r, obs.x, obs.z, 8),
    '殘影：有人在倒塌前最後一刻仍盯著目鏡，喊著「星位不對」。');
  add('memory-residue', '記憶殘留', 'scan-memory', ['memory'], near(r, gate.x, gate.z, 8),
    '殘影：刻碑者把最後一個符號刻反了，然後故意留著。那是個簽名，也是警告。');
  // 星象石
  add('star-stone', '星象石', 'scan-star', ['star'], near(r, obs.x + 14, obs.z + 10, 6),
    '石面刻著 24 格環紋。某幾格被磨亮了——常被人對準某個會動的東西。');
  add('star-stone', '星象石', 'scan-star', ['star'], { x: 200, z: 170 },
    '沙漠中的星象石不受磁暴影響。磁針說謊時，星紋仍指向真北。');
  // 逆流標記（異常層）
  const seg = terrain.river.reverseSegment;
  const sp = terrain.river.points[Math.floor((seg[0] + seg[1]) / 2)];
  add('reverse-flow', '逆流水紋', 'scan-anomaly', ['anomaly', 'water'], sp,
    '浮沫以固定週期向高處移動。河床下的磁紋是反的——這是機關，不是奇蹟。');
  // 病態植物（乾谷 → 生態失衡線索）
  for (let i = 0; i < 2; i++) {
    const p = near(r, terrain.dryBasin.x, terrain.dryBasin.z, 30);
    add('sickly-plant', '枯脈草', 'scan-ecology', ['ecology-imbalance', 'flora'], p,
      '根系完整卻整株枯萎：它在等水，而且等了很多年。水脈被截斷在上游某處。');
  }
  return list;
}

export function generateWorld(seed, genWeights = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...genWeights };
  const rng = new RNG(seed);
  const terrain = buildTerrain(seed, weights);
  const civ = buildCivilization(terrain, rng, weights);
  const eco = buildEcology(terrain, rng, weights);
  const anomalies = buildAnomalies(terrain, rng, weights);
  const scannables = buildScannables(terrain, civ, rng, weights);

  return {
    seed, weights,
    size: terrain.size,
    waterLevel: terrain.waterLevel,
    heightAt: terrain.heightAt,
    biomeAt: terrain.biomeAt,
    moistureAt: terrain.moistureAt,
    river: terrain.river,
    lake: terrain.lake,
    dryBasin: terrain.dryBasin,
    mountCenter: terrain.mountCenter,
    village: civ.village,
    landmarks: civ.landmarks,
    roads: civ.roads,
    npcs: civ.npcs,
    glyphSyntax: civ.glyphSyntax,
    animals: eco.animals,
    migrations: eco.migrations,
    ecoRegions: eco.regions,
    anomalies, scannables,
    /** 推論目標 id → 座標 */
    locate(id) {
      const lm = civ.landmarks.find(l => l.id === id);
      if (lm) return { x: lm.x, z: lm.z };
      const an = anomalies.find(a => a.id === id);
      if (an) return { x: an.x, z: an.z };
      if (id === 'reverse-river') {
        const s = terrain.river.reverseSegment;
        return terrain.river.points[Math.floor((s[0] + s[1]) / 2)];
      }
      return { x: 0, z: 0 };
    }
  };
}
