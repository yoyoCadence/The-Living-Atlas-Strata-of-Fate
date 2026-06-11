import { nextLowerQuality } from '../../assets/qualityProfiles.js';

export class PerformanceMonitor {
  constructor({ profile, onProfileChange } = {}) {
    this.profile = profile;
    this.onProfileChange = onProfileChange;
    this.frameMs = 16.7;
    this.fps = 60;
    this.samplesOverBudget = 0;
    this.cooldown = 0;
    this.stats = {
      fps: 60,
      frameMs: 16.7,
      drawCalls: 0,
      triangles: 0,
      profileId: profile?.id ?? 'high',
      downgraded: false
    };
  }

  setProfile(profile) {
    this.profile = profile;
    this.stats.profileId = profile.id;
    this.samplesOverBudget = 0;
    this.cooldown = 8;
  }

  update(dt, renderer) {
    const ms = Math.max(0.1, dt * 1000);
    this.frameMs = this.frameMs * 0.94 + ms * 0.06;
    this.fps = 1000 / this.frameMs;
    this.cooldown = Math.max(0, this.cooldown - dt);
    const info = renderer.info?.render ?? {};
    this.stats = {
      fps: this.fps,
      frameMs: this.frameMs,
      drawCalls: info.calls ?? 0,
      triangles: info.triangles ?? 0,
      profileId: this.profile?.id ?? 'high',
      downgraded: this.stats.downgraded
    };

    if (!this.profile || this.cooldown > 0) return this.stats;
    const overBudget = this.frameMs > this.profile.downgradeFrameMs ||
      this.stats.drawCalls > this.profile.drawCallHardCap ||
      this.stats.triangles > this.profile.triangleHardCap;
    this.samplesOverBudget = overBudget ? this.samplesOverBudget + 1 : Math.max(0, this.samplesOverBudget - 2);
    if (this.samplesOverBudget > 120) {
      const lower = nextLowerQuality(this.profile.id);
      if (lower) {
        this.stats.downgraded = true;
        this.onProfileChange?.(lower);
      }
      this.samplesOverBudget = 0;
    }
    return this.stats;
  }
}
