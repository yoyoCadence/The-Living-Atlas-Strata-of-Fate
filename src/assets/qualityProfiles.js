export const QUALITY_ORDER = ['high', 'medium', 'low'];

export const QUALITY_PROFILES = {
  high: {
    id: 'high',
    label: 'High',
    targetFps: 60,
    renderPixelRatio: 1.75,
    maxPixelRatio: 2.25,
    outlineEnabled: true,
    outlineScale: 1,
    toonSteps: 4,
    vfxDensity: 1,
    particleMultiplier: 1,
    vegetationDensity: 1,
    decorationDensity: 1,
    farLodDistance: 210,
    shadowMode: 'blob',
    lightweightBloom: false,
    drawCallTarget: 120,
    drawCallHardCap: 180,
    triangleTarget: 150000,
    triangleHardCap: 250000,
    downgradeFrameMs: 23.5
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    targetFps: 45,
    renderPixelRatio: 1.25,
    maxPixelRatio: 1.75,
    outlineEnabled: true,
    outlineScale: 0.8,
    toonSteps: 4,
    vfxDensity: 0.62,
    particleMultiplier: 0.55,
    vegetationDensity: 0.68,
    decorationDensity: 0.7,
    farLodDistance: 150,
    shadowMode: 'blob',
    lightweightBloom: false,
    drawCallTarget: 90,
    drawCallHardCap: 130,
    triangleTarget: 95000,
    triangleHardCap: 160000,
    downgradeFrameMs: 29
  },
  low: {
    id: 'low',
    label: 'Low',
    targetFps: 30,
    renderPixelRatio: 1,
    maxPixelRatio: 1.25,
    outlineEnabled: false,
    outlineScale: 0,
    toonSteps: 3,
    vfxDensity: 0.32,
    particleMultiplier: 0.25,
    vegetationDensity: 0.38,
    decorationDensity: 0.45,
    farLodDistance: 100,
    shadowMode: 'none',
    lightweightBloom: false,
    drawCallTarget: 65,
    drawCallHardCap: 90,
    triangleTarget: 55000,
    triangleHardCap: 90000,
    downgradeFrameMs: 36
  }
};

export function resolveQualityProfile(id = 'high') {
  return QUALITY_PROFILES[id] ?? QUALITY_PROFILES.high;
}

export function requestedQualityFromUrl(search = globalThis.location?.search ?? '') {
  const params = new URLSearchParams(search);
  return resolveQualityProfile(params.get('quality') ?? 'high');
}

export function nextLowerQuality(id) {
  const idx = QUALITY_ORDER.indexOf(id);
  if (idx < 0 || idx >= QUALITY_ORDER.length - 1) return null;
  return resolveQualityProfile(QUALITY_ORDER[idx + 1]);
}

export function applyRendererQuality(renderer, profile) {
  const deviceRatio = globalThis.window?.devicePixelRatio ?? 1;
  const ratio = Math.min(deviceRatio, profile.renderPixelRatio, profile.maxPixelRatio);
  renderer.setPixelRatio(Math.max(1, ratio));
}
