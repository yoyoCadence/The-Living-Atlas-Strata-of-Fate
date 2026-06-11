export function collectAssetStats(scene) {
  const stats = { new: 0, fallback: 0, totalTagged: 0, byId: {} };
  scene.traverse((object) => {
    if (!object.userData?.assetId) return;
    stats.totalTagged++;
    const source = object.userData.source ?? 'new';
    if (source === 'fallback') stats.fallback++;
    else stats.new++;
    stats.byId[object.userData.assetId] = (stats.byId[object.userData.assetId] ?? 0) + 1;
  });
  return stats;
}

export function createArtDebugOverlay(enabled) {
  if (!enabled || !globalThis.document) {
    return { enabled: false, update() {} };
  }
  const el = document.createElement('div');
  el.id = 'art-debug-overlay';
  el.style.cssText = [
    'position:fixed',
    'right:10px',
    'top:10px',
    'z-index:80',
    'padding:8px 10px',
    'font:11px/1.45 Consolas,monospace',
    'color:#f3ead6',
    'background:rgba(12,14,20,.82)',
    'border:1px solid rgba(69,232,192,.5)',
    'border-radius:6px',
    'pointer-events:none',
    'min-width:190px'
  ].join(';');
  document.body.append(el);
  let elapsed = 0;
  return {
    enabled: true,
    update(dt, perf, assetStats) {
      elapsed += dt;
      if (elapsed < 0.2) return;
      elapsed = 0;
      const topAssets = Object.entries(assetStats.byId ?? {})
        .slice(0, 8)
        .map(([id, count]) => `${id}:${count}`)
        .join(' ');
      el.innerHTML = [
        `quality: ${perf.profileId}`,
        `fps: ${perf.fps.toFixed(1)} / frame: ${perf.frameMs.toFixed(1)}ms`,
        `draw: ${perf.drawCalls} / tris: ${perf.triangles}`,
        `assets new:${assetStats.new} fallback:${assetStats.fallback}`,
        `ids: ${topAssets}`
      ].join('<br>');
    }
  };
}
