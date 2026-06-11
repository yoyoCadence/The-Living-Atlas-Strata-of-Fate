# Codex Asset Audit

This audit tracks the first visual-system pass requested in `CODEX_ASSET_BRIEF.md`. The gameplay/world-generation data model is unchanged; this pass moves hard-coded rendering primitives into manifest-tagged procedural asset factories.

## Summary

- Added a P0 visual foundation: palettes, quality profiles, toon materials, outline helper, performance monitor, manifest metadata, canvas/SVG icon helpers, and art debug overlay.
- Replaced the most visible P1 primitives with procedural Three.js assets: player cartographer, skyspire, ancient gate, observatory, lumen tree, village huts, floating island, scannables, ability icons, and map markers.
- Kept runtime fallbacks isolated in `src/render/factories/fallbackFactory.js` so future GLB or texture loading can fail safely without breaking gameplay.
- Kept all world generation, systems, save format, inference, destiny, and response logic intact.

## Primitive Inventory

| Previous primitive | Previous location | Replacement | Asset id |
|---|---|---|---|
| Cylinder + sphere player | `src/player/controller.js` | Procedural cartographer with cloak, scarf, pack, map tube, outline | `player_cartographer` |
| Tower cylinders + lamp sphere | `scene.buildLandmarks()` | White-stone skyspire with crown, fins, beacon, outline | `skyspire` |
| Box gate pillars + plane glow | `scene.buildLandmarks()` | Uneven ancient gate, glyph panels, decoded glow plane | `ancient_gate` |
| Cylinder + half sphere observatory | `scene.buildLandmarks()` | Broken dome, telescope, astrolabe ring | `observatory` |
| Cylinder + icosahedron tree | `scene.buildLandmarks()` | Lumen tree with roots, layered canopy, motes | `lumen_tree` |
| Box stone circle | `scene.buildLandmarks()` | Irregular standing stones plus center glyph ring | `stone_circle` |
| Box + torus water node | `scene.buildLandmarks()` | Water shrine, ripple ring, animated jet hook | `water_node` |
| Flat hollow circle | `scene.buildLandmarks()` | Cracked pit, rim, strata glow | `hollow_site` |
| Box + cone huts | `scene.buildLandmarks()` | Procedural hut variants with curved roofs and lantern/window accents | `village_hut` |
| Octahedron scannables | `scene.addScannableMesh()` | Kind-specific flora, glyph stones, wind nodes, star stones, tracks, minerals, residue | `scannable_*` |
| Sphere animals and cylinder NPCs | `scene.buildCreatures()` | Procedural readable creature/NPC silhouettes | `grazer`, `lumen-deer`, `apex_beast`, `stalker`, `npc_*` |
| Cone/cylinder floating island | `scene.buildAnomalies()` | Floating land chunk with roots, crystals, bob metadata | `float_island` |
| Static fog/silent/memory geometry | `scene.buildAnomalies()` | Factory VFX groups with density tied to quality profile | `fog_zone`, `silent_vale`, `memory_storm` |
| Text map icons | `src/map/livingMap.js` | Canvas-drawn marker symbols | `map_icons` |
| Text ability slots | `src/ui/hud.js` | Inline SVG ability icons | `ability_icon_*` |

## Fallback Remaining

The following fallback paths are intentional:

- `src/render/factories/fallbackFactory.js` exposes `createPrimitiveFallback(assetId, options)` for future external GLB/texture load failures.
- Low quality profile is allowed to reduce density and disable outlines, but it does not define the art direction.
- Instanced vegetation uses toon materials without individual outlines to protect draw-call budget.
- External GLB slots remain future-facing; current pass uses `sourceType: "proceduralMesh"` or `sourceType: "svg"` in `src/assets/manifest.js`.

## Performance System

High profile is the default target:

- Dynamic pixel ratio defaults to `1.75`, capped at `2.25`.
- Outlines, toon shading, fog, emissive accents, and denser P1 assets are enabled.
- `PerformanceMonitor` watches moving frame time, draw calls, and triangles. If the frame budget is persistently exceeded, it downgrades profile in order: high -> medium -> low.
- Degradation order is implemented as render-scale/profile reduction first; source assets are not permanently replaced.

## Debug View

Open the app with:

```text
?artDebug=1
```

The overlay shows:

- current quality profile
- moving FPS and frame time
- draw calls and triangles from `renderer.info`
- tagged procedural/fallback asset counts
- top manifest asset ids in the scene

## Visual Acceptance Notes

- Player is no longer cylinder + sphere; front direction, cloak, pack, and small glow accents are readable.
- Major landmarks now have distinct silhouettes and userData asset ids.
- Scannables are no longer one shared crystal; key kinds have distinct procedural shapes.
- Living Map markers and ability slots no longer depend on font-only glyph symbols.
- Night readability is improved through emissive materials and preserved fog/day-night blending.

