import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';
import { applyAssetMetadata } from '../../assets/manifest.js';
import {
  createToonMaterial,
  createTransparentMagicMaterial,
  createWaterAnimeMaterial,
  createEmissiveAccentMaterial
} from '../materials/animeToon.js';
import { createGlyphGlowMaterial } from '../materials/magicMaterials.js';
import { addToonOutline } from '../utils/outline.js';
import { createBlobShadow, mesh } from './propFactory.js';

export function createReverseRiverVfx(points, world, context = {}) {
  const group = new THREE.Group();
  const density = context.quality?.vfxDensity ?? 1;
  const mat = createGlyphGlowMaterial(ART_COLORS.anomaly, 0.62);
  const segPts = points.map((p) => new THREE.Vector3(p.x, world.heightAt(p.x, p.z) + 0.95, p.z));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segPts), new THREE.LineBasicMaterial({
    color: ART_COLORS.anomaly,
    transparent: true,
    opacity: 0.72
  })));
  const arrowCount = Math.max(2, Math.round(8 * density));
  for (let i = 0; i < arrowCount; i++) {
    const p = points[Math.floor((i / arrowCount) * (points.length - 1))];
    const q = points[Math.max(0, Math.floor((i / arrowCount) * (points.length - 1)) - 1)] ?? p;
    const angle = Math.atan2(q.x - p.x, q.z - p.z);
    const arrow = mesh(new THREE.ConeGeometry(0.7, 1.8, 5), mat.clone(), {
      position: { x: p.x, y: world.heightAt(p.x, p.z) + 1.15, z: p.z },
      rotation: { x: Math.PI / 2, y: angle },
      name: 'reverse_flow_arrow'
    });
    group.add(arrow);
  }
  group.userData.animate = 'reverseRiver';
  applyAssetMetadata(group, 'reverse_river_vfx');
  return group;
}

export function createFloatingIslandAsset(anomaly, world, context = {}) {
  const group = new THREE.Group();
  const rock = createToonMaterial({ color: 0x6e6a80 });
  const grass = createToonMaterial({ color: 0x5a8a5a });
  const underside = mesh(new THREE.ConeGeometry(14, 18, 8), rock, {
    position: { y: -9 },
    rotation: { x: Math.PI },
    name: 'float_island_underside'
  });
  const top = mesh(new THREE.CylinderGeometry(14, 13, 3, 8), grass, {
    position: { y: 1.5 },
    name: 'float_island_grassy_top'
  });
  group.add(underside, top);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI * 2 / 6;
    const root = mesh(new THREE.CylinderGeometry(0.12, 0.2, 5 + (i % 3), 5), createToonMaterial({ color: 0x4c3c34 }), {
      position: { x: Math.cos(a) * 5, y: -4.5 - i * 0.25, z: Math.sin(a) * 5 },
      rotation: { z: 0.22 * Math.cos(a), x: 0.22 * Math.sin(a) },
      name: 'float_island_root'
    });
    group.add(root);
  }
  for (let i = 0; i < 4; i++) {
    group.add(mesh(new THREE.ConeGeometry(0.42, 1.4, 5), createEmissiveAccentMaterial(ART_COLORS.anomaly, 0.8), {
      position: { x: Math.cos(i * 1.7) * 7, y: -5.8 - i, z: Math.sin(i * 1.7) * 7 },
      name: 'float_island_crystal'
    }));
  }
  const baseH = world.heightAt(anomaly.x, anomaly.z);
  group.position.set(anomaly.x, baseH + anomaly.baseHeight, anomaly.z);
  group.userData.anomaly = anomaly;
  group.userData.baseY = baseH + anomaly.baseHeight;
  group.userData.animate = 'floatIsland';
  applyAssetMetadata(group, 'float_island');
  addToonOutline(group, {
    category: 'landmark',
    enabled: context.quality?.outlineEnabled ?? true,
    qualityScale: context.quality?.outlineScale ?? 1
  });
  return group;
}

export function createMachineBaseAsset(anomaly, world) {
  const baseH = world.heightAt(anomaly.x, anomaly.z);
  const base = mesh(new THREE.CylinderGeometry(4, 5, 2, 8), createToonMaterial({
    color: 0x555566,
    emissive: ART_COLORS.anomaly,
    emissiveIntensity: 0.15
  }), {
    position: { x: anomaly.x, y: baseH + 1, z: anomaly.z },
    name: 'machine_base'
  });
  applyAssetMetadata(base, 'machine_base', { category: 'prop' });
  return base;
}

export function createFogZoneAsset(anomaly, world, context = {}) {
  const group = new THREE.Group();
  const density = context.quality?.vfxDensity ?? 1;
  const shell = mesh(new THREE.SphereGeometry(anomaly.r, 16, 10), createTransparentMagicMaterial({
    color: 0xd8e0e8,
    opacity: 0.22 * density,
    side: THREE.DoubleSide
  }), {
    scale: { x: 1, y: 0.3, z: 1 },
    name: 'fog_zone_shell'
  });
  group.add(shell);
  for (let i = 0; i < Math.round(8 * density); i++) {
    const a = i * 2.399;
    group.add(mesh(new THREE.PlaneGeometry(8, 2.2), createTransparentMagicMaterial({ color: 0xf3ead6, opacity: 0.12 }), {
      position: { x: Math.cos(a) * anomaly.r * 0.35, y: 1.2 + (i % 3) * 0.5, z: Math.sin(a) * anomaly.r * 0.35 },
      rotation: { y: a },
      name: 'fog_wisp'
    }));
  }
  group.position.set(anomaly.x, world.heightAt(anomaly.x, anomaly.z) + 4, anomaly.z);
  group.userData.animate = 'fog';
  applyAssetMetadata(group, 'fog_zone');
  return group;
}

