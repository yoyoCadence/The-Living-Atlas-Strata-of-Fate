import * as THREE from 'three';
import { RNG } from '../../core/rng.js';
import { applyAssetMetadata } from '../../assets/manifest.js';
import { createToonMaterial } from '../materials/animeToon.js';
import { createInstancedMesh, setInstanceTransform } from '../utils/instancing.js';

export function createVegetationAssets(world, quality = {}) {
  const group = new THREE.Group();
  group.name = 'vegetation_assets';
  const r = new RNG(world.seed + '/veg');
  const density = quality.vegetationDensity ?? 1;
  const treeTarget = Math.max(45, Math.round(240 * density));
  const rockTarget = Math.max(24, Math.round(80 * density));

  const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 5, 6);
  const canopyGeo = new THREE.IcosahedronGeometry(3.2, 1);
  const trunkMat = createToonMaterial({ color: 0x4a3a30 });
  const canopyMat = createToonMaterial({ color: 0x2e7e6a, emissive: 0x1a5a50, emissiveIntensity: 0.5 });
  const trunks = createInstancedMesh(trunkGeo, trunkMat, treeTarget, 'lumen_tree_trunks');
  const canopies = createInstancedMesh(canopyGeo, canopyMat, treeTarget, 'lumen_tree_canopies');

  let n = 0;
  let guard = 0;
  const treeData = [];
  while (n < treeTarget && guard++ < 5000) {
    const x = r.float(-260, -40), z = r.float(-140, 160);
    if (world.biomeAt(x, z) !== 'glow-forest') continue;
    const h = world.heightAt(x, z), s = r.float(0.7, 1.65);
    setInstanceTransform(trunks, n, { x, y: h + 2.4 * s, z }, s, r.float(0, Math.PI * 2));
    setInstanceTransform(canopies, n, { x, y: h + 5.7 * s, z }, { x: s, y: s * r.float(0.9, 1.25), z: s }, r.float(0, Math.PI * 2));
    treeData.push({ x, z, edge: x > -90 });
    n++;
  }
  trunks.count = n;
  canopies.count = n;
  trunks.instanceMatrix.needsUpdate = true;
  canopies.instanceMatrix.needsUpdate = true;
  applyAssetMetadata(trunks, 'tree_lumen', { category: 'vegetation' });
  applyAssetMetadata(canopies, 'tree_lumen', { category: 'vegetation' });
  group.add(trunks, canopies);

  const rockGeo = new THREE.ConeGeometry(2.5, 6, 6);
  const rockMat = createToonMaterial({ color: 0x6e6a80 });
  const rocks = createInstancedMesh(rockGeo, rockMat, rockTarget, 'mountain_rocks');
  n = 0;
  guard = 0;
  while (n < rockTarget && guard++ < 2000) {
    const x = r.float(20, 280), z = r.float(-280, -20);
    if (world.biomeAt(x, z) !== 'floating-mounts') continue;
    const h = world.heightAt(x, z), s = r.float(0.8, 3);
    setInstanceTransform(rocks, n, { x, y: h + 2 * s, z }, s, r.float(0, Math.PI * 2));
    n++;
  }
  rocks.count = n;
  rocks.instanceMatrix.needsUpdate = true;
  applyAssetMetadata(rocks, 'rock_mount', { category: 'vegetation' });
  group.add(rocks);

  const grassCount = Math.max(0, Math.round(120 * (quality.decorationDensity ?? 1)));
  const grassGeo = new THREE.ConeGeometry(0.22, 0.9, 4);
  const grassMat = createToonMaterial({ color: 0x7a8f54 });
  const grass = createInstancedMesh(grassGeo, grassMat, grassCount, 'ground_scatter_grass');
  n = 0;
  guard = 0;
  while (n < grassCount && guard++ < 2500) {
    const x = r.float(-240, 240), z = r.float(-240, 240);
    const b = world.biomeAt(x, z);
    if (b !== 'plains' && b !== 'river-valley') continue;
    const h = world.heightAt(x, z);
    setInstanceTransform(grass, n, { x, y: h + 0.42, z }, r.float(0.5, 1.2), r.float(0, Math.PI * 2));
    n++;
  }
  grass.count = n;
  grass.instanceMatrix.needsUpdate = true;
  applyAssetMetadata(grass, 'ground_scatter', { category: 'vegetation' });
  group.add(grass);

  return { group, trunks, canopies, canopyMat, treeData };
}
