import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';
import { applyAssetMetadata } from '../../assets/manifest.js';
import {
  createToonMaterial,
  createEmissiveAccentMaterial,
  createTransparentMagicMaterial
} from '../materials/animeToon.js';
import { createGlyphGlowMaterial, createScanRingMaterial } from '../materials/magicMaterials.js';
import { createGlyphTexture } from '../utils/canvasTexture.js';
import { addToonOutline } from '../utils/outline.js';
import { mesh } from './propFactory.js';

function scannableAssetId(kind) {
  return {
    'lumen-flora': 'scannable_lumen_flora',
    'oasis-flora': 'scannable_lumen_flora',
    'glyph-stone': 'scannable_glyph_stone',
    'wind-node': 'scannable_wind_node',
    'star-stone': 'scannable_star_stone',
    'water-source': 'scannable_water_source',
    'memory-residue': 'scannable_memory_residue',
    'beast-track': 'scannable_beast_track',
    'mineral-vein': 'scannable_mineral_vein'
  }[kind] ?? 'scannable_lumen_flora';
}

function addScanRing(group, color = ART_COLORS.lumen) {
  const ring = mesh(new THREE.TorusGeometry(1.15, 0.035, 6, 24), createScanRingMaterial(color, 0.42), {
    rotation: { x: Math.PI / 2 },
    position: { y: 0.08 },
    name: 'scan_ring'
  });
  group.add(ring);
  group.userData.parts = { ...group.userData.parts, scanRing: ring };
}

function createFlora(kind) {
  const group = new THREE.Group();
  const leafColor = kind === 'oasis-flora' ? 0x4f9a60 : 0x2e6e5e;
  const budColor = kind === 'oasis-flora' ? 0x8be88a : ART_COLORS.lumen;
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const leaf = mesh(new THREE.ConeGeometry(0.16, 0.75, 5), createToonMaterial({ color: leafColor }), {
      position: { x: Math.cos(a) * 0.28, y: 0.32, z: Math.sin(a) * 0.28 },
      rotation: { x: 0.9, y: -a, z: 0.1 },
      name: 'flora_leaf'
    });
    group.add(leaf);
  }
  group.add(mesh(new THREE.SphereGeometry(0.22, 9, 7), createEmissiveAccentMaterial(budColor, 1), {
    position: { y: 0.72 },
    name: 'flora_glow_bud'
  }));
  addScanRing(group, budColor);
  return group;
}

function createGlyphStone(context) {
  const group = new THREE.Group();
  const tablet = mesh(new THREE.BoxGeometry(1.05, 1.35, 0.35), createToonMaterial({ color: 0x7a7468 }), {
    position: { y: 0.68 },
    rotation: { z: -0.08 },
    name: 'glyph_stone_tablet'
  });
  const glyphTexture = createGlyphTexture(context?.glyph ?? '◇', { color: '#ffe9a8', background: 'rgba(20,16,26,0.28)' });
  const panel = mesh(new THREE.PlaneGeometry(0.72, 0.9), new THREE.MeshBasicMaterial({
    map: glyphTexture,
    transparent: true,
    side: THREE.DoubleSide,
    toneMapped: false
  }), {
    position: { y: 0.78, z: -0.19 },
    name: 'glyph_stone_panel'
  });
  group.add(tablet, panel);
  addScanRing(group, ART_COLORS.violet);
  return group;
}

function createWindNode() {
  const group = new THREE.Group();
  const ringMat = createGlyphGlowMaterial(0xb8e8f8, 0.78);
  for (let i = 0; i < 3; i++) {
    const ring = mesh(new THREE.TorusGeometry(0.58 + i * 0.18, 0.025, 6, 28), ringMat.clone(), {
      position: { y: 0.7 + i * 0.28 },
      rotation: { x: Math.PI / 2.2, y: i * 0.5 },
      name: 'wind_node_spiral'
    });
    group.add(ring);
  }
  const ribbon = mesh(new THREE.PlaneGeometry(0.16, 1.2), createTransparentMagicMaterial({ color: 0xb8e8f8, opacity: 0.5 }), {
    position: { y: 0.85 },
    rotation: { y: 0.8, z: 0.4 },
    name: 'wind_node_ribbon'
  });
  group.add(ribbon);
  addScanRing(group, 0xb8e8f8);
  return group;
}

