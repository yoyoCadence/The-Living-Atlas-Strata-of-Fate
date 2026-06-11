// 玩家控制：第三人稱跟隨相機、地形行走、跳躍、（風息感知解鎖後）滑翔。
// 桌面：WASD + 滑鼠拖曳視角；手機：左搖桿移動 + 右半屏拖曳視角 + 按鈕。

import { bus } from '../core/bus.js';
import { createPlayerCartographerAsset } from '../render/factories/playerFactory.js';

export class PlayerController {
  constructor(world, camera, abilities) {
    this.world = world;
    this.camera = camera;
    this.abilities = abilities;
    this.pos = { x: -40, y: 0, z: 40 };
    this.pos.y = world.heightAt(this.pos.x, this.pos.z) + 1;
    this.vel = { y: 0 };
    this.yaw = 0.6;
    this.pitch = 0.35;
    this.speed = 14;
    this.onGround = true;
    this.gliding = false;
    this.keys = {};
    this.joy = { x: 0, y: 0 };
    this.jumpQueued = false;

    // 玩家外型：簡單披風人
    this.mesh = createPlayerCartographerAsset();
    this.cape = this.mesh.userData.parts.cape;

    this.bindInput();
  }

  setWorld(world) { this.world = world; }

  bindInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') { this.jumpQueued = true; e.preventDefault(); }
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    // 滑鼠視角：FPS 式 pointer lock——點擊畫面鎖定，滑鼠移動即轉視角，Esc 解鎖。
    // 未鎖定時保留拖曳視角作為後備（觸控裝置不啟用鎖定）。
    let dragging = false, lx = 0, ly = 0;
    const canvas = document.querySelector('#app canvas');
    const isTouch = 'ontouchstart' in window;
    if (canvas && !isTouch) {
      canvas.addEventListener('click', () => {
        if (document.pointerLockElement !== canvas) {
          try { canvas.requestPointerLock(); } catch { /* 部分環境不支援 */ }
        }
      });
    }
    canvas?.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== canvas) { dragging = true; lx = e.clientX; ly = e.clientY; }
    });
    window.addEventListener('mousemove', (e) => {
      if (canvas && document.pointerLockElement === canvas) {
        this.yaw -= e.movementX * 0.0026;
        this.pitch = Math.max(-0.3, Math.min(1.2, this.pitch + e.movementY * 0.002));
      } else if (dragging) {
        this.yaw -= (e.clientX - lx) * 0.005;
        this.pitch = Math.max(-0.3, Math.min(1.2, this.pitch + (e.clientY - ly) * 0.004));
        lx = e.clientX; ly = e.clientY;
      }
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    // 觸控：左半=搖桿(由 mobile ui 處理)，右半=視角
    let touchId = null;
    window.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX > window.innerWidth / 2 && touchId === null) {
          touchId = t.identifier; lx = t.clientX; ly = t.clientY;
        }
      }
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) {
          this.yaw -= (t.clientX - lx) * 0.006;
          this.pitch = Math.max(-0.3, Math.min(1.2, this.pitch + (t.clientY - ly) * 0.005));
          lx = t.clientX; ly = t.clientY;
        }
      }
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) if (t.identifier === touchId) touchId = null;
    });

    // 手機搖桿
    const joyEl = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    if (joyEl) {
      let jid = null;
      const center = () => {
        const r = joyEl.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };
      joyEl.addEventListener('touchstart', (e) => { jid = e.changedTouches[0].identifier; }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        for (const t of e.changedTouches) {
          if (t.identifier !== jid) continue;
          const c = center();
          let dx = (t.clientX - c.x) / 50, dy = (t.clientY - c.y) / 50;
          const len = Math.hypot(dx, dy);
          if (len > 1) { dx /= len; dy /= len; }
          this.joy.x = dx; this.joy.y = dy;
          knob.style.transform = `translate(${dx * 32}px, ${dy * 32}px)`;
        }
      }, { passive: true });
      window.addEventListener('touchend', (e) => {
        for (const t of e.changedTouches) {
          if (t.identifier === jid) {
            jid = null; this.joy.x = 0; this.joy.y = 0;
            knob.style.transform = '';
          }
        }
      });
    }
    document.getElementById('btn-jump')?.addEventListener('touchstart', () => { this.jumpQueued = true; });
  }

  update(dt, uiBlocked) {
    if (uiBlocked) return;
    // 移動向量（相機座標系）
    let mx = this.joy.x, mz = this.joy.y;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) mz -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) mz += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }
    // 相機前方 = (-sin(yaw), -cos(yaw))，右方 = (cos(yaw), -sin(yaw))；
    // W(mz=-1) 必須走向相機前方，視角轉到哪、前進就朝哪
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const wx = mx * cos + mz * sin;
    const wz = -mx * sin + mz * cos;
    const sprint = this.keys['ShiftLeft'] ? 1.7 : 1;
    this.pos.x += wx * this.speed * sprint * dt;
    this.pos.z += wz * this.speed * sprint * dt;
    // 世界邊界
    const half = this.world.size / 2 - 4;
    this.pos.x = Math.max(-half, Math.min(half, this.pos.x));
    this.pos.z = Math.max(-half, Math.min(half, this.pos.z));

    // 垂直運動
    const ground = this.world.heightAt(this.pos.x, this.pos.z) + 1;
    if (this.jumpQueued && this.onGround) {
      this.vel.y = 10; this.onGround = false;
    }
    this.jumpQueued = false;
    const holdJump = this.keys['Space'];
    const canGlide = this.abilities.isUnlocked('wind-sense');
    this.gliding = canGlide && !this.onGround && this.vel.y < 0 && holdJump;
    this.vel.y -= (this.gliding ? 4 : 26) * dt;
    if (this.gliding) {
      this.vel.y = Math.max(this.vel.y, -2.5);
      // 滑翔時前進加速
      this.pos.x += -sin * 10 * dt;
      this.pos.z += -cos * 10 * dt;
      if (!this._glideEmitted) { bus.emit('action', { id: 'glide' }); this._glideEmitted = true; }
    }
    this.pos.y += this.vel.y * dt;
    if (this.pos.y <= ground) {
      this.pos.y = ground;
      this.vel.y = 0;
      this.onGround = true;
      this._glideEmitted = false;
    } else {
      this.onGround = false;
    }

    // 外型與披風
    this.mesh.position.set(this.pos.x, this.pos.y - 1, this.pos.z);
    if (len > 0.1) this.mesh.rotation.y = Math.atan2(wx, wz);
    this.cape.rotation.x = this.gliding ? 1.2 : 0.15;

    // 第三人稱相機
    const camDist = 11, camH = 4 + this.pitch * 6;
    this.camera.position.set(
      this.pos.x + Math.sin(this.yaw) * camDist,
      this.pos.y + camH,
      this.pos.z + Math.cos(this.yaw) * camDist
    );
    // 相機不穿地
    const camGround = this.world.heightAt(this.camera.position.x, this.camera.position.z) + 1.5;
    if (this.camera.position.y < camGround) this.camera.position.y = camGround;
    this.camera.lookAt(this.pos.x, this.pos.y + 1.5, this.pos.z);
  }
}
