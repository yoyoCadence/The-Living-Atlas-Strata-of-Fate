import { ART_COLORS } from '../../assets/palettes.js';
import {
  createEmissiveAccentMaterial,
  createTransparentMagicMaterial,
  createWaterAnimeMaterial
} from './animeToon.js';

export function createGlyphGlowMaterial(color = ART_COLORS.violet, opacity = 0.85) {
  return createTransparentMagicMaterial({ color, opacity, depthWrite: false });
}

export function createScanRingMaterial(color = ART_COLORS.lumen, opacity = 0.62) {
  return createTransparentMagicMaterial({ color, opacity, depthWrite: false });
}

export function createBeaconMaterial(color = ART_COLORS.paleGold, intensity = 1.2) {
  return createEmissiveAccentMaterial(color, intensity);
}

export function createWaterGlowMaterial(color = ART_COLORS.water) {
  return createWaterAnimeMaterial({ color, opacity: 0.72, emissiveIntensity: 0.35 });
}
