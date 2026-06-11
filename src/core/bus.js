// 全域事件匯流排：系統之間唯一的耦合點。
// 主要事件：
//   'action'        玩家行為 { id, ...payload }   → Memory / Destiny / Rumor / Contradiction 監聽
//   'clue'          新線索 { clue }               → Inference / LivingMap 監聽
//   'hypothesis'    新推論 { hypothesis }
//   'hypothesis-completed' { hypothesis }
//   'destiny-changed' { axes, deltas }
//   'title-earned'  { title }
//   'ability-unlocked' { ability }
//   'world-event'   世界狀態改變 { id, ...payload } → WorldResponse / Contradiction / Rumor
//   'contradiction' { event }
//   'rumor'         { text, source }
//   'toast'         UI 通知 { text, kind }

class Bus {
  constructor() { this.listeners = new Map(); }
  on(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
    return () => this.off(type, fn);
  }
  off(type, fn) {
    const arr = this.listeners.get(type);
    if (arr) {
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    }
  }
  emit(type, payload = {}) {
    const arr = this.listeners.get(type);
    if (arr) for (const fn of arr.slice()) fn(payload);
  }
  clear() { this.listeners.clear(); }
}

export const bus = new Bus();
