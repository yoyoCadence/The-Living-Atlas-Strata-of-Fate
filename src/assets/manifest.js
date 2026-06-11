const DEFAULT_ASSET = {
  sourceFile: null,
  sourceType: 'proceduralMesh',
  format: 'procedural',
  fallbackFactory: 'createPrimitiveFallback',
  worldScale: {},
  pivot: 'bottom_center',
  collisionProxy: { type: 'none' },
  lod: ['near', 'mid', 'far'],
  materialProfile: 'toon',
  animationStates: ['idle'],
  vfxStates: [],
  gameplayReadability: 'readable silhouette, gameplay role visible at camera distance',
  qualityProfile: ['high', 'medium', 'low'],
  acceptanceCriteria: []
};

const asset = (definition) => ({ ...DEFAULT_ASSET, ...definition });

export const ASSET_MANIFEST_SCHEMA = {
  id: 'string',
  category: 'player|npc|creature|landmark|vegetation|scannable|vfx|ui|prop',
  replaces: 'string',
  sourceType: 'proceduralMesh|canvasTexture|svg|externalGLB|fallbackPrimitive',
  sourceFile: 'string|null',
  fallbackFactory: 'string',
  factory: 'string',
  format: 'procedural|svg|canvasTexture|glb',
  worldScale: 'object',
  pivot: 'bottom_center|center|custom',
  collisionProxy: 'object',
  lod: 'array',
  materialProfile: 'toon|emissive|transparentMagic|terrain|water|ui',
  animationStates: 'array',
  vfxStates: 'array',
  gameplayReadability: 'string',
  qualityProfile: 'array',
  acceptanceCriteria: 'array'
};

