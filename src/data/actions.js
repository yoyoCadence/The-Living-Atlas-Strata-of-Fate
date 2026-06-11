// 玩家行為 → 命運軸 (Destiny Axis) 變化量。資料驅動，新行為只需加一筆。
// 軸：explorer / restorer / archivist / seeker / shaper / predator

export const ACTION_EFFECTS = {
  'scan-plant':        { archivist: 2, seeker: 1 },
  'scan-animal':       { archivist: 2, seeker: 1 },
  'scan-track':        { archivist: 1, seeker: 2 },
  'scan-glyph':        { seeker: 3, archivist: 2 },
  'scan-wind':         { explorer: 2, archivist: 1 },
  'scan-water':        { restorer: 1, archivist: 2 },
  'scan-mineral':      { shaper: 2, archivist: 1 },
  'scan-memory':       { seeker: 3, archivist: 1 },
  'scan-star':         { explorer: 2, seeker: 2 },
  'scan-anomaly':      { seeker: 2, explorer: 2 },
  'scan-ecology':      { restorer: 2, archivist: 2 },
  'climb-landmark':    { explorer: 3 },
  'reach-far-region':  { explorer: 3 },
  'enter-new-biome':   { explorer: 2, archivist: 1 },
  'restore-water':     { restorer: 4, shaper: 1 },
  'restore-landmark':  { restorer: 3, archivist: 1 },
  'decode-glyph':      { seeker: 4, archivist: 2 },
  'complete-hypothesis': { seeker: 3, archivist: 1 },
  'accept-hypothesis': { seeker: 1 },
  'hunt-animal':       { predator: 3, ecoStability: -1 },
  'hunt-rare':         { predator: 4, ecoStability: -2 },
  'reshape-terrain':   { shaper: 4 },
  'activate-machine':  { shaper: 3, seeker: 1 },
  'redirect-river':    { shaper: 4 },
  'help-npc':          { restorer: 2 },
  'ignore-npc':        {},
  'place-marker':      { archivist: 1 },
  'glide':             { explorer: 2 },
  'overharvest':       { predator: 2, ecoStability: -1 }
};

export const AXES = ['explorer', 'restorer', 'archivist', 'seeker', 'shaper', 'predator'];

export const AXIS_LABELS = {
  explorer: '探索者', restorer: '修復者', archivist: '紀錄者',
  seeker: '追索者', shaper: '塑形者', predator: '掠奪者'
};
