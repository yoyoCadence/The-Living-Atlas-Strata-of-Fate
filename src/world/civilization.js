// Civilization Layer。
// 因果規則：村落靠水（湖畔）、道路連接聚落與地標、遺跡沿古道與地脈分布、
// 符號有一致語法（同一 glyph 字元集 + 朝向規律，供 Inference 使用）。

export function buildCivilization(terrain, rng, weights) {
  const r = rng.fork('civ');
  const { lake } = terrain;

  // 村落：湖東岸（靠水源規則）
  const village = {
    id: 'village', name: '湖畔村', kind: 'village',
    x: lake.x + lake.r + 18, z: lake.z - 10,
    state: 'stable', // stable | prospering | schism | declining
    huts: []
  };
  for (let i = 0; i < 4; i++) {
    village.huts.push({
      x: village.x + r.float(-14, 14),
      z: village.z + r.float(-14, 14),
      rot: r.float(0, Math.PI * 2)
    });
  }

  // 地標（位置遵循地形邏輯：塔在平原制高、門在森林古道端、天文台在丘陵）
  const landmarks = [
    { id: 'skyspire', name: '望星塔', kind: 'tower', x: -10, z: -60, climbable: true,
      desc: '平原上唯一的垂直線。塔頂可以看見世界的形狀。' },
    { id: 'ancient-gate', name: '古道之門', kind: 'gate', x: -150, z: -70, decoded: false,
      desc: '森林裡的石門，刻滿同一種語法的符號。它在等一個讀者。' },
    { id: 'observatory', name: '折翼天文台', kind: 'observatory', x: 130, z: 90, restored: false,
      desc: '半塌的穹頂。鏡片碎了，但星軌刻度還在。' },
    { id: 'lumen-tree', name: '燈心巨樹', kind: 'tree', x: -180, z: 30,
      desc: '森林所有的光，都微微偏向它。' },
    { id: 'stone-circle', name: '環石陣', kind: 'circle', x: 30, z: -10,
      desc: '河谷邊的石環。中央的草不往任何方向倒。' },
    { id: 'water-node', name: '乾谷水脈節點', kind: 'node', x: terrain.dryBasin.x - 30, z: terrain.dryBasin.z - 38, active: false,
      desc: '半埋的古代閘機。裡面還有水聲，很深。' },
    { id: 'hollow-site', name: '低語窪地', kind: 'hollow', x: 60, z: 30, found: false,
      desc: '獸群繞著走的窪地。回聲不對。' },
    { id: 'village', name: '湖畔村', kind: 'village', x: village.x, z: village.z,
      desc: '靠湖而生的小聚落。傳聞在這裡流通。' }
  ];

  // 觀測塔加生成權重（踏霧製圖者效果示範）
  const extraTowers = Math.round(((weights.watchtowers ?? 1) - 1) * 2);
  for (let i = 0; i < extraTowers; i++) {
    landmarks.push({
      id: 'watchtower-' + i, name: '邊境觀測塔', kind: 'tower', climbable: true,
      x: r.float(-240, 240), z: r.float(-240, -120),
      desc: '為走進霧裡的人而建。'
    });
  }

  // 古道：村落 → 環石陣 → 古道之門；村落 → 天文台（道路連接聚落與地標規則）
  const roads = [
    [{ x: village.x, z: village.z }, { x: 30, z: -10 }, { x: -150, z: -70 }],
    [{ x: village.x, z: village.z }, { x: 60, z: 110 }, { x: 130, z: 90 }]
  ];

  // NPC：村民×3 + 行商×1，每人有身分（傳聞來源語氣）與一次性「協助」互動
  const npcs = [
    { id: 'npc-elder', name: '老村長 茉殼', role: '村民', x: village.x + 6, z: village.z + 4, helped: false,
      helpText: '幫她把曬藥的架子搬回屋裡' },
    { id: 'npc-scholar', name: '學者 聿風', role: '學者', x: village.x - 8, z: village.z + 10, helped: false,
      helpText: '聽他講完關於古語的假說' },
    { id: 'npc-hunter', name: '獵人 卡岸', role: '獵人', x: village.x + 2, z: village.z - 12, helped: false,
      helpText: '幫他檢查獸夾的位置' },
    { id: 'npc-trader', name: '行商 蘆笙', role: '商人', x: 30, z: -4, helped: false,
      helpText: '幫他把翻倒的貨箱扶正' }
  ];

  // 古文明符號語法：同一字元集，朝向統一指向古道之門（Inference 線索的「一致語法」）
  const glyphSyntax = { charset: ['◇', '〤', '彡', '⊃', '∴', '卄'], orientationTarget: 'ancient-gate' };

  return { village, landmarks, roads, npcs, glyphSyntax };
}
