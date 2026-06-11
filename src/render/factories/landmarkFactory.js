import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';
import { applyAssetMetadata } from '../../assets/manifest.js';
import {
  createToonMaterial,
  createEmissiveAccentMaterial,
  createTransparentMagicMaterial
} from '../materials/animeToon.js';
import { createGlyphGlowMaterial, createWaterGlowMaterial } from '../materials/magicMaterials.js';
import { createGlyphTexture } from '../utils/canvasTexture.js';
import { addToonOutline } from '../utils/outline.js';
import { createBlobShadow, createLantern, mesh } from './propFactory.js';

const stone = () => createToonMaterial({ color: ART_COLORS.warmStone });
const darkStone = () => createToonMaterial({ color: 0x6e6a80 });
const gold = () => createToonMaterial({ color: ART_COLORS.mutedGold });
const wood = () => createToonMaterial({ color: 0x8a5a44 });

function assetIdForLandmark(lm) {
  return {
    tower: 'skyspire',
    gate: 'ancient_gate',
    observatory: 'observatory',
    tree: 'lumen_tree',
    circle: 'stone_circle',
    node: 'water_node',
    hollow: 'hollow_site',
    village: 'village_hut'
  }[lm.kind] ?? lm.id;
}

function createSkyspire(lm) {
  const group = new THREE.Group();
  const column = mesh(new THREE.CylinderGeometry(2.0, 3.15, 25.5, 7), stone(), {
    position: { y: 12.75 },
    name: 'skyspire_column'
  });
  const base = mesh(new THREE.CylinderGeometry(4.4, 5.2, 1.2, 7), darkStone(), {
    position: { y: 0.6 },
    name: 'skyspire_base'
  });
  const crown = mesh(new THREE.CylinderGeometry(4.6, 3.1, 2.4, 7), createToonMaterial({ color: 0x8a8474 }), {
    position: { y: 26.8 },
    rotation: { y: 0.25 },
    name: 'skyspire_crown'
  });
  const roof = mesh(new THREE.ConeGeometry(3.6, 2.7, 7), createToonMaterial({ color: 0x44604a }), {
    position: { y: 29.3 },
    rotation: { y: 0.25 },
    name: 'skyspire_roof'
  });
  const beacon = mesh(new THREE.SphereGeometry(0.9, 12, 8), createEmissiveAccentMaterial(ART_COLORS.paleGold, 1.5), {
    position: { y: 30.8 },
    name: 'skyspire_beacon'
  });
  for (let i = 0; i < 3; i++) {
    const fin = mesh(new THREE.BoxGeometry(0.32, 3.5, 1.1), gold(), {
      position: { y: 27.2 },
      rotation: { y: i * Math.PI * 2 / 3 + 0.3 },
      name: 'skyspire_fin'
    });
    fin.position.x = Math.cos(fin.rotation.y) * 3.1;
    fin.position.z = Math.sin(fin.rotation.y) * 3.1;
    group.add(fin);
  }
  group.add(createBlobShadow(5.5, 0.18), base, column, crown, roof, beacon);
  group.userData.parts = { beacon };
  return group;
}

