// Contradiction Engine：玩家的成功會長出新的問題。
// 監聽世界事件 / 行為統計 / 稱號授予，符合 trigger 即排程矛盾（延遲浮現，先甜後苦）。

import { bus } from '../core/bus.js';
import { CONTRADICTIONS } from '../data/contradictions.js';

export class ContradictionEngine {
  constructor(memory) {
    this.memory = memory;
    this.fired = new Set();      // 已觸發過的矛盾 id
    this.scheduled = new Set();
    this.active = [];            // 已浮現、待玩家處理的矛盾
    this.timers = [];
    this.events = new Set();
    // 先記錄事件、再評估觸發條件（順序很重要）
    bus.on('world-event', (e) => { this.events.add(e.id); this.evaluate(); });
    bus.on('action', () => this.evaluate());
    bus.on('title-earned', ({ title }) => this.evaluate(title.id));
  }

  evaluate(titleId = null) {
    for (const c of CONTRADICTIONS) {
      if (this.fired.has(c.id) || this.scheduled.has(c.id)) continue;
      if (this.matches(c.trigger, titleId)) this.schedule(c);
    }
  }

  matches(trigger, titleId) {
    if (trigger.event) return this.events.has(trigger.event);
    if (trigger.actionCount) {
      return Object.entries(trigger.actionCount)
        .every(([k, v]) => (this.memory.data.actions[k] ?? 0) >= v);
    }
    if (trigger.titleEarned) return trigger.titleEarned === titleId;
    return false;
  }

  schedule(c) {
    this.scheduled.add(c.id);
    const t = setTimeout(() => this.fire(c), c.delayMs);
    this.timers.push(t);
  }

  fire(c) {
    this.scheduled.delete(c.id);
    this.fired.add(c.id);
    this.active.push({ id: c.id, name: c.name, longTerm: c.longTerm, responses: c.playerResponses, time: Date.now() });
    bus.emit('contradiction', { event: c });
    bus.emit('toast', { text: '⚖ 矛盾浮現：「' + c.name + '」 — ' + c.longTerm, kind: 'contradiction' });
    // 套用世界變化（由 WorldResponse 執行具體 mutation）
    for (const ch of c.worldChanges) bus.emit('world-change', ch);
    // 未解之謎 +1：留下回流動機
    this.memory.data.unresolved.push(c.id);
  }

  /** debug 用：直接觸發 */
  force(id) {
    const c = CONTRADICTIONS.find(x => x.id === id);
    if (c && !this.fired.has(c.id)) this.fire(c);
    return !!c;
  }

  dispose() { for (const t of this.timers) clearTimeout(t); }

  toJSON() { return { fired: [...this.fired], active: this.active, events: [...this.events] }; }
  load(s) {
    if (!s) return;
    this.fired = new Set(s.fired ?? []);
    this.active = s.active ?? [];
    this.events = new Set(s.events ?? []);
  }
}
