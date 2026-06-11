// 種子化亂數與噪聲。所有世界生成只允許使用這裡的 RNG，確保同 seed 可重現、可 debug。

/** 字串 → 32bit hash（xmur3） */
export function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** sfc32 PRNG，回傳 [0,1) */
function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export class RNG {
  constructor(seed) {
    this.seed = String(seed);
    const h = hashString(this.seed);
    this.next = sfc32(h, h ^ 0x9e3779b9, h ^ 0x85ebca6b, h ^ 0xc2b2ae35);
    for (let i = 0; i < 12; i++) this.next(); // warm up
  }
  /** 子串流：同一 seed 下不同系統各自獨立，互不干擾生成順序 */
  fork(label) { return new RNG(this.seed + '/' + label); }
  float(min = 0, max = 1) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.float(min, max + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p) { return this.next() < p; }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

// ---- 2D value noise + fBm（決定論，由 seed hash 控制格點值）----
function gridHash(ix, iz, seedHash) {
  let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + seedHash;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function smooth(t) { return t * t * (3 - 2 * t); }

export class Noise2D {
  constructor(seed) { this.h = hashString(String(seed)); }
  /** value noise, 回傳 [0,1] */
  at(x, z) {
    const ix = Math.floor(x), iz = Math.floor(z);
    const fx = smooth(x - ix), fz = smooth(z - iz);
    const a = gridHash(ix, iz, this.h), b = gridHash(ix + 1, iz, this.h);
    const c = gridHash(ix, iz + 1, this.h), d = gridHash(ix + 1, iz + 1, this.h);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }
  /** fractal Brownian motion, 回傳約 [0,1] */
  fbm(x, z, octaves = 4, lacunarity = 2, gain = 0.5) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.at(x * freq, z * freq);
      norm += amp;
      amp *= gain; freq *= lacunarity;
    }
    return sum / norm;
  }
}