function createAncientGate(lm, context) {
  const group = new THREE.Group();
  const mat = createToonMaterial({ color: 0x7a7468 });
  const left = mesh(new THREE.BoxGeometry(2.8, 14.4, 2.6), mat, {
    position: { x: -4.5, y: 7.2 },
    rotation: { z: -0.05 },
    name: 'gate_left_pillar'
  });
  const right = mesh(new THREE.BoxGeometry(2.5, 12.4, 2.6), mat.clone(), {
    position: { x: 4.2, y: 6.2 },
    rotation: { z: 0.08 },
    name: 'gate_broken_pillar'
  });
  const lintel = mesh(new THREE.BoxGeometry(12.5, 2.2, 3.1), mat.clone(), {
    position: { y: 14.4 },
    rotation: { z: -0.03 },
    name: 'gate_lintel'
  });
  const glyphTexture = createGlyphTexture(context?.world?.glyphSyntax?.charset?.[0] ?? '◇', { color: '#ffe9a8' });
  const glyphMat = new THREE.MeshBasicMaterial({
    map: glyphTexture,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const glyphA = mesh(new THREE.PlaneGeometry(1.8, 4.5), glyphMat, {
    position: { x: -4.52, y: 7.7, z: -1.36 },
    name: 'gate_glyph_panel_a'
  });
  const glyphB = mesh(new THREE.PlaneGeometry(1.6, 3.8), glyphMat.clone(), {
    position: { x: 4.25, y: 6.7, z: -1.36 },
    name: 'gate_glyph_panel_b'
  });
  const glow = mesh(new THREE.PlaneGeometry(7, 11.5), createGlyphGlowMaterial(0x9adcf0, lm.decoded ? 0.55 : 0), {
    position: { y: 6.8, z: -0.03 },
    name: 'gate_magic_plane'
  });
  group.add(createBlobShadow(7.5, 0.18), left, right, lintel, glyphA, glyphB, glow);
  group.userData.parts = { gateGlow: glow };
  return group;
}

function createObservatory() {
  const group = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(6.2, 7, 5.5, 9), createToonMaterial({ color: 0x9a8e7a }), {
    position: { y: 2.75 },
    name: 'observatory_base'
  });
  const dome = mesh(new THREE.SphereGeometry(5.7, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2.1), createToonMaterial({ color: 0x5f8a8a }), {
    position: { y: 5.6 },
    rotation: { z: 0.22 },
    name: 'observatory_broken_dome'
  });
  const telescope = mesh(new THREE.CylinderGeometry(0.38, 0.52, 8, 10), createToonMaterial({ color: 0x4f5968 }), {
    position: { x: 2.7, y: 8.1, z: -1.0 },
    rotation: { z: Math.PI / 2.65, y: -0.45 },
    name: 'observatory_telescope'
  });
  const ring = mesh(new THREE.TorusGeometry(5.2, 0.18, 8, 32), createEmissiveAccentMaterial(ART_COLORS.paleGold, 0.9), {
    position: { y: 8.2 },
    rotation: { x: Math.PI / 2.5, z: 0.4 },
    name: 'observatory_astrolabe_ring'
  });
  group.add(createBlobShadow(8, 0.16), base, dome, telescope, ring);
  group.userData.parts = { ring };
  return group;
}

function createLumenTree() {
  const group = new THREE.Group();
  const bark = createToonMaterial({ color: 0x5a4438 });
  const leaf = createToonMaterial({ color: 0x2e6e5e, emissive: ART_COLORS.lumen, emissiveIntensity: 0.55 });
  const trunk = mesh(new THREE.CylinderGeometry(2.2, 3.8, 18, 8), bark, {
    position: { y: 9 },
    name: 'lumen_tree_trunk'
  });
  group.add(createBlobShadow(9, 0.2), trunk);
  for (let i = 0; i < 5; i++) {
    const root = mesh(new THREE.CylinderGeometry(0.28, 0.42, 8, 6), bark.clone(), {
      position: { x: Math.cos(i * 1.25) * 3.4, y: 0.55, z: Math.sin(i * 1.25) * 3.4 },
      rotation: { z: Math.PI / 2, y: i * 1.25 },
      name: 'lumen_tree_root'
    });
    group.add(root);
  }
  for (let i = 0; i < 3; i++) {
    const canopy = mesh(new THREE.IcosahedronGeometry(6 - i * 0.65, 1), leaf.clone(), {
      position: { x: (i - 1) * 3.8, y: 17 + i * 3.2, z: (i % 2) * 2.4 },
      scale: { x: 1.15, y: 0.72, z: 1.0 },
      name: 'lumen_tree_canopy'
    });
    group.add(canopy);
  }
  for (let i = 0; i < 8; i++) {
    const mote = mesh(new THREE.SphereGeometry(0.12, 6, 4), createEmissiveAccentMaterial(ART_COLORS.lumen, 1), {
      position: { x: Math.cos(i) * (4 + (i % 3)), y: 12 + i * 0.9, z: Math.sin(i * 1.7) * 5 },
      name: 'lumen_tree_mote'
    });
    group.add(mote);
  }
  group.userData.parts = { glowMaterials: [leaf] };
  return group;
}

function createStoneCircle() {
  const group = new THREE.Group();
  const mat = createToonMaterial({ color: 0x8a8478 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const h = 3.4 + (i % 3) * 0.75;
    const stoneMesh = mesh(new THREE.BoxGeometry(1.4, h, 1.0), mat.clone(), {
      position: { x: Math.cos(a) * 8, y: h / 2, z: Math.sin(a) * 8 },
      rotation: { y: -a, z: (i % 2 ? 0.08 : -0.06) },
      name: 'standing_stone'
    });
    group.add(stoneMesh);
  }
  const mark = mesh(new THREE.TorusGeometry(4.2, 0.08, 6, 40), createGlyphGlowMaterial(ART_COLORS.violet, 0.45), {
    position: { y: 0.18 },
    rotation: { x: Math.PI / 2 },
    name: 'stone_circle_center_mark'
  });
  group.add(createBlobShadow(9, 0.14), mark);
  return group;
}

function createWaterNode(lm) {
  const group = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(2.8, 3.4, 1.6, 8), createToonMaterial({ color: 0x6a7a88 }), {
    position: { y: 0.8 },
    name: 'water_node_base'
  });
  const plinth = mesh(new THREE.BoxGeometry(3.3, 2.8, 3.3), createToonMaterial({ color: 0x7a8794 }), {
    position: { y: 2.4 },
    rotation: { y: Math.PI / 4 },
    name: 'water_node_plinth'
  });
  const ring = mesh(new THREE.TorusGeometry(3.45, 0.18, 8, 32), createWaterGlowMaterial(ART_COLORS.water), {
    position: { y: 3.7 },
    rotation: { x: Math.PI / 2 },
    name: 'water_node_ripple_ring'
  });
  const jet = mesh(new THREE.ConeGeometry(0.75, 8.5, 10, 1, true), createTransparentMagicMaterial({
    color: ART_COLORS.water,
    opacity: lm.active ? 0.68 : 0,
    side: THREE.DoubleSide
  }), {
    position: { y: 8 },
    name: 'water_node_jet'
  });
  group.add(createBlobShadow(4.5, 0.18), base, plinth, ring, jet);
  group.userData.parts = { nodeJet: jet, ring };
  return group;
}

function createHollowSite() {
  const group = new THREE.Group();
  const pit = mesh(new THREE.CircleGeometry(6, 28), new THREE.MeshBasicMaterial({
    color: ART_COLORS.shadow,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide
  }), {
    rotation: { x: -Math.PI / 2 },
    position: { y: 0.12 },
    name: 'hollow_pit'
  });
  const rim = mesh(new THREE.TorusGeometry(6, 0.18, 6, 28), createToonMaterial({ color: 0x655c56 }), {
    rotation: { x: Math.PI / 2 },
    position: { y: 0.18 },
    name: 'hollow_cracked_rim'
  });
  const glow = mesh(new THREE.TorusGeometry(3.6, 0.07, 6, 24), createGlyphGlowMaterial(ART_COLORS.anomaly, 0.35), {
    rotation: { x: Math.PI / 2 },
    position: { y: 0.21 },
    name: 'hollow_strata_glow'
  });
  group.add(pit, rim, glow);
  return group;
}

export function createVillageHutAsset(options = {}) {
  const group = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(5, 3.3, 5), createToonMaterial({ color: options.bodyColor ?? 0xb09468 }), {
    position: { y: 1.65 },
    name: 'village_hut_body'
  });
  const roof = mesh(new THREE.ConeGeometry(4.3, 2.7, 4), wood(), {
    position: { y: 4.62 },
    rotation: { y: Math.PI / 4 },
    scale: { x: 1.12, y: 1, z: 0.92 },
    name: 'village_hut_curved_roof'
  });
  const window = mesh(new THREE.PlaneGeometry(0.9, 0.7), createEmissiveAccentMaterial(ART_COLORS.paleGold, 0.8), {
    position: { x: 0, y: 2.15, z: -2.54 },
    name: 'village_hut_window'
  });
  const lantern = createLantern(ART_COLORS.paleGold, 0.18);
  lantern.position.set(1.9, 2.5, -2.35);
  group.add(body, roof, window, lantern);
  return group;
}

