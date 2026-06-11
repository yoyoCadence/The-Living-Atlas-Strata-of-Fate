// Player Memory System：世界記住玩家的一切行為。
// 不只是統計——它是世界生成權重、個人化任務、NPC 記憶與 Living Map 推論的資料來源。

import { bus } from '../core/bus.js';

const GRID = 48; // 探索迷霧解析度（48x48 覆蓋整張地圖）

export class PlayerMemory {
  constructor(worldSize = 600) {
    this.worldSize = worldSize;
    this.data = {
      biomesExplored: {},          // biomeId -> 進入次數
      scans: {},                   // scannable kind -> 次數
      scanTags: {},                // clue tag -> 次數
      actions: {},                 // actionId -> 次數
      huntedSpecies: {},           // animal kind -> 次數
      helpedNPCs: [],              // npc id
      ignoredNPCs: [],
      climbs: 0,
      markers: [],                 // 玩家自訂標記 { x, z, label, time }
      visited: new Array(GRID * GRID).fill(0), // 探索迷霧
      travelHeat: new Array(GRID * GRID).fill(0),
      unresolved: [],              // 未解之謎（推論 id / 異常 id）
      changedTerrain: [],          // 地形改造記錄
      restoredLandmarks: [],
      hypothesesAccepted: [], hypothesesIgnored: [], hypothesesCompleted: []
    };
    bus.on('action', (a) => this.recordAction(a));
  }

  recordAction(a) {
    const d = this.data;
    d.actions[a.id] = (d.actions[a.id] ?? 0) + 1;
    if (a.id === 'climb-landmark') d.climbs++;
    if (a.id === 'help-npc' && a.npcId && !d.helpedNPCs.includes(a.npcId)) d.helpedNPCs.push(a.npcId);
    if (a.id.startsWith('hunt') && a.kind) d.huntedSpecies[a.kind] = (d.huntedSpecies[a.kind] ?? 0) + 1;
    if (a.id === 'restore-water' || a.id === 'restore-landmark') {
      if (a.targetId) d.restoredLandmarks.push(a.targetId);
    }
    if (a.id === 'reshape-terrain' || a.id === 'redirect-river') d.changedTerrain.push({ id: a.id, time: Date.now() });
  }

  recordScan(scannable, clue) {
    const d = this.data;
    d.scans[scannable.kind] = (d.scans[scannable.kind] ?? 0) + 1;
    for (const t of clue.tags) d.scanTags[t] = (d.scanTags[t] ?? 0) + 1;
  }

  gridIndex(x, z) {
    const half = this.worldSize / 2;
    const gx = Math.max(0, Math.min(GRID - 1, Math.floor(((x + half) / this.worldSize) * GRID)));
    const gz = Math.max(0, Math.min(GRID - 1, Math.floor(((z + half) / this.worldSize) * GRID)));
    return gz * GRID + gx;
  }

  /** 玩家移動時呼叫：迷霧揭露 + 旅行熱度 + biome 探索統計 */
  visit(x, z, biomeId) {
    const idx = this.gridIndex(x, z);
    const first = !this.data.visited[idx];
    // 揭露 3x3 範圍
    const gx = idx % GRID, gz = Math.floor(idx / GRID);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const nx = gx + dx, nz = gz + dz;
      if (nx >= 0 && nx < GRID && nz >= 0 && nz < GRID) this.data.visited[nz * GRID + nx] = 1;
    }
    this.data.travelHeat[idx]++;
    if (biomeId) {
      const firstBiome = !this.data.biomesExplored[biomeId];
      this.data.biomesExplored[biomeId] = (this.data.biomesExplored[biomeId] ?? 0) + 1;
      if (firstBiome) bus.emit('action', { id: 'enter-new-biome', biome: biomeId });
    }
    return first;
  }

  exploredRatio() {
    return this.data.visited.reduce((a, b) => a + b, 0) / (GRID * GRID);
  }

  addMarker(x, z, label) {
    this.data.markers.push({ x, z, label, time: Date.now() });
    bus.emit('action', { id: 'place-marker', x, z });
  }

  /** 行為風格 → 世界生成權重（Memory Layer 的「用途」之一） */
  styleWeights() {
    const a = this.data.actions, w = {};
    if ((a['climb-landmark'] ?? 0) + (a['glide'] ?? 0) >= 2) { w.verticality = 1.5; w.glideRoutes = 1.5; }
    if ((a['scan-plant'] ?? 0) >= 3) { w.rareSpecies = 1.5; w.sanctuaries = 1.3; }
    if ((a['decode-glyph'] ?? 0) + (a['complete-hypothesis'] ?? 0) >= 3) { w.glyphPuzzles = 1.5; w.archives = 1.5; }
    if ((a['reshape-terrain'] ?? 0) + (a['activate-machine'] ?? 0) >= 2) { w.leyworks = 1.5; w.reconfigMazes = 1.3; }
    if ((a['hunt-animal'] ?? 0) + (a['hunt-rare'] ?? 0) >= 3) { w.counterHunts = 1.6; w.plagueBeasts = 1.3; }
    return w;
  }

  get GRID() { return GRID; }

  toJSON() { return this.data; }
  load(saved) { if (saved) Object.assign(this.data, saved); }
}
