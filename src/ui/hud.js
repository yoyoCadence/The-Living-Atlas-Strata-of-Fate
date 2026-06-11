// HUD：通知、命運色帶（定性不定量）、能力列、互動提示、NPC 對話框。

import { bus } from '../core/bus.js';
import { AXIS_LABELS } from '../data/actions.js';
import { ABILITIES } from '../data/abilities.js';
import { createAbilityIconElement } from '../render/utils/canvasTexture.js';

export class HUD {
  constructor(game) {
    this.g = game;
    this.toastZone = document.getElementById('toast-zone');
    this.ribbon = document.getElementById('destiny-ribbon');
    this.abilityBar = document.getElementById('ability-bar');
    this.scanPrompt = document.getElementById('scan-prompt');
    this.dialog = document.getElementById('dialog-box');
    bus.on('toast', ({ text, kind }) => this.toast(text, kind));
    bus.on('destiny-changed', () => this.renderRibbon());
    bus.on('title-earned', () => this.renderRibbon());
    bus.on('ability-unlocked', () => this.renderAbilities());
    bus.on('ability-toggled', () => this.renderAbilities());
    this.dialog.addEventListener('click', () => this.closeDialog());
    this.renderRibbon();
    this.renderAbilities();
  }

  toast(text, kind = '') {
    const div = document.createElement('div');
    div.className = 'toast ' + kind;
    div.textContent = text;
    this.toastZone.append(div);
    setTimeout(() => { div.style.opacity = '0'; div.style.transition = 'opacity .6s'; }, 5200);
    setTimeout(() => div.remove(), 6000);
    while (this.toastZone.children.length > 4) this.toastZone.firstChild.remove();
  }

  /** 命運不以數字呈現：以「傾向詞」描述 */
  renderRibbon() {
    const d = this.g.destiny;
    const t = this.g.myth.title;
    const top = d.topAxes(2).filter(([, v]) => v > 0);
    const word = (v) => v >= 20 ? '深植' : v >= 10 ? '成形' : v >= 4 ? '萌芽' : '微光';
    let html = '<div class="title-line">' + (t.id === 'nameless-walker' ? '無名行者' : t.name) + '</div>';
    if (top.length === 0) html += '<div style="color:#778;">世界仍在觀察你</div>';
    for (const [k, v] of top) html += '<div>' + AXIS_LABELS[k] + '之路 · ' + word(v) + '</div>';
    const eco = d.ecoStability;
    if (eco <= -3) html += '<div style="color:#d88;">大地不安</div>';
    else if (eco >= 3) html += '<div style="color:#8d8;">大地豐饒</div>';
    this.ribbon.innerHTML = html;
  }

  renderAbilities() {
    this.abilityBar.innerHTML = '';
    for (const a of ABILITIES) {
      const unlocked = this.g.abilities.isUnlocked(a.id);
      const div = document.createElement('div');
      div.className = 'ability-slot' + (unlocked ? ' unlocked' : '') +
        (this.g.abilities.isActive(a.id) ? ' active' : '');
      const key = document.createElement('span');
      key.className = 'ability-key';
      key.textContent = a.key;
      const label = document.createElement('span');
      label.className = 'ability-label';
      label.textContent = a.name;
      div.append(key, createAbilityIconElement(a.id), label);
      if (!unlocked) {
        const hint = this.g.abilities.unlockHints().find(h => h.id === a.id);
        div.title = '尚未覺醒：' + (hint?.missing.join('、') ?? '');
        label.textContent = '？？？';
      } else {
        div.title = a.desc;
        div.addEventListener('click', () => this.g.abilities.toggle(a.id));
      }
      this.abilityBar.append(div);
    }
  }

  prompt(text) {
    if (text) {
      this.scanPrompt.textContent = text;
      this.scanPrompt.style.display = 'block';
    } else {
      this.scanPrompt.style.display = 'none';
    }
  }

  showDialog(speaker, line) {
    this.dialog.querySelector('.speaker').textContent = speaker;
    this.dialog.querySelector('.line').textContent = line;
    this.dialog.style.display = 'block';
    this.dialogOpen = true;
  }

  closeDialog() {
    this.dialog.style.display = 'none';
    this.dialogOpen = false;
  }
}
