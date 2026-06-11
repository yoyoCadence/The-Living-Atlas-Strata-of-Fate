// Inference System：線索 → 推論 (hypothesis)。
// 推論指向地點與建議行動；玩家可接受 / 忽略；抵達目標執行後完成，
// 完成會觸發世界事件（也可能埋下矛盾）。

import { bus } from '../core/bus.js';
import { INFERENCE_RULES } from '../data/inferenceRules.js';

export class InferenceSystem {
  constructor(scanning, memory, world) {
    this.scanning = scanning;
    this.memory = memory;
    this.world = world;
    this.hypotheses = []; // { id, title, text, relatedClues, confidence, target:{x,z,id}, suggestedAction, mapLayer, contradictionRisk, status }
    bus.on('clue', () => this.evaluate());
  }

  setWorld(world) { this.world = world; }

  evaluate() {
    for (const rule of INFERENCE_RULES) {
      if (this.hypotheses.some(h => h.id === rule.id)) continue;
      const groups = rule.need.map(g => ({
        ...g,
        found: this.scanning.clues.filter(c => c.tags.some(t => g.tags.includes(t)))
      }));
      if (!groups.every(g => g.found.length >= g.count)) continue;
      const related = [...new Set(groups.flatMap(g => g.found.map(c => c.id)))];
      const totalNeed = rule.need.reduce((a, g) => a + g.count, 0);
      const h = {
        id: rule.id,
        title: rule.title,
        text: rule.text,
        relatedClues: related,
        confidence: Math.min(0.95, 0.5 + 0.1 * related.length + 0.05 * totalNeed),
        target: { ...this.world.locate(rule.target), id: rule.target },
        suggestedAction: rule.suggestedAction,
        mapLayer: rule.mapLayer,
        contradictionRisk: rule.contradictionRisk,
        hypoTags: rule.hypoTags,
        onComplete: rule.onComplete,
        status: 'new' // new | accepted | ignored | completed
      };
      for (const cid of related) {
        const c = this.scanning.clues.find(x => x.id === cid);
        if (c) c.linkedHypotheses.push(h.id);
      }
      this.hypotheses.push(h);
      this.memory.data.unresolved.push(h.id);
      bus.emit('hypothesis', { hypothesis: h });
      bus.emit('toast', { text: '☄ 新推論：「' + h.title + '」 — 打開地圖查看', kind: 'clue' });
    }
  }

  accept(id) {
    const h = this.hypotheses.find(x => x.id === id);
    if (h && h.status !== 'completed') {
      h.status = 'accepted';
      this.memory.data.hypothesesAccepted.push(id);
      bus.emit('action', { id: 'accept-hypothesis', hypoId: id });
    }
  }

  ignore(id) {
    const h = this.hypotheses.find(x => x.id === id);
    if (h && h.status === 'new') {
      h.status = 'ignored';
      this.memory.data.hypothesesIgnored.push(id);
    }
  }

  /** 玩家抵達目標並互動後呼叫 */
  complete(id) {
    const h = this.hypotheses.find(x => x.id === id);
    if (!h || h.status === 'completed') return null;
    h.status = 'completed';
    this.memory.data.hypothesesCompleted.push(id);
    this.memory.data.unresolved = this.memory.data.unresolved.filter(u => u !== id);
    if (h.onComplete?.action) bus.emit('action', { id: h.onComplete.action, hypoId: id, targetId: h.target.id });
    if (h.onComplete?.event) bus.emit('world-event', { id: h.onComplete.event, source: id });
    bus.emit('hypothesis-completed', { hypothesis: h });
    bus.emit('toast', { text: '✔ 推論證實：「' + h.title + '」', kind: 'clue' });
    return h;
  }

  /** 指定地點附近、已接受/新建且未完成的推論（給互動系統） */
  pendingAt(x, z, radius = 18) {
    return this.hypotheses.find(h =>
      h.status !== 'completed' && h.status !== 'ignored' &&
      Math.hypot(h.target.x - x, h.target.z - z) < radius);
  }

  toJSON() { return { hypotheses: this.hypotheses }; }
  load(s) { if (s) this.hypotheses = s.hypotheses ?? []; }
}
