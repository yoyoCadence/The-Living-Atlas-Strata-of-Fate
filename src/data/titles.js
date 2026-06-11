// Personal Myth Generator 資料：稱號不是裝飾，而是世界生成權重。
// condition: 兩主軸 + 門檻；genEffects: 影響 worldgen 權重；mapClass: Living Map 視覺；
// rumors: NPC 傳聞模板（{player} 代換）；contradictionHooks: 可能引發的矛盾事件 id。

export const TITLES = [
  {
    id: 'mist-cartographer',
    name: '踏霧製圖者',
    axes: ['explorer', 'archivist'], threshold: 10,
    desc: '你走進沒有名字的地方，並給它們名字。',
    genEffects: { fogZones: 2, watchtowers: 2, lostRoutes: 1.5 },
    mapClass: 'myth-explorer',
    rumors: [
      '聽說{player}能找到地圖上不存在的路。',
      '有商人說，跟著那個製圖者的標記走，霧會自己散開。',
      '邊境的霧最近變厚了——好像在等人來畫它。'
    ],
    contradictionHooks: ['fog-attracts-lost']
  },
  {
    id: 'vein-mender',
    name: '河脈修復師',
    axes: ['restorer', 'shaper'], threshold: 10,
    desc: '乾涸之地記得你的手。',
    genEffects: { dryBasins: 2, waterworks: 2, rebuildQuests: 1.5 },
    mapClass: 'myth-restorer',
    rumors: [
      '有個拿地圖的人讓井重新冒水。',
      '聽說乾谷那邊又有水聲了。',
      '商隊準備重新開那條路了——水回來了。'
    ],
    contradictionHooks: ['prosperity-deforestation']
  },
  {
    id: 'tongue-of-stone',
    name: '古語聽者',
    axes: ['seeker', 'archivist'], threshold: 10,
    desc: '石頭對你說話，而你聽得懂。',
    genEffects: { glyphPuzzles: 2, archives: 2, historyConflicts: 1.5 },
    mapClass: 'myth-seeker',
    rumors: [
      '學者說{player}能聽見石頭說話。',
      '北邊的石門昨晚亮了一次。',
      '有人聽見地下傳來鐘聲——就在那人經過之後。'
    ],
    contradictionHooks: ['truth-breaks-faith']
  },
  {
    id: 'border-stalker',
    name: '邊境獵影',
    axes: ['predator', 'explorer'], threshold: 10,
    desc: '你越過邊界狩獵，邊界也開始狩獵你。',
    genEffects: { beastTrails: 2, dangerTerrain: 1.5, counterHunts: 2 },
    mapClass: 'myth-predator',
    rumors: [
      '獵人說{player}去過沒人回來過的地方。',
      '森林最近太安靜了。',
      '那些獸不是消失，是開始躲人了。'
    ],
    contradictionHooks: ['prey-turns-hunter', 'pest-outbreak']
  },
  {
    id: 'terrain-decoder',
    name: '地形解碼者',
    axes: ['shaper', 'seeker'], threshold: 10,
    desc: '在你眼中，山河是一道未解完的方程式。',
    genEffects: { reconfigMazes: 2, floatMachines: 2, leyworks: 1.5 },
    mapClass: 'myth-shaper',
    rumors: [
      '傳聞{player}能改寫山河。',
      '浮島昨天移了位置——有人在底下動了什麼。',
      '老礦工說地脈的聲音變了。'
    ],
    contradictionHooks: ['machine-floods-below']
  },
  {
    id: 'ember-shepherd',
    name: '綠燼牧者',
    axes: ['restorer', 'predator'], threshold: 10,
    desc: '你以獵刀行修復之事：為了森林活下去，有些東西必須死。',
    genEffects: { cullQuests: 2, plagueBeasts: 1.5, sanctuaries: 1.5 },
    mapClass: 'myth-restorer',
    rumors: [
      '那人獵殺的全是病獸——森林反而綠回來了。',
      '祭司說這是必要的火。',
      '有獵人不服氣：憑什麼他殺了沒事？'
    ],
    contradictionHooks: ['cull-imbalance']
  },
  {
    id: 'star-falcon',
    name: '星徑遊隼',
    axes: ['explorer', 'shaper'], threshold: 10,
    desc: '你不走路——你重新安排路。',
    genEffects: { verticality: 2, glideRoutes: 2, skyAnchors: 1.5 },
    mapClass: 'myth-explorer',
    rumors: [
      '有人看見{player}從浮山上一躍而下，沒有摔死。',
      '懸崖上多了奇怪的錨點，像是給會飛的人用的。',
      '孩子們開始爬高了，村長很頭痛。'
    ],
    contradictionHooks: ['fog-attracts-lost']
  },
  {
    id: 'silent-codex',
    name: '緘默獵典',
    axes: ['predator', 'archivist'], threshold: 10,
    desc: '你記錄每一次獵殺，像在編一部血寫的百科。',
    genEffects: { rareSpecies: 1.5, beastTrails: 1.5, archives: 1.5 },
    mapClass: 'myth-predator',
    rumors: [
      '那本獵冊上記著連學者都沒見過的生物。',
      '有學者想出錢買{player}的筆記。',
      '被記進那本冊子的獸，後來都不見了。'
    ],
    contradictionHooks: ['pest-outbreak', 'scholar-bidding-war']
  },
  {
    id: 'fate-anchor',
    name: '命運織錨',
    axes: ['seeker', 'restorer'], threshold: 10,
    desc: '你追索真相，不是為了知道，而是為了縫合。',
    genEffects: { historyConflicts: 2, rebuildQuests: 1.5, archives: 1.5 },
    mapClass: 'myth-seeker',
    rumors: [
      '{player}把兩個世仇村落的族譜接上了。',
      '老人們說，有些傷口要先撕開才能縫。',
      '神殿的人對那個追索者又敬又怕。'
    ],
    contradictionHooks: ['truth-breaks-faith']
  },
  {
    id: 'nameless-walker',
    name: '無名行者',
    axes: [], threshold: 0,
    desc: '世界還在觀察你。你的命運尚未成形。',
    genEffects: {},
    mapClass: '',
    rumors: [
      '最近有個外地人在到處走，沒人知道在找什麼。',
      '那人帶著一張會自己變化的地圖。',
      '可能只是個迷路的旅人吧。'
    ],
    contradictionHooks: []
  }
];

/** 依命運軸取得目前稱號（最高兩軸需同時超過門檻；否則回傳無名行者） */
export function evaluateTitle(axes) {
  const sorted = Object.entries(axes)
    .filter(([k]) => k !== 'ecoStability')
    .sort((a, b) => b[1] - a[1]);
  const [top1, top2] = sorted;
  let best = TITLES.find(t => t.id === 'nameless-walker');
  for (const t of TITLES) {
    if (!t.axes.length) continue;
    const [a, b] = t.axes;
    const va = axes[a] ?? 0, vb = axes[b] ?? 0;
    if (va >= t.threshold && vb >= t.threshold * 0.6) {
      // 必須是玩家實際最高的兩軸之一才成立
      const topKeys = [top1?.[0], top2?.[0]];
      if (topKeys.includes(a) && (topKeys.includes(b) || vb >= t.threshold)) {
        if (!best.axes.length || (va + vb) > ((axes[best.axes[0]] ?? 0) + (axes[best.axes[1]] ?? 0))) {
          best = t;
        }
      }
    }
  }
  return best;
}
