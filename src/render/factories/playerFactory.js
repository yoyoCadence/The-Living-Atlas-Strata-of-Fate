import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';
import { applyAssetMetadata } from '../../assets/manifest.js';
import { createToonMaterial, createEmissiveAccentMaterial } from '../materials/animeToon.js';
import { addToonOutline } from '../utils/outline.js';
import { createBlobShadow, createRibbon, mesh } from './propFactory.js';

export function createPlayerCartographerAsset(options = {}) {
  const group = new THREE.Group();
  group.name = 'player_cartographer';

  const skin = createToonMaterial({ color: 0xe8cfa8 });
  const navy = createToonMaterial({ color: 0x243456, emissive: 0x080a16, emissiveIntensity: 0.08 });
  const cloakMat = createToonMaterial({ color: 0x182541, emissive: 0x0b1528, emissiveIntensity: 0.16 });
  const leather = createToonMaterial({ color: 0x7a5f44 });
  const hair = createToonMaterial({ color: 0x2f2530 });

  const body = mesh(new THREE.CylinderGeometry(0.48, 0.68, 1.45, 7), navy, {
    position: { y: 0.9 },
    name: 'cartographer_body'
  });
  const head = mesh(new THREE.SphereGeometry(0.46, 10, 8), skin, {
    position: { y: 1.86 },
    scale: { x: 1.02, y: 1.06, z: 0.95 },
    name: 'cartographer_head'
  });
  const hairCap = mesh(new THREE.SphereGeometry(0.49, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), hair, {
    position: { y: 2.02 },
    rotation: { x: -0.12 },
    name: 'cartographer_hair'
  });
  const cloak = mesh(new THREE.ConeGeometry(0.86, 1.65, 7), cloakMat, {
    position: { y: 0.96, z: 0.28 },
    rotation: { x: 0.12 },
    scale: { x: 0.72, y: 1, z: 0.9 },
    name: 'cartographer_cloak'
  });
  const scarf = createRibbon(ART_COLORS.lumen, 0.95);
  scarf.name = 'cartographer_scarf';
  scarf.position.set(0.36, 1.48, -0.38);
  scarf.rotation.y = -0.55;

  const pack = mesh(new THREE.BoxGeometry(0.5, 0.62, 0.24), leather, {
    position: { y: 1.08, z: 0.58 },
    rotation: { x: -0.08 },
    name: 'cartographer_pack'
  });
  const tube = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8), leather, {
    position: { x: -0.47, y: 1.2, z: 0.46 },
    rotation: { z: Math.PI / 2.8, x: 0.35 },
    name: 'map_tube'
  });
  const compass = mesh(new THREE.SphereGeometry(0.08, 8, 6), createEmissiveAccentMaterial(ART_COLORS.paleGold, 1), {
    position: { x: 0.04, y: 1.42, z: -0.51 },
    name: 'compass_glint'
  });

  group.add(createBlobShadow(0.8, 0.22), body, cloak, head, hairCap, scarf, pack, tube, compass);
  group.userData.parts = { cape: cloak, scarf };
  applyAssetMetadata(group, 'player_cartographer');
  addToonOutline(group, {
    category: 'player',
    enabled: options.outlineEnabled ?? true,
    qualityScale: options.outlineScale ?? 1
  });
  return group;
}
