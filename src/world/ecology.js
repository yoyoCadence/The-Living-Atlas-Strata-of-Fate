// Ecology Layer。
// 規則：生物有棲地偏好、掠食者與獵物關聯、稀有物種條件式出現（非隨機掉落）、
// 玩家破壞生態 → 區域狀態改變（由 WorldResponse 操作這裡的資料）。

export function buildEcology(terrain, rng, weights) {
  const r = rng.fork('eco');
  const animals = [];

  // 草食獸：平原與河谷（棲地偏好），形成獸徑（迴避低語窪地 → 推理線索）
  const grazerCount = Math.round(8 * (weights.beastTrails ?? 1));
  let placed = 0, guard = 0;
  while (placed < grazerCount && guard++ < 200) {
    const x = r.float(-220, 220), z = r.float(-200, 220);
    const b = terrain.biomeAt(x, z);
    if (b !== 'plains' && b !== 'river-valley') continue;
    if (Math.hypot(x - 60, z - 30) < 40) continue; // 迴避窪地（因果，不是隨機）
    animals.push({
      id: 'grazer-' + placed, kind: 'grazer', name: '草原蹄獸',
      x, z, homeX: x, homeZ: z, alive: true, fleeing: false,
      scanAction: 'scan-animal', huntAction: 'hunt-animal', tags: ['fauna']
    });
    placed++;
  }

  // 森林光鹿：發光森林限定
  for (let i = 0; i < 3; i++) {
    const x = r.float(-230, -80), z = r.float(-60, 100);
    if (terrain.biomeAt(x, z) !== 'glow-forest') continue;
    animals.push({
      id: 'lumen-deer-' + i, kind: 'lumen-deer', name: '燈苔鹿',
      x, z, homeX: x, homeZ: z, alive: true, fleeing: false,
      scanAction: 'scan-animal', huntAction: 'hunt-animal', tags: ['fauna', 'flora']
    });
  }

  // 稀有巨獸：條件式出現——只在山腳、且生態穩定度未崩潰時現身
  animals.push({
    id: 'apex-beast', kind: 'apex', name: '岩背巨獸',
    x: terrain.mountCenter.x - 70, z: terrain.mountCenter.z + 80,
    homeX: terrain.mountCenter.x - 70, homeZ: terrain.mountCenter.z + 80,
    alive: true, fleeing: false, rare: true,
    appearCondition: (state) => (state.ecoStability ?? 0) > -4,
    scanAction: 'scan-animal', huntAction: 'hunt-rare', tags: ['fauna', 'rare']
  });

  // 遷徙路徑（地圖生態層顯示；生態聽覺能力可在世界中聽見）
  const migrations = [
    { id: 'mig-1', points: [{ x: -200, z: 160 }, { x: -80, z: 60 }, { x: 60, z: -40 }, { x: 180, z: -80 }] }
  ];

  // 區域生態狀態（WorldResponse / Contradiction 會改寫）
  const regions = {
    'glow-forest': { stability: 0, silent: false, logged: false },
    plains: { stability: 0, pests: false },
    'river-valley': { stability: 0 },
    'dry-basin': { stability: -3, restored: false }
  };

  return { animals, migrations, regions };
}
