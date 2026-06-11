// Debug Console（按 ` 開關）：seed 重載、命運軸注入、矛盾觸發、地圖全開等。

import { bus } from '../core/bus.js';
import { CONTRADICTIONS } from '../data/contradictions.js';

export class DebugConsole {
  constructor(game) {
    this.g = game;
    this.el = document.getElementById('debug-console');
    this.logEl = document.getElementById('debug-log');
    this.input = document.getElementById('debug-input');
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Backquote') { this.toggle(); e.preventDefault(); }
    });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.run(this.input.value.trim());
        this.input.value = '';
      }
      if (e.code === 'Backquote' || e.key === 'Escape') {
        this.toggle();
        e.preventDefault();
      }
      e.stopPropagation();
    });
    this.input.addEventListener('keyup', (e) => e.stopPropagation());
  }

  toggle() {
    this.el.classList.toggle('open');
    if (this.el.classList.contains('open')) this.input.focus();
  }

  log(s) {
    this.logEl.textContent += s + '\n';
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  run(cmd) {
    if (!cmd) return;
    this.log('> ' + cmd);
    const [op, ...args] = cmd.split(/\s+/);
    const g = this.g;
    try {
      switch (op) {
        case 'help':
          this.log([
            'seed <字串>      以新 seed 重生世界（保留命運/記憶 → 觀察生成權重差異）',
            'regen            同 seed 重生（驗證可重現性）',
            'destiny <軸> <n> 注入命運值 (explorer/restorer/archivist/seeker/shaper/predator)',
            'eco <n>          調整生態穩定度',
            'unlock <id|all>  解鎖能力',
            'title            顯示目前稱號判定',
            'reveal           地圖全開/關',
            'tp <x> <z>       傳送',
            'contradiction <id|list>  觸發矛盾事件',
            'rumor            立刻產生一則傳聞',
            'hypo             列出推論狀態',
            'weights          顯示目前世界生成權重',
            'save / load / wipe       存檔操作',
            'pos              顯示座標與 biome'
          ].join('\n'));
          break;
        case 'seed': g.restart(args.join(' ') || String(Date.now())); this.log('已用新 seed 重生'); break;
        case 'regen': g.restart(g.world.seed); this.log('同 seed 重生（應與原世界一致）'); break;
        case 'destiny': {
          const axis = args[0], n = Number(args[1] ?? 10);
          if (axis in g.destiny.axes) {
            g.destiny.axes[axis] += n;
            bus.emit('destiny-changed', { axes: { ...g.destiny.axes }, deltas: { [axis]: n }, ecoStability: g.destiny.ecoStability });
            this.log(axis + ' += ' + n + ' → ' + g.destiny.axes[axis]);
          } else this.log('未知軸：' + axis);
          break;
        }
        case 'eco': g.destiny.adjustEco(Number(args[0] ?? -1)); this.log('eco = ' + g.destiny.ecoStability); break;
        case 'unlock':
          if (args[0] === 'all') {
            for (const a of ['wind-sense', 'echo-vision', 'geopulse', 'ecology-hearing', 'time-residue', 'star-navigation', 'myth-sight']) {
              g.abilities.unlocked.add(a); g.abilities.active.add(a);
            }
            bus.emit('ability-unlocked', { ability: { name: '全部' } });
          } else { g.abilities.unlocked.add(args[0]); g.abilities.active.add(args[0]); bus.emit('ability-unlocked', { ability: { name: args[0] } }); }
          this.log('done');
          break;
        case 'title': {
          const t = g.myth.title;
          this.log('稱號：' + t.name + ' | 軸：' + JSON.stringify(g.destiny.axes));
          break;
        }
        case 'reveal':
          g.map.revealAll = !g.map.revealAll;
          this.log('reveal = ' + g.map.revealAll);
          break;
        case 'tp': {
          g.player.pos.x = Number(args[0]); g.player.pos.z = Number(args[1]);
          g.player.pos.y = g.world.heightAt(g.player.pos.x, g.player.pos.z) + 2;
          this.log('tp 完成');
          break;
        }
        case 'contradiction':
          if (args[0] === 'list') this.log(CONTRADICTIONS.map(c => c.id + '  ' + c.name).join('\n'));
          else this.log(g.contradiction.force(args[0]) ? '已觸發' : '找不到（用 contradiction list）');
          break;
        case 'rumor': { const r = g.rumor.generate(); this.log(r.source + '：' + r.text); break; }
        case 'hypo':
          this.log(g.inference.hypotheses.map(h => `[${h.status}] ${h.id} ${h.title}`).join('\n') || '（尚無推論）');
          break;
        case 'weights':
          this.log(JSON.stringify(g.myth.collectGenWeights(g.abilities.genWeights()), null, 1));
          break;
        case 'save': this.log(g.saver.save() ? '已存檔' : '存檔失敗'); break;
        case 'load': location.reload(); break;
        case 'wipe': g.saver.clear(); this.log('存檔已清除，重新整理生效'); break;
        case 'pos':
          this.log(`x=${g.player.pos.x.toFixed(1)} z=${g.player.pos.z.toFixed(1)} biome=${g.world.biomeAt(g.player.pos.x, g.player.pos.z)}`);
          break;
        default: this.log('未知指令，輸入 help');
      }
    } catch (err) { this.log('錯誤：' + err.message); }
  }
}
