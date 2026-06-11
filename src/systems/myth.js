// Personal Myth Generator：根據 Destiny Axis 授予稱號。
// 稱號 = 世界生成權重 + NPC 傳聞模板 + Living Map 視覺 + 矛盾事件鉤子。

import { bus } from '../core/bus.js';
import { TITLES, evaluateTitle } from '../data/titles.js';

export class Myth {
  constructor(destiny, memory) {
    this.destiny = destiny;
    this.memory = memory;
    this.currentTitleId = 'nameless-walker';
    this.earned = []; // 歷來獲得過的稱號 id
    bus.on('destiny-changed', ({ axes }) => this.evaluate(axes));
  }

  get title() { return TITLES.find(t => t.id === this.currentTitleId); }

  evaluate(axes) {
    const t = evaluateTitle(axes);
    if (t.id !== this.currentTitleId) {
      this.currentTitleId = t.id;
      if (t.id !== 'nameless-walker' && !this.earned.includes(t.id)) {
        this.earned.push(t.id);
        bus.emit('title-earned', { title: t });
        bus.emit('toast', { text: '✦ 世界開始這樣稱呼你：「' + t.name + '」 — ' + t.desc, kind: 'rumor' });
      }
    }
  }

  /** 彙整所有生成權重來源：稱號 + 命運軸 + 行為記憶 + 能力（abilities 由外部傳入） */
  collectGenWeights(abilityWeights = {}) {
    const out = {};
    const merge = (w) => { for (const [k, v] of Object.entries(w)) out[k] = Math.max(out[k] ?? 1, v); };
    merge(this.title.genEffects ?? {});
    merge(this.destiny.genWeights());
    merge(this.memory.styleWeights());
    merge(abilityWeights);
    return out;
  }

  toJSON() { return { currentTitleId: this.currentTitleId, earned: this.earned }; }
  load(s) { if (s) { this.currentTitleId = s.currentTitleId; this.earned = s.earned ?? []; } }
}
