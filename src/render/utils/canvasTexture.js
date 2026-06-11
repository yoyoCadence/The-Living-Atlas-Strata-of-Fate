import * as THREE from 'three';
import { CSS_COLORS } from '../../assets/palettes.js';

export function createCanvasTexture(size, draw) {
  if (!globalThis.document) {
    const data = new Uint8Array([255, 255, 255, 255]);
    const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createGlyphTexture(text = '', options = {}) {
  const size = options.size ?? 128;
  return createCanvasTexture(size, (ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = options.background ?? 'rgba(243,234,214,0.12)';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = options.stroke ?? CSS_COLORS.violet;
    ctx.lineWidth = Math.max(2, s * 0.035);
    ctx.strokeRect(s * 0.1, s * 0.1, s * 0.8, s * 0.8);
    ctx.fillStyle = options.color ?? CSS_COLORS.paleGold ?? '#ffe9a8';
    ctx.font = `${Math.floor(s * 0.42)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || '◇', s / 2, s / 2 + s * 0.02);
  });
}

const iconSvg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ABILITY_ICON_SVGS = {
  'wind-sense': iconSvg('<path d="M4 9c4-5 9-2 7 2-1 2-4 2-5 1"/><path d="M3 15c5 3 12 2 16-2"/><path d="M14 7c3-1 6 1 6 4"/>'),
  'echo-vision': iconSvg('<circle cx="12" cy="12" r="3"/><path d="M4 12a8 8 0 0 1 16 0"/><path d="M7 18a9 9 0 0 0 10 0"/>'),
  geopulse: iconSvg('<path d="M4 16h16"/><path d="M6 13l3-5 3 5 3-7 3 7"/><path d="M8 20h8"/>'),
  'ecology-hearing': iconSvg('<path d="M7 14c0-5 4-8 10-8 0 6-3 10-8 10"/><path d="M7 14c2-1 4-3 6-6"/><path d="M17 13c2 1 3 3 3 5"/><path d="M14 16c1 1 2 2 2 4"/>'),
  'time-residue': iconSvg('<path d="M12 7v5l3 2"/><path d="M5 5a9 9 0 1 1-1 12"/><path d="M3 9h4V5"/>'),
  'star-navigation': iconSvg('<path d="M12 3l1.8 5.1L19 10l-5.2 1.9L12 17l-1.8-5.1L5 10l5.2-1.9L12 3z"/><path d="M4 20c5-4 11-5 16-2"/>'),
  'myth-sight': iconSvg('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M17 5l2-2"/><path d="M7 19l-2 2"/>')
};

export function createAbilityIconElement(id) {
  const span = document.createElement('span');
  span.className = 'ability-icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = ABILITY_ICON_SVGS[id] ?? ABILITY_ICON_SVGS['myth-sight'];
  return span;
}

export function drawMapMarker(ctx, type, x, y, options = {}) {
  const color = options.color ?? '#f3ead6';
  const accent = options.accent ?? '#45e8c0';
  const alpha = options.alpha ?? 1;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.lineWidth = options.lineWidth ?? 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = accent;
  if (type === 'tower') {
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5, 8); ctx.lineTo(-5, 8); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -9, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'gate') {
    ctx.strokeRect(-7, -7, 14, 14);
    ctx.clearRect(-3, -2, 6, 9);
    ctx.beginPath(); ctx.moveTo(-7, -3); ctx.lineTo(7, -3); ctx.stroke();
  } else if (type === 'observatory') {
    ctx.beginPath(); ctx.arc(0, 2, 7, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(7, -8); ctx.stroke();
  } else if (type === 'tree') {
    ctx.beginPath(); ctx.arc(0, -3, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(0, 9); ctx.stroke();
  } else if (type === 'circle') {
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'node') {
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
  } else if (type === 'hollow') {
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  } else if (type === 'village') {
    ctx.beginPath(); ctx.moveTo(-7, 1); ctx.lineTo(0, -7); ctx.lineTo(7, 1); ctx.stroke();
    ctx.strokeRect(-5, 1, 10, 7);
  } else if (type === 'anomaly') {
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, 4); ctx.bezierCurveTo(-1, -8, 2, 8, 6, -4); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(6, 5); ctx.lineTo(0, 2); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
