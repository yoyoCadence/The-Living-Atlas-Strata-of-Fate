// Player Ability System 資料定義。
// 能力不是加數值，而是改變玩家「理解世界的方式」：每個能力都開啟新的可見資訊層、
// 讓舊區域出現新解法、並回饋到世界生成權重與矛盾事件。
// unlock: { type, ... } 由 systems/abilities.js 判定。

export const ABILITIES = [
  {
    id: 'wind-sense',
    name: '風息感知',
    key: '1',
    desc: '看見氣流、上升風與滑翔路線。高處不再只是風景，而是路。',
    unlock: { type: 'and', conds: [
      { type: 'climb-count', count: 1, hint: '攀上一座高地標' },
      { type: 'scan-tags', tags: ['wind'], count: 2, hint: '掃描 2 處氣流' }
    ]},
    mapLayer: 'inference',
    genWeights: { verticality: 1.5, glideRoutes: 1.5 },
    contradictionHooks: ['fog-attracts-lost'],
    toggleable: true
  },
  {
    id: 'echo-vision',
    name: '回聲視覺',
    key: '2',
    desc: '看見地下空洞與隱藏結構。你腳下的世界比你以為的更空。',
    unlock: { type: 'hypothesis-completed', hypoTag: 'underground', hint: '完成一條與地下有關的推論' },
    mapLayer: 'anomaly',
    genWeights: { caves: 1.5, undergroundCities: 1.5 },
    contradictionHooks: ['machine-floods-below'],
    toggleable: true
  },
  {
    id: 'geopulse',
    name: '地脈震鳴',
    key: '3',
    desc: '啟動古代機械與地脈節點。古文明的工程在等一隻會敲門的手。',
    unlock: { type: 'and', conds: [
      { type: 'scan-tags', tags: ['mineral'], count: 2, hint: '掃描 2 處礦脈' },
      { type: 'scan-tags', tags: ['glyph'], count: 1, hint: '掃描 1 處古文字' }
    ]},
    mapLayer: 'civilization',
    genWeights: { leyworks: 1.5, floatMachines: 1.5 },
    contradictionHooks: ['machine-floods-below'],
    toggleable: false
  },
  {
    id: 'ecology-hearing',
    name: '生態聽覺',
    key: '4',
    desc: '聽見動物遷徙、危險訊號與生態失衡的低語。',
    unlock: { type: 'scan-tags', tags: ['fauna', 'flora'], count: 5, hint: '掃描 5 個動植物' },
    mapLayer: 'ecology',
    genWeights: { rareSpecies: 1.5, sanctuaries: 1.3 },
    contradictionHooks: ['cull-imbalance'],
    toggleable: true
  },
  {
    id: 'time-residue',
    name: '時痕殘影',
    key: '5',
    desc: '看見某地過去發生的短暫殘影。遺跡會重播它的最後一天。',
    unlock: { type: 'scan-tags', tags: ['memory'], count: 2, hint: '掃描 2 處記憶殘留' },
    mapLayer: 'memory',
    genWeights: { historyConflicts: 1.5, archives: 1.3 },
    contradictionHooks: ['truth-breaks-faith'],
    toggleable: true
  },
  {
    id: 'star-navigation',
    name: '星圖導航',
    key: '6',
    desc: '夜晚顯示隱藏道路與星象方向。星星是最古老的道路。',
    unlock: { type: 'scan-tags', tags: ['star'], count: 2, hint: '掃描 2 處星象石' },
    mapLayer: 'anomaly',
    genWeights: { lostRoutes: 1.5, skyAnchors: 1.3 },
    contradictionHooks: ['observatory-acceleration'],
    toggleable: true
  },
  {
    id: 'myth-sight',
    name: '神話視界',
    key: '7',
    desc: '看見你的稱號正在如何改變世界生成——命運不再是抽象的。',
    unlock: { type: 'title-earned', hint: '獲得第一個稱號' },
    mapLayer: 'destiny',
    genWeights: {},
    contradictionHooks: [],
    toggleable: true
  }
];
