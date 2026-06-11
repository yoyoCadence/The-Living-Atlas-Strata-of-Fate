// Destiny Axis System：六軸命運傾向。
// 不是善惡值，而是「玩家如何面對世界」。每個行為都會偏移；偏移會回饋到生成、
// 傳聞、稱號、矛盾與結局方向。

import { bus } from '../core/bus.js';
import { ACTION_EFFECTS, AXES } from '../data/actions.js';

export class Destiny {
  constructor() {
    this.axes = { explorer: 0, restorer: 0, archivist: 0, seeker: 0, shaper: 0, predator: 0 };
    this.ecoStability = 0; // 全域生態穩定度（負值 = 失衡）
    bus.on('action', (a) => this.apply(a.id));
  }

  apply(actionId) {
    const eff = ACTION_EFFECTS[actionId];
    if (!eff) return;
    const deltas = {};
    for (const [k, v] of Object.entries(eff)) {
      if (k === 'ecoStability') { this.ecoStability += v; continue; }
      this.axes[k] = (this.axes[k] ?? 0) + v;
      deltas[k] = v;
    }
    bus.emit('destiny-changed', { axes: { ...this.axes }, deltas, ecoStability: this.ecoStability });
  }

  adjustEco(v) {
    this.ecoStability += v;
    bus.emit('destiny-changed', { axes: { ...this.axes }, deltas: {}, ecoStability: this.ecoStability });
  }

  /** 最高的兩軸（給稱號與 UI 用） */
  topAxes(n = 2) {
    return AXES.map(k => [k, this.axes[k]]).sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  /** 命運軸 → 世界生成權重（Destiny 影響後續生成的核心管道） */
  genWeights() {
    const w = {}, ax = this.axes;
    const lv = (v) => 1 + Math.min(1, v / 25) * 0.8; // 0→1, 25+→1.8
    if (ax.explorer > 6) { w.fogZones = lv(ax.explorer); w.lostRoutes = lv(ax.explorer); }
    if (ax.restorer > 6) { w.dryBasins = lv(ax.restorer); w.rebuildQuests = lv(ax.restorer); }
    if (ax.archivist > 6) { w.archives = lv(ax.archivist); }
    if (ax.seeker > 6) { w.glyphPuzzles = lv(ax.seeker); w.historyConflicts = lv(ax.seeker); }
    if (ax.shaper > 6) { w.leyworks = lv(ax.shaper); w.floatMachines = lv(ax.shaper); }
    if (ax.predator > 6) { w.beastTrails = lv(ax.predator); w.counterHunts = lv(ax.predator); }
    return w;
  }

  toJSON() { return { axes: this.axes, ecoStability: this.ecoStability }; }
  load(s) { if (s) { Object.assign(this.axes, s.axes); this.ecoStability = s.ecoStability ?? 0; } }
}
