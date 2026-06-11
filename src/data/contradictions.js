// Contradiction Engine 資料：玩家的成功必須產生代價與新問題。
// trigger: 由 systems/contradiction.js 以 world-event / action 統計判定。
// delayMs: 成功後多久浮現矛盾（讓玩家先嚐到甜頭）。

export const CONTRADICTIONS = [
  {
    id: 'prosperity-deforestation',
    name: '繁榮的代價',
    trigger: { event: 'water-restored' },
    delayMs: 45000,
    region: 'dry-basin',
    shortTerm: '乾谷綠洲出現，村落人口增加，商路重開。',
    longTerm: '村落擴張開始砍伐發光森林邊緣，發光植物減少，森林生態穩定度下降。',
    playerResponses: ['劃定保育邊界（Restorer）', '幫村落找替代建材（Seeker）', '無視（森林持續退化）'],
    destinyEffect: { note: '玩家的回應決定 Restorer 或 Shaper 偏移' },
    worldChanges: [{ type: 'forest-logging' }],
    rumors: [
      '村子蓋新屋的木頭，是從會發光的樹上砍的。',
      '森林邊緣晚上沒那麼亮了。',
      '有水就有人，有人就有斧頭。'
    ]
  },
  {
    id: 'prey-turns-hunter',
    name: '獵物的反擊',
    trigger: { actionCount: { 'hunt-animal': 3 } },
    delayMs: 30000,
    region: 'glow-forest',
    shortTerm: '獵物豐收，皮毛與素材充足。',
    longTerm: '森林變得死寂，倖存獸群開始迴避並反向追蹤玩家——夜裡有東西跟著你。',
    playerResponses: ['停止狩獵讓生態恢復', '追獵「追蹤者」（高風險）', '繼續狩獵（恐懼傳聞擴散）'],
    destinyEffect: { predator: 2 },
    worldChanges: [{ type: 'silent-forest' }, { type: 'stalker-spawn' }],
    rumors: [
      '森林最近太安靜了。',
      '那些獸不是消失，是開始躲人了。',
      '有獵人說，現在有東西在反過來追蹤我們。'
    ]
  },
  {
    id: 'machine-floods-below',
    name: '浮島的陰影',
    trigger: { event: 'machine-activated' },
    delayMs: 40000,
    region: 'floating-mounts',
    shortTerm: '古代機械啟動，浮島軌道穩定，可以安全通行。',
    longTerm: '地脈水位改變，地下洞窟開始進水，洞中的記憶殘留正在被沖毀。',
    playerResponses: ['關閉機械（失去浮島通道）', '搶救地下檔案（限時探索）', '無視（地下層永久淹沒）'],
    destinyEffect: { shaper: 1 },
    worldChanges: [{ type: 'cave-flooding' }],
    rumors: [
      '井水的味道變了，帶著鐵鏽味。',
      '老礦工說地脈的聲音變了。',
      '地下傳來的不是鐘聲，是水聲。'
    ]
  },
  {
    id: 'truth-breaks-faith',
    name: '真相的重量',
    trigger: { event: 'gate-decoded' },
    delayMs: 35000,
    region: 'village',
    shortTerm: '你讀懂了古語：石門上刻的不是經文，是警告。',
    longTerm: '村中信仰動搖——祭司堅稱那是聖言，學者支持你的解讀，村落開始分裂。',
    playerResponses: ['公開全部真相（信仰崩潰，學者派壯大）', '隱瞞部分內容（Seeker -, 村落穩定）', '協助雙方對話（Restorer +）'],
    destinyEffect: { seeker: 1 },
    worldChanges: [{ type: 'village-schism' }],
    rumors: [
      '學者說那些符號不是文字，是警告。',
      '祭司這幾天都不出門。',
      '有年輕人開始不去神殿了。'
    ]
  },
  {
    id: 'pest-outbreak',
    name: '失衡的鏈',
    trigger: { actionCount: { 'hunt-rare': 1 } },
    delayMs: 30000,
    region: 'plains',
    shortTerm: '巨獸被獵殺，村落周邊安全了。',
    longTerm: '巨獸原本壓制的小型囓獸失控繁殖，啃食農田與商隊補給。',
    playerResponses: ['獵殺囓獸（治標，Predator +）', '引入新掠食者（生態實驗，Shaper +）', '修復棲地讓鏈重建（慢，Restorer +）'],
    destinyEffect: {},
    worldChanges: [{ type: 'pest-swarm' }],
    rumors: [
      '田裡的穀子一夜之間少了一半。',
      '以前那頭巨獸在的時候，沒這些小東西。',
      '商隊說補給袋被咬穿了。'
    ]
  },
  {
    id: 'fog-attracts-lost',
    name: '霧中來客',
    trigger: { titleEarned: 'mist-cartographer' },
    delayMs: 50000,
    region: 'fog-zone',
    shortTerm: '你的地圖讓迷霧地帶變得可通行。',
    longTerm: '沒有準備的旅人跟著你的傳聞走進霧中，開始有人失蹤。',
    playerResponses: ['設置警示標記（Archivist +）', '進霧搜救（Explorer +）', '無視（失蹤傳聞累積）'],
    destinyEffect: {},
    worldChanges: [{ type: 'missing-travelers' }],
    rumors: [
      '又有人想學那個製圖者走霧路，沒回來。',
      '霧裡有燈，但不是每盞都該跟。',
      '村長想請人在霧口立碑。'
    ]
  },
  {
    id: 'open-road-invasion',
    name: '雙向的門',
    trigger: { event: 'ancient-road-opened' },
    delayMs: 45000,
    region: 'ancient-road',
    shortTerm: '古道開通，商業繁榮，村落物資豐富。',
    longTerm: '敵對派系也沿著古道而來，商路開始被劫掠。',
    playerResponses: ['協防商路', '與派系談判', '封回古道（繁榮消失）'],
    destinyEffect: {},
    worldChanges: [{ type: 'raider-camps' }],
    rumors: ['路通了，好人壞人都會走。', '上週商隊少了兩車貨。', '有人在古道盡頭看見不認識的旗子。']
  },
  {
    id: 'river-redirect-wetland',
    name: '此消彼長',
    trigger: { event: 'river-redirected' },
    delayMs: 40000,
    region: 'river-valley',
    shortTerm: '沙漠邊緣開始綠化，新耕地出現。',
    longTerm: '原下游濕地乾涸，水鳥遷離，漁村失去生計。',
    playerResponses: ['修建分流（Shaper +）', '協助漁村轉型（Restorer +）', '無視'],
    destinyEffect: { shaper: 1 },
    worldChanges: [{ type: 'wetland-dry' }],
    rumors: ['下游的蘆葦黃得不是季節的黃。', '漁村的船半年沒下水了。', '有人說那條河被人「搬走」了。']
  },
  {
    id: 'village-jealousy',
    name: '偏愛的種子',
    trigger: { actionCount: { 'help-npc': 3 } },
    delayMs: 35000,
    region: 'village',
    shortTerm: '受助村落繁榮，視你為恩人。',
    longTerm: '鄰近聚落產生資源嫉妒，開始攔截流向受助村的商隊。',
    playerResponses: ['平衡協助兩村', '促成共享水源協議', '無視（衝突升級）'],
    destinyEffect: {},
    worldChanges: [{ type: 'inter-village-tension' }],
    rumors: ['憑什麼水只往他們村流？', '兩村的人在橋上吵起來了。', '恩人只當一邊的恩人，就是另一邊的敵人。']
  },
  {
    id: 'power-source-down',
    name: '乾淨的黑暗',
    trigger: { event: 'pollution-destroyed' },
    delayMs: 40000,
    region: 'sunken-ruins',
    shortTerm: '污染源被摧毀，下游水質恢復，病害消退。',
    longTerm: '那其實是某座城市的能源核心——城市開始衰退、燈火熄滅。',
    playerResponses: ['尋找替代能源（Seeker +）', '修復並加裝濾層（Shaper + Restorer +）', '無視（城市沒落）'],
    destinyEffect: {},
    worldChanges: [{ type: 'city-decline' }],
    rumors: ['水是乾淨了，可是燈滅了。', '城裡的工坊一半停了。', '有人懷念以前發臭但溫暖的日子。']
  },
  {
    id: 'observatory-acceleration',
    name: '可讀的天空',
    trigger: { event: 'observatory-restored' },
    delayMs: 50000,
    region: 'observatory',
    shortTerm: '天文台修復，星象可讀，夜間導航與預言成為可能。',
    longTerm: '星象顯示：世界異常正在加速。你修好的不是望遠鏡，是倒數計時器。',
    playerResponses: ['追查異常源頭（主線推進）', '封鎖消息（民眾安定）', '公開警告（恐慌+備災）'],
    destinyEffect: { seeker: 2 },
    worldChanges: [{ type: 'anomaly-acceleration' }],
    rumors: ['星星的位置不對了，學者整夜沒睡。', '天文台的燈現在每晚都亮著。', '有人說星圖上多了一顆不該存在的星。']
  },
  {
    id: 'inference-overreach',
    name: '太利的刀',
    trigger: { actionCount: { 'complete-hypothesis': 3 } },
    delayMs: 30000,
    region: 'global',
    shortTerm: '你的推論系統越來越準，真相一條接一條浮現。',
    longTerm: '更強的推論也更快把你引向危險遺跡——有些門被推開後就關不上了。',
    playerResponses: ['謹慎驗證每條推論', '繼續高速推進（高風險高回報）', '暫停推論修補已開的門'],
    destinyEffect: { seeker: 1 },
    worldChanges: [{ type: 'dangerous-ruin-exposed' }],
    rumors: ['那人找東西的速度不像是用眼睛找的。', '太快找到答案的人，會被答案找上。', '南邊那座塌了一半的遺跡，門開著。']
  },
  {
    id: 'cull-imbalance',
    name: '牧者的天平',
    trigger: { actionCount: { 'hunt-animal': 2, 'restore-water': 1 } },
    delayMs: 35000,
    region: 'glow-forest',
    shortTerm: '你以狩獵控制病獸數量，森林短期恢復。',
    longTerm: '掠食者失去病弱獵物後轉向健康獸群與商路，平衡再次傾斜。',
    playerResponses: ['建立庇護區', '繼續精準狩獵', '引導掠食者遷徙'],
    destinyEffect: {},
    worldChanges: [{ type: 'predator-shift' }],
    rumors: ['牧者修剪樹枝，狼就去咬別的樹。', '商道上發現了爪印，很新。', '平衡這種事，沒有修一次就好的。']
  },
  {
    id: 'scholar-bidding-war',
    name: '知識的價格',
    trigger: { actionCount: { 'scan-glyph': 4 } },
    delayMs: 40000,
    region: 'village',
    shortTerm: '你的紀錄成為學界珍寶，學者爭相求購。',
    longTerm: '派系開始競標你的地圖資料，有人想用它尋寶，有人想用它封印——資料外流會改變遺跡安全。',
    playerResponses: ['公開給所有人（Archivist +）', '只給守護派（Restorer +）', '高價賣出（資源+，遺跡被掠奪）'],
    destinyEffect: {},
    worldChanges: [{ type: 'ruin-looting' }],
    rumors: ['有人出三袋星銀買一頁筆記。', '學者和祭司為了一張拓片吵翻了。', '知識這東西，落在誰手裡就長成誰的形狀。']
  }
];
