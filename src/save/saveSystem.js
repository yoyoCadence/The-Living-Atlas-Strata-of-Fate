// Save / Load：localStorage JSON。世界由 seed + 已套用變化重建，存檔只存「差異與記憶」。

const KEY = 'living-atlas-save-v1';

export class SaveSystem {
  constructor(game) { this.g = game; }

  save() {
    const g = this.g;
    const data = {
      version: 1,
      time: Date.now(),
      seed: g.world.seed,
      player: { x: g.player.pos.x, y: g.player.pos.y, z: g.player.pos.z, yaw: g.player.yaw },
      memory: g.memory.toJSON(),
      destiny: g.destiny.toJSON(),
      myth: g.myth.toJSON(),
      rumor: g.rumor.toJSON(),
      contradiction: g.contradiction.toJSON(),
      scanning: g.scanning.toJSON(),
      inference: g.inference.toJSON(),
      abilities: g.abilities.toJSON(),
      worldResponse: g.worldResponse.toJSON(),
      scannedIds: g.world.scannables.filter(s => s.scanned).map(s => s.id),
      deadAnimals: g.world.animals.filter(a => !a.alive).map(a => a.id),
      helpedNpcIds: g.world.npcs.filter(n => n.helped).map(n => n.id)
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch { return false; }
  }

  static peek() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  /** 在 world 重建後呼叫：把存檔狀態鋪回系統 */
  apply(data) {
    const g = this.g;
    g.memory.load(data.memory);
    g.destiny.load(data.destiny);
    g.myth.load(data.myth);
    g.rumor.load(data.rumor);
    g.contradiction.load(data.contradiction);
    g.scanning.load(data.scanning);
    g.inference.load(data.inference);
    g.abilities.load(data.abilities);
    g.worldResponse.load(data.worldResponse);
    g.worldResponse.setWorld(g.world); // 重播世界變化
    for (const id of data.scannedIds ?? []) {
      const s = g.world.scannables.find(x => x.id === id);
      if (s) s.scanned = true;
    }
    for (const id of data.deadAnimals ?? []) {
      const a = g.world.animals.find(x => x.id === id);
      if (a) a.alive = false;
    }
    for (const id of data.helpedNpcIds ?? []) {
      const n = g.world.npcs.find(x => x.id === id);
      if (n) n.helped = true;
    }
    if (data.player) {
      g.player.pos.x = data.player.x;
      g.player.pos.y = data.player.y;
      g.player.pos.z = data.player.z;
      g.player.yaw = data.player.yaw ?? 0;
    }
  }

  clear() { localStorage.removeItem(KEY); }
}
