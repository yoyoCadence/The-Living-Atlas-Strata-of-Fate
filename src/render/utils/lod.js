import * as THREE from 'three';

export function createLodGroup(levels = []) {
  const lod = new THREE.LOD();
  for (const level of levels) {
    if (!level.object) continue;
    lod.addLevel(level.object, level.distance ?? 0);
  }
  lod.userData.isManagedLod = true;
  return lod;
}

export function applyFarFade(object, cameraPosition, distance, fadeStart, fadeEnd) {
  const d = object.position.distanceTo(cameraPosition);
  const t = Math.max(0, Math.min(1, (d - fadeStart) / Math.max(1, fadeEnd - fadeStart)));
  const opacity = 1 - t;
  object.traverse((child) => {
    if (!child.material || !('opacity' in child.material)) return;
    child.material.transparent = true;
    child.material.opacity = Math.min(child.material.opacity, opacity);
  });
  object.visible = d < distance;
}
