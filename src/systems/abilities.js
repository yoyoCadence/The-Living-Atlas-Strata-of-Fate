// Player Ability System：能力 = 新的感知方式。
// 解鎖條件由玩家行為自然達成；啟用後改變渲染層可見資訊、Living Map 圖層與生成權重。

import { bus } from '../core/bus.js';
import { ABILITIES } from '../data/abilities.js';

export class AbilitySystem {
  constructor(memory, scanning) {
    this.memory = memory;
    this.scanning = scanning;
    this.unlocked = new Set();
    this.active = new Set();
    this._completedHypoTags = new Set();
    this._titleEarned = false;
    bus.on('action', () => this.checkUnlocks());
    bus.on('clue', () => this.checkUnlocks());
    bus.on('hypothesis-completed', ({ hypothesis }) => {
      for (const t of hypothesis.hypoTags ?? []) this._completedHypoTags.add(t);
      this.checkUnlocks();
    });
    bus.on('title-earned', () => { this._titleEarned = true; this.checkUnlocks(); });
  }

  condMet(c) {
    switch (c.type) {
      case 'and': return c.conds.every(x => this.condMet(x));
      case 'climb-count': return this.memory.data.climbs >= c.count;
      case 'scan-tags': {
        const n = c.tags.reduce((a, t) => a + (this.memory.data.scanTags[t] ?? 0), 0);
        return n >= c.count;
      }
      case 'hypothesis-completed': return this._completedHypoTags.has(c.hypoTag);
      case 'title-earned': return this._titleEarned;
      default: return false;
    }
  }

  checkUnlocks() {
    for (const a of ABILITIES) {
      if (this.unlocked.has(a.id)) continue;
      if (this.condMet(a.unlock)) {
        this.unlocked.add(a.id);
        if (a.toggleable) this.active.add(a.id);
        bus.emit('ability-unlocked', { ability: a });
        bus.emit('toast', { text: '❖ 能力覺醒：「' + a.name + '」 — ' + a.desc, kind: 'clue' });
      }
    }
  }

  toggle(id) {
    if (!this.unlocked.has(id)) return false;
    const a = ABILITIES.find(x => x.id === id);
    if (!a?.toggleable) { bus.emit('ability-used', { id }); return true; }
    if (this.active.has(id)) this.active.delete(id); else this.active.add(id);
    bus.emit('ability-toggled', { id, active: this.active.has(id) });
    bus.emit('action', { id: 'use-ability', ability: id });
    return true;
  }

  isActive(id) { return this.active.has(id); }
  isUnlocked(id) { return this.unlocked.has(id); }

  /** 解鎖進度提示（HUD / 地圖顯示「差什麼」——可推理的未知，而非隱藏條件） */
  unlockHints() {
    const hints = [];
    const walk = (c) => c.type === 'and' ? c.conds.flatMap(walk) : [c];
    for (const a of ABILITIES) {
      if (this.unlocked.has(a.id)) continue;
      const missing = walk(a.unlock).filter(c => !this.condMet(c)).map(c => c.hint);
      hints.push({ id: a.id, name: a.name, missing });
    }
    return hints;
  }

  /** 已解鎖能力的生成權重總和 */
  genWeights() {
    const out = {};
    for (const id of this.unlocked) {
      const a = ABILITIES.find(x => x.id === id);
      for (const [k, v] of Object.entries(a?.genWeights ?? {})) out[k] = Math.max(out[k] ?? 1, v);
    }
    return out;
  }

  toJSON() {
    return { unlocked: [...this.unlocked], active: [...this.active],
      hypoTags: [...this._completedHypoTags], titleEarned: this._titleEarned };
  }
  load(s) {
    if (!s) return;
    this.unlocked = new Set(s.unlocked ?? []);
    this.active = new Set(s.active ?? []);
    this._completedHypoTags = new Set(s.hypoTags ?? []);
    this._titleEarned = s.titleEarned ?? false;
  }
}
