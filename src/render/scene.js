import * as THREE from 'three';
import { bus } from '../core/bus.js';
import { BIOMES } from '../data/biomes.js';
import { ART_COLORS, BIOME_RAMPS } from '../assets/palettes.js';
import { applyAssetMetadata } from '../assets/manifest.js';
import {
  applyRendererQuality,
  requestedQualityFromUrl
} from '../assets/qualityProfiles.js';
import { createTerrainToonMaterial } from './materials/animeToon.js';
import { createVegetationAssets } from './factories/vegetationFactory.js';
import { createLandmarkAsset, createVillageHutAsset } from './factories/landmarkFactory.js';
import { createScannableAsset } from './factories/scannableFactory.js';
import { createCreatureAsset } from './factories/creatureFactory.js';
import { createNpcAsset } from './factories/npcFactory.js';
import {
  createEchoVisionAsset,
  createFloatingIslandAsset,
  createFogZoneAsset,
  createMachineBaseAsset,
  createMemoryStormAsset,
  createMythRingAsset,
  createOasisPondAsset,
  createReverseRiverVfx,
  createSilentValeAsset,
  createStarRouteAsset,
  createWaterSurfaceAsset,
  createWindBeamAsset
} from './factories/vfxFactory.js';
import { PerformanceMonitor } from './utils/performanceMonitor.js';
import { collectAssetStats, createArtDebugOverlay } from './utils/debugLabels.js';

export class WorldRenderer {
  constructor(container) {
    this.quality = requestedQualityFromUrl();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = false;
    applyRendererQuality(this.renderer, this.quality);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(ART_COLORS.skyDay);
    this.scene.fog = new THREE.Fog(ART_COLORS.skyDay, 80, 380);

    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 900);

    this.sun = new THREE.DirectionalLight(ART_COLORS.keyLight, 2.2);
    this.sun.position.set(80, 120, 40);
    this.scene.add(this.sun);
    this.scene.add(new THREE.HemisphereLight(0xbcd8ff, 0x47543a, 0.9));

    this.time = 0;
    this.dayPhase = 0.3;
    this.groups = {};
    this.landmarkMeshes = new Map();
    this.scannableMeshes = new Map();
    this.animalMeshes = new Map();
    this.npcMeshes = new Map();
    this.animatedVfx = [];

