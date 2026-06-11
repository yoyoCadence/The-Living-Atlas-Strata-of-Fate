// Anomaly Layer。
// 規則：每個異常都有「可觀察規律」（period/pattern），可被掃描記錄、供推理利用；
// 異常是謎題與移動系統，不是裝飾。與 Destiny Axis 互動由 genWeights 控制數量/種類。

export function buildAnomalies(terrain, rng, weights) {
  const r = rng.fork('anomaly');
  const anomalies = [];

  // 1. 逆流河段：固定於河流中段（規律：流向恆定向高處，流速隨晝夜變化）
  const seg = terrain.river.reverseSegment;
  const segPts = terrain.river.points.slice(seg[0], seg[1] + 1);
  const mid = segPts[Math.floor(segPts.length / 2)];
  anomalies.push({
    id: 'reverse-river', kind: 'reverse-river', name: '逆流河段',
    x: mid.x, z: mid.z, points: segPts,
    pattern: '河水恆定向高處流，水面浮沫以固定週期逆行',
    period: 8
  });

  // 2. 浮空島：山區上空，按正弦週期升降（規律與星象石環紋數一致 → 推理鏈）
  anomalies.push({
    id: 'float-island', kind: 'float-island', name: '浮空島',
    x: terrain.mountCenter.x, z: terrain.mountCenter.z,
    baseHeight: 46, bobAmp: 6, period: 24, stabilized: false,
    pattern: '每 24 拍完成一次升降，與星象環紋 24 格吻合'
  });

  // 3. 寂靜谷（聲音消失區）：河谷邊（規律：邊界清晰，鳥鳴在邊界內瞬間消失）
  anomalies.push({
    id: 'silent-vale', kind: 'silent-zone', name: '寂靜谷',
    x: -20, z: 60, r: 25,
    pattern: '邊界內所有聲音消失；邊界精確得不自然'
  });

  // 4. 記憶風暴點：天文台附近（規律：夜間出現，殘影重播同一段過去）
  anomalies.push({
    id: 'memory-storm', kind: 'memory-storm', name: '記憶風暴',
    x: 150, z: 110, r: 18,
    pattern: '殘影每夜重播同一段過去——天文台倒塌的那一天'
  });

  // 迷霧地帶：數量受踏霧製圖者稱號權重影響（稱號 → 世界生成的示範路徑）
  const fogCount = Math.round(1 * (weights.fogZones ?? 1));
  for (let i = 0; i < fogCount; i++) {
    anomalies.push({
      id: 'fog-zone-' + i, kind: 'fog-zone', name: '未名之霧',
      x: r.float(-260, -120), z: r.float(-220, -120), r: r.float(30, 55),
      pattern: '霧的邊界不隨風動；霧內方向感失效，但星圖導航可穿越'
    });
  }

  return anomalies;
}
