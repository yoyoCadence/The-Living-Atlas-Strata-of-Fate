// 區域（biome）定義：辨識度優先——每區有專屬色彩、地標、生態規律、異常與線索鏈。

export const BIOMES = {
  plains: {
    id: 'plains', name: '初始平原',
    color: [0.55, 0.66, 0.38], mapColor: '#7a8f54',
    fogColor: 0xbcc8d8,
    desc: '緩坡與草浪。世界對新來者最溫柔的一層。'
  },
  'glow-forest': {
    id: 'glow-forest', name: '發光森林',
    color: [0.16, 0.38, 0.34], mapColor: '#2e6e5e',
    fogColor: 0x88c8c0,
    desc: '夜裡比白天亮。植物的光都偏向同一個方向。'
  },
  'river-valley': {
    id: 'river-valley', name: '逆流河谷',
    color: [0.42, 0.55, 0.45], mapColor: '#5f8468',
    fogColor: 0xa8c8c8,
    desc: '河水在某一段往高處流。沒有人解釋得了，直到你來。'
  },
  'floating-mounts': {
    id: 'floating-mounts', name: '漂浮山區',
    color: [0.52, 0.5, 0.58], mapColor: '#7e7a90',
    fogColor: 0x9a96b8,
    desc: '山的碎片懸在空中，按某種週期緩慢呼吸。'
  },
  'magnet-desert': {
    id: 'magnet-desert', name: '磁暴沙漠',
    color: [0.78, 0.65, 0.42], mapColor: '#c2a36b',
    fogColor: 0xd8c8a8,
    desc: '指南針在這裡說謊。只有星星不說。'
  }
};
