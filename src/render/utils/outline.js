import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';

const DEFAULT_WIDTH_BY_CATEGORY = {
  player: 0.035,
  npc: 0.026,
  creature: 0.03,
  landmark: 0.018,
  scannable: 0.045,
  prop: 0.018
};

function outlineWidthFor(mesh, options) {
  const category = options.category ?? mesh.userData.assetCategory ?? mesh.parent?.userData?.assetCategory;
  const base = options.width ?? DEFAULT_WIDTH_BY_CATEGORY[category] ?? 0.02;
  return base * (options.qualityScale ?? 1);
}

export function addToonOutline(object, options = {}) {
  if (options.enabled === false) return object;
  const color = options.color ?? ART_COLORS.ink;
  object.traverse((child) => {
    if (!child.isMesh || child.isInstancedMesh || child.userData.isToonOutline) return;
    if (child.children.some((c) => c.userData?.isToonOutline)) return;
    const width = outlineWidthFor(child, options);
    if (width <= 0) return;
    const outline = new THREE.Mesh(
      child.geometry,
      new THREE.MeshBasicMaterial({
        color,
        side: THREE.BackSide,
        transparent: true,
        opacity: options.opacity ?? 0.9,
        depthWrite: false
      })
    );
    outline.name = `${child.name || 'mesh'}_outline`;
    outline.userData.isToonOutline = true;
    outline.renderOrder = (child.renderOrder ?? 0) - 1;
    const scale = 1 + width;
    outline.scale.set(scale, scale, scale);
    child.add(outline);
  });
  return object;
}

export function removeToonOutline(object) {
  object.traverse((child) => {
    for (let i = child.children.length - 1; i >= 0; i--) {
      if (child.children[i].userData?.isToonOutline) {
        child.children[i].material?.dispose?.();
        child.remove(child.children[i]);
      }
    }
  });
  return object;
}
