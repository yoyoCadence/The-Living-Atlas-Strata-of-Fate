// World Rumor System 模板。
// 來源（source）決定語氣；條件（when）由 systems/rumor.js 比對最近事件 / 生態 / 稱號。
// {player} 會被代換為玩家稱號或「那個地圖修復者」。

export const RUMOR_SOURCES = ['村民', '商人', '探險者', '學者', '獵人', '祭司'];

export const RUMOR_TEMPLATES = [
  // --- 修復水脈 ---
  { when: { event: 'water-restored' }, source: '村民', text: '聽說乾谷那邊又有水聲了。' },
  { when: { event: 'water-restored' }, source: '商人', text: '商隊準備重新開那條路了。' },
  { when: { event: 'water-restored' }, source: '探險者', text: '有個拿地圖的人讓井重新冒水。' },
  // --- 過度狩獵 ---
  { when: { actionCountAtLeast: { 'hunt-animal': 2 } }, source: '獵人', text: '森林最近太安靜了。' },
  { when: { actionCountAtLeast: { 'hunt-animal': 3 } }, source: '獵人', text: '那些獸不是消失，是開始躲人了。' },
  { when: { actionCountAtLeast: { 'hunt-animal': 3 } }, source: '村民', text: '有獵人說，現在有東西在反過來追蹤我們。' },
  // --- 解開古文明謎題 ---
  { when: { event: 'gate-decoded' }, source: '村民', text: '北邊的石門昨晚亮了一次。' },
  { when: { event: 'gate-decoded' }, source: '學者', text: '學者說那些符號不是文字，是警告。' },
  { when: { event: 'gate-decoded' }, source: '祭司', text: '有人聽見地下傳來鐘聲。' },
  // --- 探索 ---
  { when: { actionCountAtLeast: { 'climb-landmark': 1 } }, source: '村民', text: '有人看見{player}站在望星塔頂上。' },
  { when: { actionCountAtLeast: { 'enter-new-biome': 3 } }, source: '商人', text: '那人去過的地方比我跑過的商路還多。' },
  // --- 掃描 / 紀錄 ---
  { when: { actionCountAtLeast: { 'scan-plant': 3 } }, source: '學者', text: '聽說{player}的圖鑑裡畫著會發光的草。' },
  { when: { actionCountAtLeast: { 'place-marker': 3 } }, source: '探險者', text: '跟著那些標記走，比跟著星星還準。' },
  // --- 生態惡化 ---
  { when: { ecoBelow: -3 }, source: '祭司', text: '土地在生病，獻祭也沒有用。' },
  { when: { ecoBelow: -5 }, source: '村民', text: '今年的收成不對勁，連蟲都變少了。' },
  // --- 生態良好 ---
  { when: { ecoAbove: 3 }, source: '獵人', text: '林子裡的腳印又多回來了，好現象。' },
  // --- 機械 / 浮島 ---
  { when: { event: 'machine-activated' }, source: '村民', text: '昨晚浮島亮了一圈光，像在呼吸。' },
  { when: { event: 'machine-activated' }, source: '學者', text: '古代的東西醒了一個，就會吵醒下一個。' },
  // --- 預設閒聊（永遠可用，避免傳聞枯竭）---
  { when: {}, source: '村民', text: '外面世界聽說越來越怪了，你小心點。' },
  { when: {}, source: '商人', text: '地圖？地圖過時得比麵包還快。' },
  { when: {}, source: '探險者', text: '迷霧後面一定有東西，我感覺得到。' }
];