export const ASSET_MANIFEST = [
  asset({
    id: 'player_cartographer',
    category: 'player',
    replaces: 'player/controller.js#cylinder-sphere-player',
    factory: 'createPlayerCartographerAsset',
    worldScale: { height: 2.55 },
    collisionProxy: { type: 'cylinder', r: 0.8, h: 2.4 },
    animationStates: ['idle', 'walk', 'glide', 'scan'],
    materialProfile: 'toon',
    acceptanceCriteria: ['direction readable', 'cloak/backpack silhouette visible', 'controller transform unchanged']
  }),
  asset({
    id: 'skyspire',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#tower',
    factory: 'createLandmarkAsset',
    worldScale: { height: 29 },
    collisionProxy: { type: 'cylinder', r: 4, h: 29 },
    vfxStates: ['beacon'],
    acceptanceCriteria: ['tall crown silhouette', 'pale gold beacon visible from distance']
  }),
  asset({
    id: 'ancient_gate',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#gate',
    factory: 'createLandmarkAsset',
    worldScale: { height: 15, width: 13 },
    collisionProxy: { type: 'box', w: 13, h: 15, d: 3 },
    vfxStates: ['inactive', 'scanned', 'decoded'],
    acceptanceCriteria: ['uneven pillars', 'center opening readable', 'decoded glow preserved']
  }),
  asset({
    id: 'observatory',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#observatory',
    factory: 'createLandmarkAsset',
    worldScale: { height: 11 },
    collisionProxy: { type: 'cylinder', r: 7, h: 11 },
    vfxStates: ['idle', 'star_navigation_active', 'myth_sight_active'],
    acceptanceCriteria: ['dome and telescope/ring distinguishable from mid-distance']
  }),
  asset({
    id: 'lumen_tree',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#tree',
    factory: 'createLandmarkAsset',
    worldScale: { height: 26 },
    collisionProxy: { type: 'cylinder', r: 6, h: 24 },
    materialProfile: 'emissive',
    vfxStates: ['day', 'night'],
    acceptanceCriteria: ['glowing canopy', 'root base silhouette']
  }),
  asset({
    id: 'stone_circle',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#circle',
    factory: 'createLandmarkAsset',
    worldScale: { radius: 8 },
    collisionProxy: { type: 'cylinder', r: 8, h: 4 },
    vfxStates: ['idle', 'memory_active']
  }),
  asset({
    id: 'water_node',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#node',
    factory: 'createLandmarkAsset',
    worldScale: { height: 3.5 },
    collisionProxy: { type: 'box', w: 4, h: 3.5, d: 4 },
    materialProfile: 'water',
    vfxStates: ['dormant', 'active']
  }),
  asset({
    id: 'hollow_site',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#hollow',
    factory: 'createLandmarkAsset',
    worldScale: { radius: 6 },
    pivot: 'center',
    collisionProxy: { type: 'none' },
    materialProfile: 'transparentMagic'
  }),
  asset({
    id: 'village_hut',
    category: 'landmark',
    replaces: 'scene.buildLandmarks#village-huts',
    factory: 'createLandmarkAsset',
    worldScale: { height: 6 },
    collisionProxy: { type: 'box', w: 5, h: 5, d: 5 },
    vfxStates: ['night', 'prospering']
  }),
  asset({
    id: 'float_island',
    category: 'vfx',
    replaces: 'scene.buildAnomalies#float-island',
    factory: 'createFloatingIslandAsset',
    worldScale: { radius: 14, height: 21 },
    pivot: 'center',
    collisionProxy: { type: 'cylinder', r: 14, h: 21 },
    materialProfile: 'toon',
    animationStates: ['drifting', 'stabilized']
  }),
  asset({
    id: 'fog_zone',
    category: 'vfx',
    replaces: 'scene.buildAnomalies#fog-zone',
    factory: 'createFogZoneAsset',
    materialProfile: 'transparentMagic',
    pivot: 'center',
    vfxStates: ['idle']
  }),
  asset({
    id: 'memory_storm',
    category: 'vfx',
    replaces: 'scene.buildAnomalies#memory-storm',
    factory: 'createMemoryStormAsset',
    materialProfile: 'transparentMagic',
    pivot: 'center',
    animationStates: ['swirl']
  }),
  asset({
    id: 'reverse_river_vfx',
    category: 'vfx',
    replaces: 'scene.buildWater#reverse-river-line',
    factory: 'createReverseRiverVfx',
    materialProfile: 'transparentMagic',
    pivot: 'center',
    animationStates: ['reverse_flow']
  }),
  ...['lumen_flora', 'glyph_stone', 'wind_node', 'star_stone', 'water_source', 'memory_residue', 'beast_track', 'mineral_vein'].map((id) => asset({
    id: `scannable_${id}`,
    category: 'scannable',
    replaces: 'scene.addScannableMesh#octahedron',
    factory: 'createScannableAsset',
    worldScale: { height: id === 'glyph_stone' ? 1.4 : 0.8 },
    collisionProxy: { type: 'sphere', r: 1.3 },
    materialProfile: 'emissive',
    vfxStates: ['idle', 'nearby', 'scanned'],
    acceptanceCriteria: ['distinct from a random crystal', 'scan ring readable nearby']
  })),
  ...['wind_sense', 'echo_vision', 'geopulse', 'ecology_hearing', 'time_residue', 'star_navigation', 'myth_sight'].map((id) => asset({
    id: `ability_icon_${id}`,
    category: 'ui',
    replaces: 'hud.js#ability-text-label',
    sourceType: 'svg',
    factory: 'createAbilityIconElement',
    format: 'svg',
    materialProfile: 'ui',
    worldScale: { size: 24 },
    pivot: 'center',
    collisionProxy: { type: 'none' },
    lod: ['ui'],
    acceptanceCriteria: ['readable at 16px', 'uses currentColor for UI theming']
  }))
];

export const ASSET_BY_ID = Object.fromEntries(ASSET_MANIFEST.map((entry) => [entry.id, entry]));

export function getAssetDefinition(id) {
  return ASSET_BY_ID[id] ?? null;
}

export function applyAssetMetadata(object, id, overrides = {}) {
  const definition = getAssetDefinition(id);
  const sourceType = overrides.sourceType ?? definition?.sourceType ?? 'proceduralMesh';
  const source = overrides.source ?? (sourceType === 'fallbackPrimitive' ? 'fallback' : 'new');
  const metadata = {
    assetId: id,
    assetCategory: definition?.category ?? overrides.category ?? 'prop',
    assetSource: sourceType,
    source,
    factory: overrides.factory ?? definition?.factory ?? null,
    replaces: definition?.replaces ?? null
  };
  object.userData = { ...object.userData, ...metadata };
  object.traverse?.((child) => {
    if (child === object || child.userData?.assetId) return;
    child.userData = { ...child.userData, parentAssetId: id, source };
  });
  return object;
}

export function countManifestAssetsByCategory() {
  return ASSET_MANIFEST.reduce((counts, entry) => {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    return counts;
  }, {});
}
