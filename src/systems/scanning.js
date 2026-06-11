// Scanning System：掃描不給答案，只給線索。線索累積成推論（Inference）。

import { bus } from '../core/bus.js';

const TAG_LAYER = {
  flora: 'ecology', fauna: 'ecology', track: 'ecology', 'ecology-imbalance': 'ecology',
  glyph: 'civilization', memory: 'memory',
  wind: 'terrain', mineral: 'terrain',
  water: 'hydrology', anomaly: 'anomaly', star: 'anomaly', rare: 'ecology'
};

export class ScanningSystem {
  constructor(memory) {
    this.memory = memory;
    this.clues = []; // 完整 clue 資料結構
    this._n = 0;
  }

  /** 對 scannable / animal 執行掃描，產生 clue */
  scan(target) {
    if (target.scanned) return null;
    target.scanned = true;
    const tags = target.tags ?? [];
    const clue = {
      id: 'clue-' + (this._n++),
      type: target.kind,
      sourceObject: target.id,
      biome: target.biome ?? 'plains',
      location: { x: target.x, z: target.z },
      relatedLayer: TAG_LAYER[tags[0]] ?? 'terrain',
      text: target.clueText ?? ('掃描紀錄：' + target.name),
      confidence: 0.7,
      tags,
      discoveredTime: Date.now(),
      linkedHypotheses: []
    };
    this.clues.push(clue);
    this.memory.recordScan(target, clue);
    bus.emit('action', { id: target.action ?? target.scanAction, targetId: target.id, kind: target.kind });
    bus.emit('clue', { clue });
    bus.emit('toast', { text: '◈ 線索：' + clue.text, kind: 'clue' });
    return clue;
  }

  countByTags(tags) {
    return this.clues.filter(c => c.tags.some(t => tags.includes(t))).length;
  }

  toJSON() { return { clues: this.clues, n: this._n }; }
  load(s) { if (s) { this.clues = s.clues ?? []; this._n = s.n ?? this.clues.length; } }
}
