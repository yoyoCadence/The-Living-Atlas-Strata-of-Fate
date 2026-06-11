// World Rumor System：世界用語言回應玩家。
// 傳聞來源 = 模板庫（玩家行為/事件/生態）+ 稱號專屬傳聞 + 矛盾事件傳聞。
// NPC 對話時依角色身分取用；偶爾以「風中低語」浮現於 HUD。

import { bus } from '../core/bus.js';
import { RUMOR_TEMPLATES } from '../data/rumors.js';

export class RumorSystem {
  constructor(memory, destiny, myth, rng) {
    this.memory = memory;
    this.destiny = destiny;
    this.myth = myth;
    this.rng = rng.fork('rumor');
    this.events = new Set();      // 已發生的世界事件 id
    this.log = [];                // { text, source, time }
    this.extraPool = [];          // 矛盾事件 / 稱號注入的動態傳聞
    bus.on('world-event', (e) => { this.events.add(e.id); });
    bus.on('title-earned', ({ title }) => {
      for (const t of title.rumors) this.pushExtra(t, '村民');
    });
    bus.on('contradiction', ({ event }) => {
      for (const t of event.rumors) this.pushExtra(t, '村民');
    });
  }

  pushExtra(text, source) { this.extraPool.push({ text, source }); }

  playerName() {
    const t = this.myth.title;
    return t.id === 'nameless-walker' ? '那個帶地圖的外地人' : '「' + t.name + '」';
  }

  substitute(text) { return text.replaceAll('{player}', this.playerName()); }

  matches(tpl) {
    const w = tpl.when ?? {};
    if (w.event && !this.events.has(w.event)) return false;
    if (w.actionCountAtLeast) {
      for (const [k, v] of Object.entries(w.actionCountAtLeast)) {
        if ((this.memory.data.actions[k] ?? 0) < v) return false;
      }
    }
    if (w.ecoBelow !== undefined && this.destiny.ecoStability > w.ecoBelow) return false;
    if (w.ecoAbove !== undefined && this.destiny.ecoStability < w.ecoAbove) return false;
    return true;
  }

  /** 取得一則傳聞（可指定來源身分，例如和獵人對話） */
  generate(role = null) {
    // 動態池優先（矛盾/稱號傳聞最即時、最個人化）
    if (this.extraPool.length && this.rng.chance(0.6)) {
      const i = this.rng.int(0, this.extraPool.length - 1);
      const r = this.extraPool.splice(i, 1)[0];
      return this.record(r.text, role ?? r.source);
    }
    let pool = RUMOR_TEMPLATES.filter(t => this.matches(t));
    if (role) {
      const rolePool = pool.filter(t => t.source === role);
      if (rolePool.length) pool = rolePool;
    }
    // 避免重複：排掉最近 5 則
    const recent = this.log.slice(-5).map(l => l.text);
    const fresh = pool.filter(t => !recent.includes(this.substitute(t.text)));
    const tpl = this.rng.pick(fresh.length ? fresh : pool);
    return this.record(this.substitute(tpl.text), role ?? tpl.source);
  }

  record(text, source) {
    const r = { text, source, time: Date.now() };
    this.log.push(r);
    if (this.log.length > 60) this.log.shift();
    bus.emit('rumor', r);
    return r;
  }

  /** 環境氛圍傳聞（HUD 偶發） */
  ambient() {
    const r = this.generate();
    bus.emit('toast', { text: '〜 ' + r.source + '間流傳：' + r.text, kind: 'rumor' });
  }

  toJSON() { return { events: [...this.events], log: this.log, extraPool: this.extraPool }; }
  load(s) {
    if (!s) return;
    this.events = new Set(s.events ?? []);
    this.log = s.log ?? [];
    this.extraPool = s.extraPool ?? [];
  }
}