export function createSilentValeAsset(anomaly, world) {
  const group = new THREE.Group();
  const dome = mesh(new THREE.SphereGeometry(anomaly.r, 16, 10), createTransparentMagicMaterial({
    color: 0x101418,
    opacity: 0.13,
    side: THREE.BackSide
  }), {
    scale: { x: 1, y: 0.32, z: 1 },
    name: 'silent_vale_dome'
  });
  const ring = mesh(new THREE.TorusGeometry(anomaly.r * 0.65, 0.06, 6, 48), createTransparentMagicMaterial({
    color: 0xd8e0e8,
    opacity: 0.18
  }), {
    rotation: { x: Math.PI / 2 },
    position: { y: 0.16 },
    name: 'silent_vale_cancel_ring'
  });
  group.add(dome, ring);
  group.position.set(anomaly.x, world.heightAt(anomaly.x, anomaly.z), anomaly.z);
  applyAssetMetadata(group, 'silent_vale', { category: 'vfx' });
  return group;
}

export function createMemoryStormAsset(anomaly, world, context = {}) {
  const group = new THREE.Group();
  const density = context.quality?.vfxDensity ?? 1;
  const swirl = mesh(new THREE.TorusGeometry(anomaly.r * 0.6, 0.45, 8, 36), createGlyphGlowMaterial(ART_COLORS.memory, 0.55), {
    rotation: { x: Math.PI / 2.4 },
    name: 'memory_storm_swirl'
  });
  group.add(swirl);
  for (let i = 0; i < Math.round(10 * density); i++) {
    group.add(mesh(new THREE.PlaneGeometry(0.6, 0.85), createTransparentMagicMaterial({
      color: i % 2 ? ART_COLORS.violet : ART_COLORS.memory,
      opacity: 0.38
    }), {
      position: { x: Math.cos(i) * anomaly.r * 0.45, y: -2 + i * 0.45, z: Math.sin(i * 1.4) * anomaly.r * 0.45 },
      rotation: { y: i * 0.6, z: i * 0.3 },
      name: 'memory_glyph_fragment'
    }));
  }
  group.position.set(anomaly.x, world.heightAt(anomaly.x, anomaly.z) + 8, anomaly.z);
  group.userData.parts = { swirl };
  group.userData.animate = 'memoryStorm';
  applyAssetMetadata(group, 'memory_storm');
  return group;
}

export function createWindBeamAsset(scannable, world) {
  const beam = mesh(new THREE.CylinderGeometry(1.2, 2.2, 30, 8, 1, true), createTransparentMagicMaterial({
    color: 0xbfe8ff,
    opacity: 0.22,
    side: THREE.DoubleSide
  }), {
    position: { x: scannable.x, y: world.heightAt(scannable.x, scannable.z) + 15, z: scannable.z },
    name: 'wind_sense_beam'
  });
  applyAssetMetadata(beam, 'wind_beam', { category: 'vfx' });
  return beam;
}

export function createEchoVisionAsset(landmark, world) {
  const wire = mesh(new THREE.SphereGeometry(10, 12, 8), new THREE.MeshBasicMaterial({
    color: ART_COLORS.lumen,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  }), {
    position: { x: landmark.x, y: world.heightAt(landmark.x, landmark.z) - 9, z: landmark.z },
    name: 'echo_vision_wire'
  });
  applyAssetMetadata(wire, 'echo_wire', { category: 'vfx' });
  return wire;
}

export function createStarRouteAsset(route, world) {
  const pts = route.map((l) => new THREE.Vector3(l.x, world.heightAt(l.x, l.z) + 1.2, l.z));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({
    color: ART_COLORS.paleGold,
    transparent: true,
    opacity: 0.8
  }));
  applyAssetMetadata(line, 'star_road', { category: 'vfx' });
  return line;
}

export function createMythRingAsset(x, z, world) {
  const ring = mesh(new THREE.TorusGeometry(10, 0.35, 6, 32), createTransparentMagicMaterial({
    color: 0xffdc96,
    opacity: 0.5
  }), {
    position: { x, y: world.heightAt(x, z) + 0.6, z },
    rotation: { x: Math.PI / 2 },
    name: 'myth_sight_ring'
  });
  applyAssetMetadata(ring, 'myth_rings', { category: 'vfx' });
  return ring;
}

export function createOasisPondAsset(world) {
  const pond = mesh(new THREE.CircleGeometry(14, 28), createWaterAnimeMaterial({ color: 0x4f9fc8, opacity: 0.8 }), {
    position: { x: world.dryBasin.x, y: world.heightAt(world.dryBasin.x, world.dryBasin.z) + 0.4, z: world.dryBasin.z },
    rotation: { x: -Math.PI / 2 },
    name: 'oasis_pond'
  });
  applyAssetMetadata(pond, 'oasis_pond', { category: 'vfx' });
  return pond;
}

export function createWaterSurfaceAsset(geometry, options = {}) {
  const water = mesh(geometry, createWaterAnimeMaterial(options), { name: options.name ?? 'water_surface' });
  applyAssetMetadata(water, options.assetId ?? 'river_surface', { category: 'vfx' });
  return water;
}
