// Living Map System：地圖即玩法。
// 八個資訊層：terrain / hydrology / ecology / civilization / anomaly / memory / inference / destiny。
// 玩家初始只見粗略地形；掃描與探索補完各層；命運稱號改變地圖樣式（非數值呈現）。

import { bus } from '../core/bus.js';
import { BIOMES } from '../data/biomes.js';
import { drawMapMarker } from '../render/utils/canvasTexture.js';

const LAYERS = [
  { id: 'terrain', name: '地形' },
  { id: 'hydrology', name: '水文' },
  { id: 'ecology', name: '生態' },
  { id: 'civilization', name: '文明' },
  { id: 'anomaly', name: '異常' },
  { id: 'memory', name: '記憶' },
  { id: 'inference', name: '推論' },
  { id: 'destiny', name: '命運' }
];

export class LivingMap {
  constructor(game) {
    this.g = game; // { world, memory, scanning, inference, myth, abilities, destiny, rumor, player }
    this.canvas = document.getElementById('map-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.size = 640;
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.enabled = Object.fromEntries(LAYERS.map(l => [l.id, true]));
    this.open = false;
    this.revealAll = false; // debug
    this.terrainCache = null;
    this.buildSidebar();
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    document.getElementById('map-close').addEventListener('click', () => this.toggle(false));
    bus.on('render-update', () => { this.terrainCacheDirty = true; if (this.open) this.render(); });
    bus.on('rumor', () => { if (this.open) this.renderSidebarDynamic(); });
    bus.on('hypothesis', () => { if (this.open) this.renderSidebarDynamic(); });
  }

  setWorld() { this.terrainCache = null; }

  // ---- 座標轉換 ----
  toPx(x, z) {
    const half = this.g.world.size / 2;
    return [((x + half) / this.g.world.size) * this.size, ((z + half) / this.g.world.size) * this.size];
  }
  toWorld(px, py) {
    const half = this.g.world.size / 2;
    return { x: (px / this.size) * this.g.world.size - half, z: (py / this.size) * this.g.world.size - half };
  }

  toggle(force) {
    this.open = force ?? !this.open;
    document.getElementById('map-overlay').classList.toggle('open', this.open);
    if (this.open) {
      document.exitPointerLock?.(); // 開地圖時釋放滑鼠
      this.render();
      this.renderSidebarDynamic();
    }
  }

  // ---- 側欄 ----
  buildSidebar() {
    const el = document.getElementById('layer-toggles');
    el.innerHTML = '';
    for (const l of LAYERS) {
      const lab = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = this.enabled[l.id];
      cb.addEventListener('change', () => { this.enabled[l.id] = cb.checked; this.render(); });
      const span = document.createElement('span');
      span.textContent = l.name;
      const und = document.createElement('span');
      und.className = 'understanding';
      und.dataset.layer = l.id;
      lab.append(cb, span, und);
      el.append(lab);
    }
  }

  /** 各層「理解度」：玩家對世界規律的掌握程度 */
  understanding(layerId) {
    const g = this.g;
    const cluesOf = (layer) => g.scanning.clues.filter(c => c.relatedLayer === layer).length;
    switch (layerId) {
      case 'terrain': return Math.min(1, g.memory.exploredRatio() * 2.2);
      case 'hydrology': return Math.min(1, cluesOf('hydrology') / 3);
      case 'ecology': return Math.min(1, cluesOf('ecology') / 8);
      case 'civilization': return Math.min(1, cluesOf('civilization') / 4);
      case 'anomaly': return Math.min(1, cluesOf('anomaly') / 3);
      case 'memory': return Math.min(1, cluesOf('memory') / 2);
      case 'inference': {
        const n = g.inference.hypotheses.length;
        const done = g.inference.hypotheses.filter(h => h.status === 'completed').length;
        return n ? (0.3 + 0.7 * done / n) : 0;
      }
      case 'destiny': return g.abilities.isUnlocked('myth-sight') ? 1 : 0;
      default: return 0;
    }
  }

  renderSidebarDynamic() {
    // 理解度
    for (const el of document.querySelectorAll('.understanding')) {
      el.textContent = Math.round(this.understanding(el.dataset.layer) * 100) + '%';
    }
    // 稱號行
    const t = this.g.myth.title;
    document.getElementById('map-title-line').textContent =
      t.id === 'nameless-walker' ? '世界尚未為你命名' : '世界稱你為「' + t.name + '」：' + t.desc;
    // 推論列表
    const list = document.getElementById('hypo-list');
    list.innerHTML = '';
    for (const h of this.g.inference.hypotheses.slice().reverse()) {
      const div = document.createElement('div');
      div.className = 'hypo ' + h.status;
      const conf = Math.round(h.confidence * 100);
      div.innerHTML = '<div class="h-title">' + h.title + '</div>' +
        '<div class="h-conf">信心 ' + conf + '% ｜ ' + ({ new: '未決', accepted: '追查中', ignored: '已擱置', completed: '已證實' })[h.status] + '</div>' +
        '<div style="font-size:11px;color:#aab;margin:3px 0;">' + h.suggestedAction + '</div>';
      if (h.status === 'new') {
        const b1 = document.createElement('button');
        b1.textContent = '追查';
        b1.onclick = () => { this.g.inference.accept(h.id); this.render(); this.renderSidebarDynamic(); };
        const b2 = document.createElement('button');
        b2.textContent = '擱置';
        b2.onclick = () => { this.g.inference.ignore(h.id); this.render(); this.renderSidebarDynamic(); };
        div.append(b1, b2);
      }
      list.append(div);
    }
    if (!this.g.inference.hypotheses.length) {
      list.innerHTML = '<div style="color:#667;font-size:11px;">掃描世界中的事物，線索會自己連成推論。</div>';
    }
    // 傳聞紀錄
    const log = document.getElementById('rumor-log');
    log.innerHTML = '';
    for (const r of this.g.rumor.log.slice(-8).reverse()) {
      const d = document.createElement('div');
      d.textContent = '「' + r.text + '」—' + r.source;
      log.append(d);
    }
    // 命運稱號 → 地圖視覺樣式
    this.canvas.className = this.g.myth.title.mapClass ?? '';
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (this.size / rect.width);
    const py = (e.clientY - rect.top) * (this.size / rect.height);
    const { x, z } = this.toWorld(px, py);
    this.g.memory.addMarker(x, z, '標記 ' + (this.g.memory.data.markers.length + 1));
    this.render();
  }

  // ---- 繪製 ----
  buildTerrainCache() {
    const N = 160;
    const off = document.createElement('canvas');
    off.width = N; off.height = N;
    const c = off.getContext('2d');
    const img = c.createImageData(N, N);
    const w = this.g.world;
    const half = w.size / 2;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = (i / N) * w.size - half, z = (j / N) * w.size - half;
        const h = w.heightAt(x, z);
        const b = BIOMES[w.biomeAt(x, z)] ?? BIOMES.plains;
        let [r, g2, bl] = b.color.map(v => v * 255);
        // 高度陰影
        const shade = 0.62 + Math.max(-0.3, Math.min(0.55, h / 60));
        r *= shade; g2 *= shade; bl *= shade;
        if (h < w.waterLevel + 0.3) { r = 50; g2 = 90; bl = 130; }
        // 乾谷修復 → 綠洲色（世界回應在地圖上的可見變化）
        const dB = Math.hypot(x - w.dryBasin.x, z - w.dryBasin.z);
        if (dB < w.dryBasin.r) {
          if (w.dryBasin.restored) { r = 70; g2 = 150; bl = 90; }
          else { r = 160; g2 = 140; bl = 95; }
        }
        const k = (j * N + i) * 4;
        img.data[k] = r; img.data[k + 1] = g2; img.data[k + 2] = bl; img.data[k + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
    this.terrainCache = off;
    this.terrainCacheDirty = false;
  }

  render() {
    const ctx = this.ctx, S = this.size, g = this.g, w = g.world;
    ctx.clearRect(0, 0, S, S);
    if (!this.terrainCache || this.terrainCacheDirty) this.buildTerrainCache();

    // 1. terrain
    if (this.enabled.terrain) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.terrainCache, 0, 0, S, S);
    } else {
      ctx.fillStyle = '#10131c'; ctx.fillRect(0, 0, S, S);
    }

    // 2. hydrology
    if (this.enabled.hydrology) {
      ctx.strokeStyle = '#5aa7d8'; ctx.lineWidth = 3; ctx.beginPath();
      w.river.points.forEach((p, i) => {
        const [x, y] = this.toPx(p.x, p.z);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
      const [lx, ly] = this.toPx(w.lake.x, w.lake.z);
      ctx.fillStyle = 'rgba(90,167,216,.8)';
      ctx.beginPath(); ctx.arc(lx, ly, (w.lake.r / w.size) * S, 0, Math.PI * 2); ctx.fill();
    }

    // 3. ecology（需要線索才顯示：地圖由掃描補完）
    if (this.enabled.ecology) {
      const ecoClues = g.scanning.clues.filter(c => c.relatedLayer === 'ecology');
      ctx.font = '11px sans-serif';
      for (const c of ecoClues) {
        const [x, y] = this.toPx(c.location.x, c.location.z);
        ctx.fillStyle = '#8fd48f'; ctx.fillText('❀', x - 5, y + 4);
      }
      if (g.abilities.isUnlocked('ecology-hearing')) {
        ctx.strokeStyle = 'rgba(143,212,143,.5)'; ctx.setLineDash([4, 4]); ctx.beginPath();
        for (const m of w.migrations) {
          m.points.forEach((p, i) => {
            const [x, y] = this.toPx(p.x, p.z);
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          });
        }
        ctx.stroke(); ctx.setLineDash([]);
      }
      if (w.ecoRegions['glow-forest'].silent) {
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        const [fx, fy] = this.toPx(-160, 10);
        ctx.beginPath(); ctx.arc(fx, fy, 70, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#caa'; ctx.fillText('寂靜', fx - 12, fy);
      }
    }

    // 4. civilization
    if (this.enabled.civilization) {
      ctx.strokeStyle = 'rgba(214,194,150,.7)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      for (const road of w.roads) {
        ctx.beginPath();
        road.forEach((p, i) => {
          const [x, y] = this.toPx(p.x, p.z);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const lm of w.landmarks) {
        const [x, y] = this.toPx(lm.x, lm.z);
        const seen = this.revealAll || this.isExplored(lm.x, lm.z);
        if (lm.kind === 'hollow' && !lm.found && !this.revealAll) continue;
        drawMapMarker(ctx, lm.kind, x, y, {
          color: seen ? '#f3ead6' : '#9a927f',
          accent: lm.kind === 'node' ? '#6fc3f0' : lm.kind === 'tree' ? '#45e8c0' : '#ffe9a8',
          alpha: seen ? 1 : 0.38
        });
        if (seen) {
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#f3ead6';
          ctx.fillText(lm.name, x + 8, y + 4);
        }
      }
    }

    // 5. anomaly
    if (this.enabled.anomaly) {
      for (const a of w.anomalies) {
        const known = this.revealAll || g.scanning.clues.some(c => c.tags.includes('anomaly') || c.tags.includes('star')) || this.isExplored(a.x, a.z);
        if (!known) continue;
        const [x, y] = this.toPx(a.x, a.z);
        drawMapMarker(ctx, 'anomaly', x, y, { color: '#c49ae8', accent: '#f08ab8' });
        if (a.r) {
          ctx.strokeStyle = 'rgba(176,138,212,.4)';
          ctx.beginPath(); ctx.arc(x, y, (a.r / w.size) * S, 0, Math.PI * 2); ctx.stroke();
        }
      }
    }

    // 6. memory：玩家標記 + 已掃描點
    if (this.enabled.memory) {
      for (const m of g.memory.data.markers) {
        const [x, y] = this.toPx(m.x, m.z);
        ctx.fillStyle = '#e0a458';
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 2); ctx.lineTo(x - 5, y); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = 'rgba(127,212,193,.8)';
      for (const c of g.scanning.clues) {
        const [x, y] = this.toPx(c.location.x, c.location.z);
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
    }

    // 7. inference：推論目標 + 建議路徑（顯示「可能路徑」而非導航線）
    if (this.enabled.inference) {
      for (const h of g.inference.hypotheses) {
        if (h.status === 'ignored' || h.status === 'completed') continue;
        const [x, y] = this.toPx(h.target.x, h.target.z);
        ctx.strokeStyle = h.status === 'accepted' ? '#7fd4c1' : 'rgba(127,212,193,.5)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#7fd4c1';
        ctx.fillText('?', x - 3, y + 4);
        if (h.status === 'accepted') {
          // 由相關線索位置畫虛線扇——暗示方向，不是直接導航
          ctx.setLineDash([2, 6]); ctx.strokeStyle = 'rgba(127,212,193,.35)';
          for (const cid of h.relatedClues.slice(0, 3)) {
            const c = g.scanning.clues.find(q => q.id === cid);
            if (!c) continue;
            const [cx, cy] = this.toPx(c.location.x, c.location.z);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
          }
          ctx.setLineDash([]);
        }
      }
    }

    // 8. destiny：神話視界——稱號如何改變世界（區域光暈，不用數值）
    if (this.enabled.destiny && g.abilities.isUnlocked('myth-sight')) {
      const t = g.myth.title;
      if (t.id !== 'nameless-walker') {
        const spots = {
          'mist-cartographer': [[-190, -170, 60], [-10, -60, 30]],
          'vein-mender': [[w.dryBasin.x, w.dryBasin.z, 55], [w.village.x, w.village.z, 30]],
          'tongue-of-stone': [[-150, -70, 45], [30, -10, 30]],
          'border-stalker': [[w.mountCenter.x - 70, w.mountCenter.z + 80, 50], [-160, 10, 50]],
          'terrain-decoder': [[w.mountCenter.x, w.mountCenter.z, 60], [w.dryBasin.x - 30, w.dryBasin.z - 38, 30]]
        }[t.id] ?? [[0, 0, 80]];
        for (const [sx, sz, sr] of spots) {
          const [x, y] = this.toPx(sx, sz);
          const r = (sr / w.size) * S;
          const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
          grad.addColorStop(0, 'rgba(255,220,150,.30)');
          grad.addColorStop(1, 'rgba(255,220,150,0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.font = '11px sans-serif'; ctx.fillStyle = 'rgba(255,220,150,.8)';
        ctx.fillText('✦ 你的神話正在這些地方改變世界', 14, S - 14);
      }
    }

    // 迷霧（memory layer 的核心：未探索 = 未知）
    if (!this.revealAll) {
      const GRID = g.memory.GRID;
      const cell = S / GRID;
      ctx.fillStyle = 'rgba(8,9,14,.86)';
      for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
          if (!g.memory.data.visited[j * GRID + i]) ctx.fillRect(i * cell, j * cell, cell + 0.5, cell + 0.5);
        }
      }
    }

    // 玩家位置
    const [px, py] = this.toPx(g.player.pos.x, g.player.pos.z);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7fd4c1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.stroke();
  }

  isExplored(x, z) {
    return !!this.g.memory.data.visited[this.g.memory.gridIndex(x, z)];
  }
}
