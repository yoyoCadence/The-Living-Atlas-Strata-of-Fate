import * as THREE from 'three';
import { applyAssetMetadata } from '../../assets/manifest.js';
import { createToonMaterial } from '../materials/animeToon.js';
import { addToonOutline } from '../utils/outline.js';

export function createPrimitiveFallback(assetId, options = {}) {
  const group = new THREE.Group();
  const color = options.color ?? 0x999999;
  const material = createToonMaterial({ color });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  mesh.position.y = 0.5;
  group.add(mesh);
  applyAssetMetadata(group, assetId, { sourceType: 'fallbackPrimitive', source: 'fallback' });
  addToonOutline(group, { enabled: options.outlineEnabled ?? true, qualityScale: options.outlineScale ?? 1 });
  return group;
}
