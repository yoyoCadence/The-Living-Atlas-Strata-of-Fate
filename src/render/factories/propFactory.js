import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';
import { createTransparentMagicMaterial, createToonMaterial } from '../materials/animeToon.js';

export function mesh(geometry, material, options = {}) {
  const m = new THREE.Mesh(geometry, material);
  if (options.name) m.name = options.name;
  if (options.position) m.position.set(options.position.x ?? 0, options.position.y ?? 0, options.position.z ?? 0);
  if (options.rotation) m.rotation.set(options.rotation.x ?? 0, options.rotation.y ?? 0, options.rotation.z ?? 0);
  if (options.scale) {
    if (typeof options.scale === 'number') m.scale.setScalar(options.scale);
    else m.scale.set(options.scale.x ?? 1, options.scale.y ?? 1, options.scale.z ?? 1);
  }
  m.castShadow = options.castShadow ?? false;
  m.receiveShadow = options.receiveShadow ?? false;
  return m;
}

export function createBlobShadow(radius = 1, opacity = 0.28) {
  const shadow = mesh(
    new THREE.CircleGeometry(radius, 24),
    createTransparentMagicMaterial({ color: ART_COLORS.ink, opacity, depthWrite: false }),
    { rotation: { x: -Math.PI / 2 }, position: { y: 0.025 }, name: 'blob_shadow' }
  );
  shadow.renderOrder = -10;
  return shadow;
}

export function createLantern(color = ART_COLORS.paleGold, radius = 0.24) {
  const group = new THREE.Group();
  group.add(mesh(new THREE.SphereGeometry(radius, 8, 8), new THREE.MeshBasicMaterial({ color, toneMapped: false })));
  group.add(mesh(new THREE.TorusGeometry(radius * 1.15, radius * 0.08, 5, 12), createToonMaterial({ color: ART_COLORS.mutedGold })));
  return group;
}

export function createRibbon(color = ART_COLORS.lumen, length = 1.4) {
  const ribbon = mesh(
    new THREE.PlaneGeometry(0.18, length),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide, toneMapped: false }),
    { rotation: { z: 0.16 } }
  );
  return ribbon;
}
