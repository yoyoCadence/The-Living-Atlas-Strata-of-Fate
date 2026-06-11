export const ART_COLORS = {
  ink: 0x1d1b2e,
  paper: 0xf3ead6,
  uiInk: 0x3a3328,
  keyLight: 0xfff1d8,
  skyDay: 0xaebfdc,
  skyNight: 0x1b2240,
  warmStone: 0x9a8e7a,
  mutedGold: 0xc8a35a,
  paleGold: 0xffe9a8,
  moss: 0x5d7340,
  mossLight: 0xa9bd72,
  lumen: 0x45e8c0,
  water: 0x6fc3f0,
  violet: 0xb48aef,
  anomaly: 0xc49ae8,
  memory: 0xf08ab8,
  danger: 0x885a4a,
  shadow: 0x14101a
};

export const CSS_COLORS = {
  ink: '#1d1b2e',
  paper: '#f3ead6',
  uiInk: '#3a3328',
  keyLight: '#fff1d8',
  lumen: '#45e8c0',
  water: '#6fc3f0',
  violet: '#b48aef',
  anomaly: '#c49ae8',
  memory: '#f08ab8',
  warning: '#d99a3d'
};

export const BIOME_RAMPS = {
  plains: [0x5d7340, 0x7a8f54, 0xa9bd72],
  'glow-forest': [0x1d4a40, 0x2e6e5e, 0x4da890],
  'river-valley': [0x46663f, 0x5f8468, 0x8aac84],
  'floating-mounts': [0x5a5570, 0x7e7a90, 0xa7a3bd],
  'magnet-desert': [0x9a7d4d, 0xc2a36b, 0xe8cf96]
};

export const MATERIAL_PROFILES = {
  player: { base: 0x243456, accent: ART_COLORS.lumen, outline: ART_COLORS.ink },
  npc: { base: 0xb09468, accent: ART_COLORS.mutedGold, outline: ART_COLORS.ink },
  creature: { base: 0x8f7a5a, accent: ART_COLORS.lumen, outline: ART_COLORS.ink },
  landmark: { base: ART_COLORS.warmStone, accent: ART_COLORS.paleGold, outline: ART_COLORS.ink },
  vegetation: { base: 0x2e6e5e, accent: ART_COLORS.lumen, outline: ART_COLORS.ink },
  scannable: { base: ART_COLORS.lumen, accent: ART_COLORS.paleGold, outline: ART_COLORS.ink },
  anomaly: { base: ART_COLORS.anomaly, accent: ART_COLORS.memory, outline: ART_COLORS.ink },
  water: { base: 0x4f93c8, accent: ART_COLORS.water, outline: 0x25465e }
};

export function cssHex(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`;
}
