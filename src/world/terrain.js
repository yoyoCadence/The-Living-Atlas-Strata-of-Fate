// Terrain + Hydrology Layer。
// 因果規則：山區（東北）→ 河流源頭 → 河流向西南流入湖泊 → 湖邊適合聚落。
// 乾谷（南方）是「被堵塞的水脈」：可被玩家修復，是水文層與矛盾引擎的交點。

import { Noise2D } from '../core/rng.js';

export function buildTerrain(seed, weights) {
  const size = 600; // x,z ∈ [-300, 300]
  const base = new Noise2D(seed + '/base');
  const mountN = new Noise2D(seed + '/mount');
  const moist = new Noise2D(seed + '/moist');

  const mountCenter = { x: 150, z: -150 }, mountR = 150;
  const lake = { x: -60, z: 120, r: 38 };
  const dryBasin = { x: 70, z: 180, r: 48, restored: false };

  function mountMask(x, z) {
    const d = Math.hypot(x - mountCenter.x, z - mountCenter.z);
    const t = Math.max(0, 1 - d / mountR);
    return t * t;
  }

  // ---- 河流：源頭在山區，終點在湖。規則「河必有源與終」由建構保證 ----
  const riverPts = [];
  {
    const src = { x: mountCenter.x - 30, z: mountCenter.z + 40 };
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = src.x + (lake.x - src.x) * t;
      const z = src.z + (lake.z - src.z) * t;
      // 垂直於主方向的噪聲蜿蜒
      const wig = (base.at(t * 6 + 13.7, 4.2) - 0.5) * 90 * Math.sin(t * Math.PI);
      const dx = lake.x - src.x, dz = lake.z - src.z;
      const len = Math.hypot(dx, dz);
      riverPts.push({ x: x + (-dz / len) * wig, z: z + (dx / len) * wig });
    }
  }
  // 逆流異常河段（Anomaly Layer 會引用）：索引 22~30
  const reverseSegment = [22, 30];

  function distToRiver(x, z) {
    let m = Infinity;
    for (let i = 0; i < riverPts.length; i++) {
      const p = riverPts[i];
      const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
      if (d < m) m = d;
    }
    return Math.sqrt(m);
  }

  function heightRaw(x, z) {
    let h = 2 + (base.fbm(x * 0.008 + 50, z * 0.008 + 50, 4) - 0.5) * 16;
    h += mountMask(x, z) * (10 + mountN.fbm(x * 0.02, z * 0.02, 4) * 48);
    // 湖盆
    const dL = Math.hypot(x - lake.x, z - lake.z);
    if (dL < lake.r + 26) {
      const t = Math.max(0, 1 - dL / (lake.r + 26));
      h = h * (1 - t) + (-4) * t;
    }
    // 乾谷淺盆
    const dB = Math.hypot(x - dryBasin.x, z - dryBasin.z);
    if (dB < dryBasin.r + 20) {
      const t = Math.max(0, 1 - dB / (dryBasin.r + 20));
      h -= t * 5;
    }
    return h;
  }

  function heightAt(x, z) {
    let h = heightRaw(x, z);
    const dR = distToRiver(x, z);
    if (dR < 14) {
      const t = 1 - dR / 14;
      h -= t * t * 6; // 河谷下切
    }
    return h;
  }

  function moistureAt(x, z) {
    let m = moist.fbm(x * 0.01, z * 0.01, 3);
    m += Math.max(0, 1 - distToRiver(x, z) / 60) * 0.3;
    m += Math.max(0, 1 - Math.hypot(x - lake.x, z - lake.z) / 120) * 0.2;
    return Math.min(1, m);
  }

  function biomeAt(x, z) {
    if (mountMask(x, z) > 0.30) return 'floating-mounts';
    if (distToRiver(x, z) < 16) return 'river-valley';
    if (x < -50 && moistureAt(x, z) > 0.45) return 'glow-forest';
    if (x > 110 && z > 110 && Math.hypot(x - dryBasin.x, z - dryBasin.z) > dryBasin.r) return 'magnet-desert';
    return 'plains';
  }

  return {
    size, waterLevel: 0,
    heightAt, heightRaw, biomeAt, moistureAt, mountMask, distToRiver,
    river: { points: riverPts, reverseSegment },
    lake, dryBasin, mountCenter, mountR
  };
}
