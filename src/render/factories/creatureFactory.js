import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';
import { applyAssetMetadata } from '../../assets/manifest.js';
import { createToonMaterial, createEmissiveAccentMaterial } from '../materials/animeToon.js';
import { addToonOutline } from '../utils/outline.js';
import { createBlobShadow, mesh } from './propFactory.js';

function leg(x, z, h = 0.75) {
  return mesh(new THREE.CylinderGeometry(0.08, 0.11, h, 5), createToonMaterial({ color: 0x4f4038 }), {
    position: { x, y: h / 2, z },
    name: 'creature_leg'
  });
}

function createGrazer() {
  const group = new THREE.Group();
  const mat = createToonMaterial({ color: 0xc8b088 });
  const body = mesh(new THREE.SphereGeometry(0.72, 10, 8), mat, {
    position: { y: 0.86 },
    scale: { x: 1.5, y: 0.82, z: 0.78 },
    name: 'grazer_body'
  });
  const head = mesh(new THREE.SphereGeometry(0.34, 8, 6), mat.clone(), {
    position: { x: 0.98, y: 1.02, z: 0 },
    scale: { x: 1.1, y: 0.85, z: 0.85 },
    name: 'grazer_head'
  });
  const earMat = createToonMaterial({ color: 0x8f9a5a });
  const earA = mesh(new THREE.ConeGeometry(0.12, 0.38, 5), earMat, { position: { x: 1.05, y: 1.35, z: 0.18 }, rotation: { z: -0.5 }, name: 'leaf_ear' });
  const earB = mesh(new THREE.ConeGeometry(0.12, 0.38, 5), earMat.clone(), { position: { x: 1.05, y: 1.35, z: -0.18 }, rotation: { z: -0.5 }, name: 'leaf_ear' });
  group.add(createBlobShadow(1.25, 0.18), body, head, earA, earB, leg(-0.55, -0.32), leg(-0.55, 0.32), leg(0.45, -0.32), leg(0.45, 0.32));
  return group;
}

function createLumenDeer() {
  const group = new THREE.Group();
  const bodyMat = createToonMaterial({ color: 0x2a4a44, emissive: 0x123a32, emissiveIntensity: 0.25 });
  group.add(createBlobShadow(1.15, 0.2));
  group.add(mesh(new THREE.SphereGeometry(0.55, 10, 8), bodyMat, { position: { y: 1.0 }, scale: { x: 1.4, y: 0.75, z: 0.65 }, name: 'lumen_deer_body' }));
  group.add(mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.85, 6), bodyMat.clone(), { position: { x: 0.62, y: 1.25 }, rotation: { z: -0.45 }, name: 'lumen_deer_neck' }));
  group.add(mesh(new THREE.SphereGeometry(0.3, 8, 6), bodyMat.clone(), { position: { x: 0.95, y: 1.55 }, scale: { x: 1.05, y: 0.82, z: 0.82 }, name: 'lumen_deer_head' }));
  for (const z of [-0.12, 0.12]) {
    const antler = mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.72, 5), createEmissiveAccentMaterial(ART_COLORS.lumen, 1.2), {
      position: { x: 1.02, y: 1.97, z },
      rotation: { z: -0.28, x: z > 0 ? 0.25 : -0.25 },
      name: 'lumen_deer_antler'
    });
    group.add(antler);
  }
  group.add(leg(-0.45, -0.24, 0.95), leg(-0.45, 0.24, 0.95), leg(0.42, -0.24, 0.95), leg(0.42, 0.24, 0.95));
  return group;
}

function createApexBeast() {
  const group = new THREE.Group();
  const hide = createToonMaterial({ color: 0x6e5f58 });
  group.add(createBlobShadow(3.4, 0.24));
  group.add(mesh(new THREE.SphereGeometry(1.15, 12, 8), hide, { position: { y: 1.4 }, scale: { x: 2.45, y: 1.1, z: 1.05 }, name: 'apex_body' }));
  group.add(mesh(new THREE.SphereGeometry(0.7, 10, 7), hide.clone(), { position: { x: 2.1, y: 1.26 }, scale: { x: 1.25, y: 0.85, z: 0.9 }, name: 'apex_head' }));
  for (let i = 0; i < 5; i++) {
    group.add(mesh(new THREE.ConeGeometry(0.42, 1.0 + i * 0.08, 5), createToonMaterial({ color: 0x5a5570 }), {
      position: { x: -1.1 + i * 0.55, y: 2.45 + Math.sin(i) * 0.1, z: 0 },
      rotation: { z: -0.1 + i * 0.05 },
      name: 'apex_back_plate'
    }));
  }
  for (const x of [-1.1, 0.9]) for (const z of [-0.62, 0.62]) group.add(leg(x, z, 1.25));
  return group;
}

function createStalker() {
  const group = new THREE.Group();
  const dark = createToonMaterial({ color: ART_COLORS.shadow, emissive: 0x2a1238, emissiveIntensity: 0.28 });
  group.add(mesh(new THREE.SphereGeometry(0.42, 8, 6), dark, { position: { y: 1.35 }, scale: { x: 0.65, y: 1.6, z: 0.52 }, name: 'stalker_body' }));
  group.add(mesh(new THREE.SphereGeometry(0.22, 8, 5), createEmissiveAccentMaterial(0xd99a3d, 1), { position: { x: 0.18, y: 1.72, z: -0.22 }, scale: { x: 1, y: 0.35, z: 0.35 }, name: 'stalker_eye' }));
  for (const x of [-0.35, 0.35]) for (const z of [-0.25, 0.25]) {
    group.add(mesh(new THREE.CylinderGeometry(0.035, 0.055, 1.25, 5), dark.clone(), {
      position: { x, y: 0.6, z },
      rotation: { z: x * 0.55 },
      name: 'stalker_limb'
    }));
  }
  return group;
}

export function createCreatureAsset(animal, context = {}) {
  let group;
  if (animal.kind === 'lumen-deer') group = createLumenDeer();
  else if (animal.kind === 'apex') group = createApexBeast();
  else if (animal.kind === 'stalker') group = createStalker();
  else group = createGrazer();
  applyAssetMetadata(group, animal.kind === 'stalker' ? 'stalker' : animal.kind === 'apex' ? 'apex_beast' : animal.kind, {
    category: 'creature'
  });
  addToonOutline(group, {
    category: 'creature',
    enabled: context.quality?.outlineEnabled ?? true,
    qualityScale: context.quality?.outlineScale ?? 1
  });
  return group;
}
