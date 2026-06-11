// World Response System：把抽象事件變成世界的實際變化。
// 監聽 'world-event'（玩家成就）與 'world-change'（矛盾引擎的後果），
// 改寫 world 資料，並發 'render-update' 讓渲染層與 Living Map 同步。

import { bus } from '../core/bus.js';

export class WorldResponse {
  constructor(world, destiny, rumor) {
    this.world = world;
    this.destiny = destiny;
    this.rumor = rumor;
    this.applied = []; // 已套用的變化（存檔後重播用）
    bus.on('world-event', (e) => this.onEvent(e.id));
    bus.on('world-change', (c) => this.applyChange(c.type));
  }

  setWorld(world) {
    this.world = world;
    // 重生成 / 讀檔後重播已套用的變化，世界狀態可重現
    for (const t of [...this.applied]) this.mutate(t, true);
  }

  onEvent(id) {
    const map = {
      'water-restored': 'oasis-bloom',
      'machine-activated': 'island-stabilized',
      'gate-decoded': 'gate-opened',
      'hollow-found': 'hollow-revealed'
    };
    if (map[id]) this.applyChange(map[id]);
  }

  applyChange(type) {
    if (!this.applied.includes(type)) this.applied.push(type);
    this.mutate(type, false);
  }

  mutate(type, replay) {
    const w = this.world;
    switch (type) {
      // ---- 玩家成就的正向回應 ----
      case 'oasis-bloom': { // 修復水脈 → 乾谷綠洲、商路重開、村落繁榮
        w.dryBasin.restored = true;
        w.ecoRegions['dry-basin'].restored = true;
        w.ecoRegions['dry-basin'].stability = 2;
        w.village.state = 'prospering';
        w.roads.push([{ x: w.village.x, z: w.village.z }, { x: 20, z: 150 }, { x: w.dryBasin.x, z: w.dryBasin.z }]);
        // 綠洲長出新的可掃描植物（世界回應 → 新內容）
        for (let i = 0; i < 3; i++) {
          w.scannables.push({
            id: 'scn-oasis-' + i, kind: 'oasis-flora', name: '新生水紋花',
            action: 'scan-plant', tags: ['flora'],
            x: w.dryBasin.x + (i - 1) * 12, z: w.dryBasin.z + (i % 2) * 10 - 5,
            biome: 'plains', scanned: false,
            clueText: '在一天內完成從種子到開花。這片土地憋了太久，正在補償時間。'
          });
        }
        if (!replay) this.destiny.adjustEco(2);
        break;
      }
      case 'island-stabilized': { // 啟動機械 → 浮島停止晃動，可通行
        const fi = w.anomalies.find(a => a.id === 'float-island');
        if (fi) { fi.stabilized = true; fi.bobAmp = 0.5; }
        break;
      }
      case 'gate-opened': {
        const g = w.landmarks.find(l => l.id === 'ancient-gate');
        if (g) g.decoded = true;
        break;
      }
      case 'hollow-revealed': {
        const h = w.landmarks.find(l => l.id === 'hollow-site');
        if (h) h.found = true;
        break;
      }
      // ---- 矛盾引擎的代價 ----
      case 'forest-logging': { // 繁榮 → 砍伐發光森林邊緣
        w.ecoRegions['glow-forest'].logged = true;
        w.ecoRegions['glow-forest'].stability -= 2;
        if (!replay) this.destiny.adjustEco(-2);
        break;
      }
      case 'silent-forest': { // 過獵 → 獸群躲藏
        w.ecoRegions['glow-forest'].silent = true;
        for (const a of w.animals) {
          if (a.alive && (a.kind === 'lumen-deer' || a.kind === 'grazer')) a.fleeing = true;
        }
        break;
      }
      case 'stalker-spawn': { // 過獵 → 反向追蹤者
        if (!w.animals.some(a => a.id === 'stalker')) {
          w.animals.push({
            id: 'stalker', kind: 'stalker', name: '？？？',
            x: 0, z: 0, homeX: 0, homeZ: 0, alive: true, fleeing: false,
            stalking: true, scanAction: 'scan-animal', huntAction: 'hunt-rare',
            tags: ['fauna', 'rare']
          });
        }
        break;
      }
      case 'village-schism': { w.village.state = 'schism'; break; }
      case 'pest-swarm': { w.ecoRegions.plains.pests = true; if (!replay) this.destiny.adjustEco(-1); break; }
      case 'cave-flooding': { w.ecoRegions['river-valley'].stability -= 1; break; }
      default: break; // 其餘後果型在地圖傳聞層呈現（missing-travelers 等）
    }
    bus.emit('render-update', { type });
  }

  toJSON() { return { applied: this.applied }; }
  load(s) { if (s) this.applied = s.applied ?? []; }
}