    this.performance = new PerformanceMonitor({
      profile: this.quality,
      onProfileChange: (profile) => this.setQualityProfile(profile)
    });
    const artDebug = new URLSearchParams(location.search).get('artDebug') === '1';
    this.debugOverlay = createArtDebugOverlay(artDebug);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      applyRendererQuality(this.renderer, this.quality);
    });

    bus.on('render-update', ({ type }) => this.onWorldChange(type));
    bus.on('ability-toggled', () => this.refreshAbilityLayers());
    bus.on('ability-unlocked', () => this.refreshAbilityLayers());
  }

  setQualityProfile(profile) {
    this.quality = profile;
    this.performance.setProfile(profile);
    applyRendererQuality(this.renderer, profile);
  }

  build(world, game) {
    this.world = world;
    this.game = game;
    for (const g of Object.values(this.groups)) this.scene.remove(g);
    this.groups = {};
    this.landmarkMeshes.clear();
    this.scannableMeshes.clear();
    this.animalMeshes.clear();
    this.npcMeshes.clear();
    this.animatedVfx = [];
    this.gateGlow = null;
    this.nodeJet = null;
    this.floatIsland = null;
    this.memorySwirl = null;
    this.oasisPond = null;
    this.prosperityHut = null;

    this.buildTerrain();
    this.buildWater();
    this.buildVegetation();
    this.buildLandmarks();
    this.buildScannables();
    this.buildCreatures();
    this.buildAnomalies();
    this.buildAbilityLayers();
    this.refreshAbilityLayers();
  }

  grp(name) {
    if (!this.groups[name]) {
      this.groups[name] = new THREE.Group();
      this.groups[name].name = name;
      this.scene.add(this.groups[name]);
    }
    return this.groups[name];
  }

  buildTerrain() {
    const w = this.world;
    const geo = new THREE.PlaneGeometry(w.size, w.size, 156, 156);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, w.heightAt(x, z));
    }
    geo.computeVertexNormals();
    this.terrainGeo = geo;
    this.paintTerrain(colors);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mesh = new THREE.Mesh(geo, createTerrainToonMaterial());
    mesh.receiveShadow = true;
    applyAssetMetadata(mesh, 'terrain_system', { category: 'landmark' });
    this.grp('terrain').add(mesh);
  }

  paintTerrain(colors) {
    const w = this.world;
    const pos = this.terrainGeo.attributes.position;
    const c = new THREE.Color();
    const snow = new THREE.Color(0xe8e8f0);
    const sand = new THREE.Color(0xc8b890);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = pos.getY(i);
      const biome = w.biomeAt(x, z);
      const ramp = BIOME_RAMPS[biome];
      if (ramp) c.set(ramp[1]);
      else {
        const b = BIOMES[biome] ?? BIOMES.plains;
        c.setRGB(b.color[0], b.color[1], b.color[2]);
      }
      if (h > 34) c.lerp(snow, Math.min(1, (h - 34) / 16));
      if (h < 0.6) c.lerp(sand, 0.5);
      const dB = Math.hypot(x - w.dryBasin.x, z - w.dryBasin.z);
      if (dB < w.dryBasin.r) c.set(w.dryBasin.restored ? 0x4a9a5a : 0xa08a58);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    if (this.terrainGeo.attributes.color) this.terrainGeo.attributes.color.needsUpdate = true;
  }

  buildWater() {
    const w = this.world;
    const g = this.grp('water');
    const lake = createWaterSurfaceAsset(new THREE.CircleGeometry(w.lake.r + 10, 36), {
      color: 0x3f7fb8,
      opacity: 0.78,
      name: 'lake_surface',
      assetId: 'lake_surface'
    });
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(w.lake.x, w.waterLevel, w.lake.z);
    g.add(lake);

    const pts = w.river.points;
    const verts = [];
    const idx = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[Math.min(i + 1, pts.length - 1)];
      let dx = q.x - p.x;
      let dz = q.z - p.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len * 4.5;
      const nz = dx / len * 4.5;
      const y = w.heightAt(p.x, p.z) + 0.35;
      verts.push(p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz);
      if (i < pts.length - 1) {
        const k = i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    rg.setIndex(idx);
    rg.computeVertexNormals();
    const river = createWaterSurfaceAsset(rg, {
      color: 0x4f93c8,
      opacity: 0.85,
      name: 'river_surface',
      assetId: 'river_surface'
    });
    g.add(river);

    const [s0, s1] = w.river.reverseSegment;
    const reverse = createReverseRiverVfx(pts.slice(s0, s1 + 1), w, { quality: this.quality });
    this.animatedVfx.push(reverse);
    g.add(reverse);
  }

  buildVegetation() {
    const assets = createVegetationAssets(this.world, this.quality);
    this.trunks = assets.trunks;
    this.canopies = assets.canopies;
    this.canopyMat = assets.canopyMat;
    this.treeData = assets.treeData;
    this.grp('veg').add(assets.group);
  }

  applyLogging() {
    if (!this.trunks) return;
    const zero = new THREE.Matrix4().makeScale(0.001, 0.001, 0.001);
    this.treeData.forEach((t, i) => {
      if (t.edge && i % 3 === 0) {
        this.trunks.setMatrixAt(i, zero);
        this.canopies.setMatrixAt(i, zero);
      }
    });
    this.trunks.instanceMatrix.needsUpdate = true;
    this.canopies.instanceMatrix.needsUpdate = true;
  }

  buildLandmarks() {
    const w = this.world;
    const g = this.grp('landmarks');
    for (const lm of w.landmarks) {
      const h = w.heightAt(lm.x, lm.z);
      const group = createLandmarkAsset(lm, { world: w, baseHeight: h, quality: this.quality });
      group.position.set(lm.x, h, lm.z);
      if (group.userData.parts?.gateGlow) this.gateGlow = group.userData.parts.gateGlow;
      if (group.userData.parts?.nodeJet) this.nodeJet = group.userData.parts.nodeJet;
      this.landmarkMeshes.set(lm.id, group);
      g.add(group);
    }
  }

  buildScannables() {
    const g = this.grp('scannables');
    for (const s of this.world.scannables) this.addScannableMesh(s, g);
  }

  addScannableMesh(s, g = this.grp('scannables')) {
    const asset = createScannableAsset(s, { world: this.world, quality: this.quality });
    asset.userData.baseY = asset.position.y;
    this.scannableMeshes.set(s.id, asset);
    g.add(asset);
  }

  buildCreatures() {
    const w = this.world;
    const g = this.grp('creatures');
    for (const a of w.animals) {
      const asset = createCreatureAsset(a, { quality: this.quality });
      asset.position.set(a.x, w.heightAt(a.x, a.z), a.z);
      this.animalMeshes.set(a.id, asset);
      g.add(asset);
    }
    for (const npc of w.npcs) {
      const asset = createNpcAsset(npc, { quality: this.quality });
      asset.position.set(npc.x, w.heightAt(npc.x, npc.z), npc.z);
      this.npcMeshes.set(npc.id, asset);
      g.add(asset);
    }
  }

  buildAnomalies() {
    const w = this.world;
    const g = this.grp('anomalies');
    for (const a of w.anomalies) {
      if (a.kind === 'float-island') {
        const island = createFloatingIslandAsset(a, w, { quality: this.quality });
        this.floatIsland = island;
        this.animatedVfx.push(island);
        g.add(island);
        g.add(createMachineBaseAsset(a, w));
      } else if (a.kind === 'fog-zone') {
        const fog = createFogZoneAsset(a, w, { quality: this.quality });
        this.animatedVfx.push(fog);
        g.add(fog);
      } else if (a.kind === 'silent-zone') {
        g.add(createSilentValeAsset(a, w));
      } else if (a.kind === 'memory-storm') {
        const storm = createMemoryStormAsset(a, w, { quality: this.quality });
        this.memorySwirl = storm.userData.parts?.swirl ?? storm;
        this.animatedVfx.push(storm);
        g.add(storm);
      }
    }
  }

  buildAbilityLayers() {
    const w = this.world;
    const windGrp = this.grp('layer-wind');
    for (const s of w.scannables.filter((x) => x.kind === 'wind-node')) windGrp.add(createWindBeamAsset(s, w));

    const echoGrp = this.grp('layer-echo');
    const hollow = w.landmarks.find((l) => l.id === 'hollow-site');
    if (hollow) echoGrp.add(createEchoVisionAsset(hollow, w));

    const starGrp = this.grp('layer-star');
    const route = [
      w.landmarks.find((l) => l.id === 'stone-circle'),
      w.landmarks.find((l) => l.id === 'ancient-gate'),
      w.landmarks.find((l) => l.id === 'observatory')
    ].filter(Boolean);
    if (route.length > 1) starGrp.add(createStarRouteAsset(route, w));

    const mythGrp = this.grp('layer-myth');
    for (const [x, z] of [[w.dryBasin.x, w.dryBasin.z], [w.village.x, w.village.z], [-150, -70]]) {
      mythGrp.add(createMythRingAsset(x, z, w));
    }
  }

  refreshAbilityLayers() {
    const ab = this.game?.abilities;
    if (!ab) return;
    this.grp('layer-wind').visible = ab.isActive('wind-sense');
    this.grp('layer-echo').visible = ab.isActive('echo-vision');
    this.grp('layer-star').visible = ab.isActive('star-navigation') && this.isNight();
    this.grp('layer-myth').visible = ab.isActive('myth-sight');
  }

  isNight() {
    return this.dayPhase > 0.5;
  }

  onWorldChange(type) {
    const w = this.world;
    switch (type) {
      case 'oasis-bloom': {
        this.paintTerrain(this.terrainGeo.attributes.color.array);
        this.oasisPond = createOasisPondAsset(w);
        this.grp('water').add(this.oasisPond);
        if (this.nodeJet) this.nodeJet.material.opacity = 0.7;
        for (const s of w.scannables.filter((x) => x.kind === 'oasis-flora')) {
          if (!this.scannableMeshes.has(s.id)) this.addScannableMesh(s);
        }
        const vg = this.landmarkMeshes.get('village');
        const village = w.landmarks.find((l) => l.id === 'village');
        if (vg && village && !this.prosperityHut) {
          const hut = createVillageHutAsset({ bodyColor: 0xc8a878 });
          const hx = village.x + 10;
          const hz = village.z + 8;
          hut.position.set(10, w.heightAt(hx, hz) - w.heightAt(village.x, village.z), 8);
          hut.rotation.y = -0.3;
          vg.add(hut);
          this.prosperityHut = hut;
        }
        break;
      }
      case 'gate-opened':
        if (this.gateGlow) this.gateGlow.material.opacity = 0.55;
        break;
      case 'forest-logging':
        this.applyLogging();
        break;
      case 'silent-forest':
        if (this.canopyMat) this.canopyMat.emissiveIntensity = 0.15;
        break;
      case 'stalker-spawn': {
        const a = this.world.animals.find((x) => x.id === 'stalker');
        if (a && !this.animalMeshes.has('stalker')) {
          const asset = createCreatureAsset(a, { quality: this.quality });
          asset.position.set(a.x, this.world.heightAt(a.x, a.z), a.z);
          this.animalMeshes.set('stalker', asset);
          this.grp('creatures').add(asset);
        }
        break;
      }
      case 'island-stabilized':
      default:
        break;
    }
  }

  markScanned(id) {
    const object = this.scannableMeshes.get(id);
    if (!object) return;
    object.scale.setScalar(0.62);
    object.traverse((child) => {
      if (!child.material || child.userData?.isToonOutline) return;
      child.material.transparent = true;
      child.material.opacity = Math.min(child.material.opacity ?? 1, 0.28);
    });
  }

  removeAnimal(id) {
    const object = this.animalMeshes.get(id);
    if (object) object.visible = false;
  }

  update(dt, playerPos) {
    this.time += dt;
    this.dayPhase = (this.time / 240) % 1;
    const night = Math.max(0, Math.sin(this.dayPhase * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
    const skyDay = new THREE.Color(ART_COLORS.skyDay);
    const skyNight = new THREE.Color(ART_COLORS.skyNight);
    const sky = skyDay.clone().lerp(skyNight, night);
    this.scene.background = sky;
    this.scene.fog.color = sky;
    this.sun.intensity = 2.2 * (1 - night * 0.85);
    if (this.canopyMat && !this.world.ecoRegions['glow-forest'].silent) {
      this.canopyMat.emissiveIntensity = 0.3 + night * 0.9;
    }

    for (const [id, object] of this.scannableMeshes) {
      const s = this.world.scannables.find((x) => x.id === id);
      if (s && !s.scanned) {
        object.rotation.y += dt;
        object.position.y = object.userData.baseY + Math.sin(this.time * 2 + object.position.x) * 0.12;
        if (object.userData.parts?.scanRing) object.userData.parts.scanRing.rotation.z -= dt * 0.8;
      }
    }

    for (const object of this.animatedVfx) {
      if (object.userData.animate === 'floatIsland') {
        const a = object.userData.anomaly;
        object.position.y = object.userData.baseY + Math.sin(this.time * (Math.PI * 2 / a.period)) * a.bobAmp;
      } else if (object.userData.animate === 'memoryStorm') {
        object.rotation.y += dt * 0.12;
        object.userData.parts?.swirl?.rotateZ(dt * 0.55);
      } else if (object.userData.animate === 'reverseRiver') {
        object.children.forEach((child, i) => {
          if (child.isMesh) child.scale.setScalar(0.85 + Math.sin(this.time * 2 + i) * 0.12);
        });
      } else if (object.userData.animate === 'fog') {
        object.rotation.y += dt * 0.02;
      }
    }

    for (const a of this.world.animals) {
      const object = this.animalMeshes.get(a.id);
      if (!object) continue;
      if (!a.alive) {
        object.visible = false;
        continue;
      }
      if (a.appearCondition && !a.appearCondition({ ecoStability: this.game.destiny.ecoStability })) {
        object.visible = false;
        continue;
      }
      object.visible = true;
      if (a.stalking && playerPos) {
        const dx = a.x - playerPos.x;
        const dz = a.z - playerPos.z;
        const d = Math.hypot(dx, dz) || 1;
        if (d > 38) {
          a.x -= (dx / d) * dt * 6;
          a.z -= (dz / d) * dt * 6;
        } else if (d < 22) {
          a.x += (dx / d) * dt * 8;
          a.z += (dz / d) * dt * 8;
        }
      } else if (a.fleeing && playerPos) {
        const dx = a.x - playerPos.x;
        const dz = a.z - playerPos.z;
        const d = Math.hypot(dx, dz) || 1;
        if (d < 50) {
          a.x += (dx / d) * dt * 7;
          a.z += (dz / d) * dt * 7;
        }
      } else {
        a.x = a.homeX + Math.sin(this.time * 0.3 + a.homeZ) * 6;
        a.z = a.homeZ + Math.cos(this.time * 0.22 + a.homeX) * 6;
      }
      object.position.set(a.x, this.world.heightAt(a.x, a.z), a.z);
      object.rotation.y = Math.atan2(a.homeX - a.x, a.homeZ - a.z);
      object.scale.y = 1 + Math.sin(this.time * 2 + a.homeX) * 0.025;
    }

    for (const [id, object] of this.npcMeshes) {
      object.rotation.y = Math.sin(this.time * 0.7 + id.length) * 0.18;
    }

    this.grp('layer-star').visible = this.game?.abilities.isActive('star-navigation') && this.isNight();

    const perf = this.performance.update(dt, this.renderer);
    this.renderer.render(this.scene, this.camera);
    if (this.debugOverlay.enabled) this.debugOverlay.update(dt, perf, collectAssetStats(this.scene));
  }
}