function createVillage(lm, context) {
  const group = new THREE.Group();
  const w = context.world;
  for (const [i, hut] of w.village.huts.entries()) {
    const h = w.heightAt(hut.x, hut.z);
    const house = createVillageHutAsset({ bodyColor: i % 2 ? 0xc0a070 : 0xb09468 });
    house.position.set(hut.x - lm.x, h - context.baseHeight, hut.z - lm.z);
    house.rotation.y = hut.rot;
    group.add(house);
  }
  return group;
}

export function createLandmarkAsset(lm, context = {}) {
  let group;
  switch (lm.kind) {
    case 'tower': group = createSkyspire(lm, context); break;
    case 'gate': group = createAncientGate(lm, context); break;
    case 'observatory': group = createObservatory(lm, context); break;
    case 'tree': group = createLumenTree(lm, context); break;
    case 'circle': group = createStoneCircle(lm, context); break;
    case 'node': group = createWaterNode(lm, context); break;
    case 'hollow': group = createHollowSite(lm, context); break;
    case 'village': group = createVillage(lm, context); break;
    default: group = new THREE.Group(); break;
  }
  const assetId = assetIdForLandmark(lm);
  group.name = assetId;
  applyAssetMetadata(group, assetId);
  addToonOutline(group, {
    category: 'landmark',
    enabled: context.quality?.outlineEnabled ?? true,
    qualityScale: context.quality?.outlineScale ?? 1
  });
  return group;
}
