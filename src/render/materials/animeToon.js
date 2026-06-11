import * as THREE from 'three';
import { ART_COLORS, BIOME_RAMPS } from '../../assets/palettes.js';

const gradientCache = new Map();

export function createToonGradientMap(steps = 4) {
  const key = String(steps);
  if (gradientCache.has(key)) return gradientCache.get(key);
  const data = new Uint8Array(steps * 3);
  for (let i = 0; i < steps; i++) {
    const t = i / Math.max(1, steps - 1);
    const v = Math.round(54 + t * 201);
    data[i * 3] = v;
    data[i * 3 + 1] = v;
    data[i * 3 + 2] = v;
  }
  const texture = new THREE.DataTexture(data, steps, 1, THREE.RGBFormat);
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  gradientCache.set(key, texture);
  return texture;
}

export function createToonMaterial(profile = {}) {
  const material = new THREE.MeshToonMaterial({
    color: profile.color ?? profile.base ?? 0xffffff,
    emissive: profile.emissive ?? 0x000000,
    emissiveIntensity: profile.emissiveIntensity ?? 0,
    vertexColors: profile.vertexColors ?? false,
    transparent: profile.transparent ?? false,
    opacity: profile.opacity ?? 1,
    side: profile.side ?? THREE.FrontSide,
    gradientMap: createToonGradientMap(profile.steps ?? 4)
  });
  material.userData.materialProfile = profile.materialProfile ?? 'toon';
  return material;
}

export function createTerrainToonMaterial(biome = 'plains') {
  return createToonMaterial({
    color: BIOME_RAMPS[biome]?.[1] ?? 0x7a8f54,
    vertexColors: true,
    materialProfile: 'terrain',
    steps: 4
  });
}

export function createEmissiveAccentMaterial(color = ART_COLORS.lumen, intensity = 1) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: false,
    toneMapped: false
  });
  material.userData.materialProfile = 'emissive';
  material.userData.emissiveIntensity = intensity;
  return material;
}

export function createTransparentMagicMaterial(options = {}) {
  const material = new THREE.MeshBasicMaterial({
    color: options.color ?? ART_COLORS.anomaly,
    transparent: true,
    opacity: options.opacity ?? 0.45,
    side: options.side ?? THREE.DoubleSide,
    depthWrite: options.depthWrite ?? false,
    blending: options.blending ?? THREE.NormalBlending,
    toneMapped: false
  });
  material.userData.materialProfile = 'transparentMagic';
  return material;
}

export function createWaterAnimeMaterial(options = {}) {
  const material = createToonMaterial({
    color: options.color ?? ART_COLORS.water,
    transparent: true,
    opacity: options.opacity ?? 0.82,
    emissive: options.emissive ?? 0x173344,
    emissiveIntensity: options.emissiveIntensity ?? 0.18,
    materialProfile: 'water'
  });
  return material;
}

export function createNightReadableMaterial(baseProfile = {}) {
  return createToonMaterial({
    ...baseProfile,
    emissive: baseProfile.emissive ?? ART_COLORS.keyLight,
    emissiveIntensity: baseProfile.emissiveIntensity ?? 0.16
  });
}
