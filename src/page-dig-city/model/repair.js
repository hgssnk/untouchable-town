// ===== Model：修理（ネジ・ベルト・配線・針。好きな順で4つ） =====
window.Repair = (function(){
const TASKS = ['screw', 'belt', 'wire', 'needle'];
const BELT_SEQ = ['up', 'right', 'down', 'left'];   // ベルトを回しかける順番
const SCREWS = 4, BELT_STEPS = 8, WIRES = 3;
const SCREW_FRAMES = 50;

function shuffle(rng, n){
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// 操作は、起きたことを表す文字列（'screwDone' など）を返す。何も起きなければ null
function createRepair(rng){
  const R = {
    sel: 0, task: null, flash: 0,
    done: { screw: false, belt: false, wire: false, needle: false },
    screw: { n: 0, p: 0 },
    belt: { phase: 0, seq: 0 },                       // phase 0=古いベルト 1=新しいベルトをかける
    wire: { k: 0, cursor: 0, order: shuffle(rng, WIRES) },   // order[j]=右のj番目の端子につなぐ線
    needle: { phase: 0, t: 0 },                       // phase 0=古い針 1=新しい針をさす
  };

  function finish(task){ R.done[task] = true; R.task = null; }
  R.allDone = () => TASKS.every(t => R.done[t]);

  R.press = function(){
    if (!R.task){
      const t = TASKS[R.sel];
      if (!R.done[t]) R.task = t;
      return null;
    }
    if (R.task === 'belt' && R.belt.phase === 0){ R.belt.phase = 1; return 'beltOff'; }
    if (R.task === 'wire'){
      const w = R.wire;
      if (w.order[w.cursor] === w.k){ w.k++; if (w.k >= WIRES){ finish('wire'); return 'wireDone'; } }
      else R.flash = 8;
      return null;
    }
    if (R.task === 'needle'){
      const n = R.needle;
      if (n.phase === 0){ n.phase = 1; return 'needleOff'; }
      if (Math.abs(Math.sin(n.t * 0.09)) < 0.18){ finish('needle'); return 'needleDone'; }   // まっすぐのとき
      R.flash = 8;
    }
    return null;
  };

  R.dir = function(d){
    if (!R.task){
      const n = TASKS.length, step = (d === 'down' || d === 'right') ? 1 : (d === 'up' || d === 'left') ? -1 : 0;
      R.sel = (R.sel + step + n) % n;
      return null;
    }
    if (R.task === 'belt' && R.belt.phase === 1){
      if (d === BELT_SEQ[R.belt.seq % 4] && ++R.belt.seq >= BELT_STEPS){ finish('belt'); return 'beltDone'; }
    } else if (R.task === 'wire'){
      const w = R.wire;
      if (d === 'up') w.cursor = (w.cursor + WIRES - 1) % WIRES;
      if (d === 'down') w.cursor = (w.cursor + 1) % WIRES;
    }
    return null;
  };

  R.back = function(){ R.task = null; };

  R.update = function(held){
    if (R.flash > 0) R.flash--;
    if (R.task === 'needle') R.needle.t++;
    if (R.task === 'screw'){
      const s = R.screw;
      if (held.has('btnA')){
        s.p += 1 / SCREW_FRAMES;
        if (s.p >= 1){ s.p = 0; if (++s.n >= SCREWS){ finish('screw'); return 'screwDone'; } }
      } else s.p = Math.max(0, s.p - 0.03);
    }
    return null;
  };

  return R;
}

return { createRepair, TASKS, BELT_SEQ, SCREWS, BELT_STEPS, WIRES };
})();
