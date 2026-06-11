# Art Pipeline

This project uses procedural Three.js assets as the current production path, with manifest entries reserved for future external GLB/texture slots.

## Source Of Truth

- `src/assets/manifest.js`: asset schema and current asset records.
- `src/assets/palettes.js`: art tokens, CSS colors, material palette, biome ramps.
- `src/assets/qualityProfiles.js`: high/medium/low runtime profile budgets.
- `docs/CODEX_ASSET_BRIEF.md`: art direction and acceptance target.
- `docs/CODEX_ASSET_AUDIT.md`: current replacement status.

## Manifest Flow

Each asset record describes:

```js
{
  id,
  category,
  replaces,
  sourceType,
  sourceFile,
  fallbackFactory,
  factory,
  format,
  worldScale,
  pivot,
  collisionProxy,
  lod,
  materialProfile,
  animationStates,
  vfxStates,
  gameplayReadability,
  qualityProfile,
  acceptanceCriteria
}
```

Factories call `applyAssetMetadata(object, id)` so `?artDebug=1` can identify asset id, source, category, factory, and fallback status.

## Factory Layout

- `src/render/factories/playerFactory.js`: `player_cartographer`
- `src/render/factories/landmarkFactory.js`: skyspire, gate, observatory, lumen tree, stone circle, water node, hollow site, village huts
- `src/render/factories/scannableFactory.js`: scan targets and scan rings
- `src/render/factories/creatureFactory.js`: grazer, lumen deer, apex beast, stalker
- `src/render/factories/npcFactory.js`: villager, scholar, hunter, trader-style silhouettes
- `src/render/factories/vegetationFactory.js`: instanced trees, rocks, ground scatter
- `src/render/factories/vfxFactory.js`: floating island, fog zone, memory storm, reverse river, ability layers, water surfaces
- `src/render/factories/fallbackFactory.js`: primitive fallback isolation

## Material Flow

- Use `createToonMaterial()` for most opaque gameplay assets.
- Use `createTerrainToonMaterial()` for vertex-colored terrain.
- Use `createWaterAnimeMaterial()` for lakes, rivers, and oasis surfaces.
- Use `createTransparentMagicMaterial()` for fog, scan rings, anomaly VFX, and map-like planes.
- Use `createEmissiveAccentMaterial()` for small readable glow accents.
- Use `addToonOutline()` on player, NPCs, creatures, landmarks, and scannables when the active profile enables outlines.

Avoid full-screen postprocessing as the baseline. Lightweight bloom can be added later only behind a quality flag.

## Quality Profiles

High is the default artistic target for iPhone 17 Pro Max-class Safari/PWA/WebGL:

- target 60 FPS during normal exploration
- temporary heavy VFX dips should stay above 45 FPS
- dynamic pixel ratio default `1.75`, max `2.25`
- normal draw-call target `120`
- peak draw-call hard cap `180`
- normal visible triangle target `150k`
- peak hard cap `250k`

Medium and low reduce runtime cost through pixel ratio, VFX density, vegetation density, particle multiplier, far LOD distance, and outline settings.

## Adding A New Asset

1. Add or update a manifest record in `src/assets/manifest.js`.
2. Add the procedural factory or external-loader branch in the relevant `src/render/factories/*Factory.js`.
3. Apply `applyAssetMetadata(object, assetId)`.
4. Add outlines only for gameplay-critical silhouettes.
5. Add a primitive fallback in `fallbackFactory.js` if an external source can fail.
6. Verify with `npm test`, `npm run build`, and `?artDebug=1`.

## Debug View

Use:

```text
?artDebug=1
```

The overlay reports profile, FPS, frame time, draw calls, triangles, new/fallback asset counts, and top tagged asset ids. It is intentionally lightweight and should not become a gameplay-facing panel.