function createStarStone() {
  const group = new THREE.Group();
  const stone = mesh(new THREE.DodecahedronGeometry(0.68, 0), createToonMaterial({ color: 0x5b6070 }), {
    position: { y: 0.68 },
    scale: { x: 0.85, y: 1.05, z: 0.45 },
    name: 'star_stone_body'
  });
  const star = mesh(new THREE.CircleGeometry(0.25, 5), createEmissiveAccentMaterial(ART_COLORS.paleGold, 1), {
    position: { y: 0.78, z: -0.39 },
    rotation: { z: Math.PI / 5 },
    name: 'star_stone_inlay'
  });
  group.add(stone, star);
  addScanRing(group, ART_COLORS.paleGold);
  return group;
}

function createWaterSource() {
  const group = new THREE.Group();
  const bowl = mesh(new THREE.CylinderGeometry(0.72, 0.9, 0.35, 10), createToonMaterial({ color: 0x6a7a88 }), {
    position: { y: 0.22 },
    name: 'water_source_bowl'
  });
  const drop = mesh(new THREE.SphereGeometry(0.22, 8, 6), createEmissiveAccentMaterial(ART_COLORS.water, 1), {
    position: { y: 0.82 },
    scale: { x: 0.75, y: 1.35, z: 0.75 },
    name: 'water_source_drop'
  });
  group.add(bowl, drop);
  addScanRing(group, ART_COLORS.water);
  return group;
}

function createBeastTrack() {
  const group = new THREE.Group();
  const mat = createTransparentMagicMaterial({ color: 0xd8b878, opacity: 0.62 });
  for (let i = 0; i < 3; i++) {
    const pad = mesh(new THREE.CircleGeometry(0.28 - i * 0.03, 12), mat.clone(), {
      position: { x: (i - 1) * 0.28, y: 0.05, z: i * 0.22 },
      rotation: { x: -Math.PI / 2, z: i * 0.25 },
      name: 'beast_track_pad'
    });
    group.add(pad);
  }
  addScanRing(group, 0xd8b878);
  return group;
}

function createMineralVein() {
  const group = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    group.add(mesh(new THREE.ConeGeometry(0.16 + i * 0.03, 0.75 + i * 0.2, 5), createToonMaterial({
      color: 0x9a7d4d,
      emissive: ART_COLORS.mutedGold,
      emissiveIntensity: 0.12
    }), {
      position: { x: (i - 1.5) * 0.22, y: 0.35 + i * 0.08, z: (i % 2) * 0.18 },
      rotation: { z: (i - 1.5) * 0.18 },
      name: 'mineral_shard'
    }));
  }
  addScanRing(group, ART_COLORS.mutedGold);
  return group;
}

function createMemoryResidue() {
  const group = new THREE.Group();
  const swirl = mesh(new THREE.TorusGeometry(0.65, 0.035, 6, 32), createGlyphGlowMaterial(ART_COLORS.memory, 0.55), {
    position: { y: 0.8 },
    rotation: { x: Math.PI / 2.6, z: 0.4 },
    name: 'memory_residue_swirl'
  });
  const shard = mesh(new THREE.PlaneGeometry(0.42, 0.7), createTransparentMagicMaterial({ color: ART_COLORS.violet, opacity: 0.42 }), {
    position: { y: 0.98 },
    rotation: { y: 0.55, z: -0.2 },
    name: 'memory_residue_shard'
  });
  group.add(swirl, shard);
  addScanRing(group, ART_COLORS.memory);
  return group;
}

function createDefaultScannable() {
  const group = new THREE.Group();
  group.add(mesh(new THREE.OctahedronGeometry(0.62, 0), createEmissiveAccentMaterial(ART_COLORS.lumen, 1), {
    position: { y: 0.62 },
    name: 'default_scannable_core'
  }));
  addScanRing(group, ART_COLORS.lumen);
  return group;
}

export function createScannableAsset(scannable, context = {}) {
  let group;
  switch (scannable.kind) {
    case 'lumen-flora':
    case 'oasis-flora': group = createFlora(scannable.kind); break;
    case 'glyph-stone': group = createGlyphStone({ glyph: context.world?.glyphSyntax?.charset?.[0] }); break;
    case 'wind-node': group = createWindNode(); break;
    case 'star-stone': group = createStarStone(); break;
    case 'water-source': group = createWaterSource(); break;
    case 'beast-track': group = createBeastTrack(); break;
    case 'mineral-vein': group = createMineralVein(); break;
    case 'memory-residue': group = createMemoryResidue(); break;
    default: group = createDefaultScannable(); break;
  }
  const y = context.world?.heightAt(scannable.x, scannable.z) ?? 0;
  group.position.set(scannable.x, y + 0.08, scannable.z);
  group.name = scannable.id;
  applyAssetMetadata(group, scannableAssetId(scannable.kind));
  addToonOutline(group, {
    category: 'scannable',
    enabled: context.quality?.outlineEnabled ?? true,
    qualityScale: context.quality?.outlineScale ?? 1
  });
  return group;
}
