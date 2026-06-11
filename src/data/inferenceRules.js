// Inference System 規則：多個線索 (clue tags) → hypothesis。
// need: [{ tags:[...], count }]，玩家收集到足夠帶有指定 tag 的線索即生成推論。
// target: 推論指向的世界節點 id（worldgen 提供座標）。
// onComplete: 抵達/執行後觸發的 world-event 與獎勵。

export const INFERENCE_RULES = [
  {
    id: 'hypo-dry-basin',
    title: '乾谷的枯竭與上游水脈堵塞有關',
    text: '三條線索都指向同一件事：乾谷不是天生乾的。上游的水脈節點若能重新啟動，水會回來。',
    need: [{ tags: ['water'], count: 1 }, { tags: ['ecology-imbalance', 'flora'], count: 1 }],
    target: 'water-node',
    suggestedAction: '前往乾谷上游的水脈節點，啟動它',
    mapLayer: 'hydrology',
    contradictionRisk: 'prosperity-deforestation',
    hypoTags: ['water', 'restore'],
    onComplete: { event: 'water-restored', action: 'restore-water' }
  },
  {
    id: 'hypo-glyph-gate',
    title: '符號都朝向古道之門',
    text: '你掃描的古文字共享同一種語法，且筆畫的「重心」一致偏向北方——它們像路標，指向森林裡的石門。',
    need: [{ tags: ['glyph'], count: 3 }],
    target: 'ancient-gate',
    suggestedAction: '帶著三段符號前往古道之門，嘗試拼讀',
    mapLayer: 'civilization',
    contradictionRisk: 'truth-breaks-faith',
    hypoTags: ['glyph', 'civilization'],
    onComplete: { event: 'gate-decoded', action: 'decode-glyph' }
  },
  {
    id: 'hypo-underground',
    title: '獸群迴避的低地下方可能有空洞',
    text: '兩處獸徑都繞開同一片窪地，而那裡的回聲不對。地面下可能藏著洞窟，或者……更大的東西。',
    need: [{ tags: ['track'], count: 2 }],
    target: 'hollow-site',
    suggestedAction: '前往窪地中心，仔細聆聽',
    mapLayer: 'anomaly',
    contradictionRisk: null,
    hypoTags: ['underground', 'ecology'],
    onComplete: { event: 'hollow-found', action: 'complete-hypothesis' }
  },
  {
    id: 'hypo-lumen-tree',
    title: '發光植物受到燈心巨樹的能量牽引',
    text: '每株發光植物的光暈都微微偏向森林深處的同一點。樹不是樹，是某種能量的出口。',
    need: [{ tags: ['flora'], count: 2 }, { tags: ['star', 'anomaly'], count: 1 }],
    target: 'lumen-tree',
    suggestedAction: '夜裡前往燈心巨樹，觀察光的流向',
    mapLayer: 'ecology',
    contradictionRisk: null,
    hypoTags: ['energy', 'ecology'],
    onComplete: { event: 'lumen-source-found', action: 'complete-hypothesis' }
  },
  {
    id: 'hypo-float-orbit',
    title: '浮島的移動週期可能與星象有關',
    text: '浮島的晃動不是隨機的——它的週期跟星象石上刻的環紋數吻合。古代機械可能還在運轉。',
    need: [{ tags: ['star'], count: 1 }, { tags: ['anomaly'], count: 1 }, { tags: ['mineral', 'glyph'], count: 1 }],
    target: 'float-island',
    suggestedAction: '前往浮空島下方的機械基座，啟動地脈節點',
    mapLayer: 'anomaly',
    contradictionRisk: 'machine-floods-below',
    hypoTags: ['machine', 'anomaly'],
    onComplete: { event: 'machine-activated', action: 'activate-machine' }
  },
  {
    id: 'hypo-reverse-river',
    title: '逆流河段被地脈扭曲',
    text: '河水在這一段往高處流。掃描顯示河床下的礦脈帶有反向的地磁紋——逆流不是異象，是機關。',
    need: [{ tags: ['anomaly'], count: 1 }, { tags: ['water'], count: 1 }],
    target: 'reverse-river',
    suggestedAction: '沿逆流而「下」，找到扭曲的源點',
    mapLayer: 'hydrology',
    contradictionRisk: 'river-redirect-wetland',
    hypoTags: ['anomaly', 'water'],
    onComplete: { event: 'reverse-source-found', action: 'complete-hypothesis' }
  }
];
