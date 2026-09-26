// ===== Model：ゲームの進行エンジン（モード・会話・場面転換）。章の中身は model/ch*.js =====
window.Game = (function(){
const { createWalker } = window.Walk;
const { createDig } = window.Dig;
const { createWipe } = window.Wipe;
const { createRepair } = window.Repair;
const { createArm } = window.Arm;
const { createChop } = window.Chop;
const { createBand } = window.Band;

const FADE = 12;
const nl = s => s.replace(/\//g, '\n');

// 会話の1画面。'店主：こんにちは' → {who, t}。{choice:[..]} は選択肢、{t, cue} は音の合図つき
function parse(p){
  if (typeof p !== 'string'){
    if (p.choice) return p;
    return Object.assign({}, p, parse(p.t));      // {t, cue, shop} も、話す人を読む
  }
  const m = p.match(/^([^：/]{1,4})：([\s\S]*)$/);
  return m ? { who: m[1], t: nl(m[2]) } : { t: nl(p) };
}

// mode: title / still / walk / dig / wipe / repair / arm / chop / band / cover / end
function create(chapters, rng, startIdx){
  const first = startIdx || 0;
  const G = {
    ch: chapters[first], idx: first, rng: rng || Math.random,
    mode: 'title', tick: 0, flags: {}, memory: {}, note: null, mapId: null, onCue: null, onSave: null, menu: null, hud: null, lastChoice: 0,
    auto: null, credits: null, outro: null, canWatch: false, titleSel: 0,
    walker: createWalker(), talk: null, fade: null,
    dig: null, wipe: null, repair: null, arm: null, chop: null, band: null,
    chapters,
  };
  const hook = (name, ...args) => { if (G.ch[name]) G.ch[name](G, ...args); };

  G.save = key => { if (key === 'watch') G.canWatch = true; if (G.onSave) G.onSave(key); };
  G.cue = name => { if (G.onCue) G.onCue(name); };

  // ---- 会話 ----
  function enter(i){
    const t = G.talk, p = t.pages[i];
    t.i = i;
    if (p.choice) t.choice = { opts: p.choice, sel: 0 };
    else { t.cur = p; t.shown = 0; t.choice = null; if (p.cue) G.cue(p.cue); }
  }
  function advance(){
    const t = G.talk;
    if (t.i + 1 >= t.pages.length){ G.talk = null; if (t.done) t.done(); }
    else enter(t.i + 1);
  }
  G.say = function(pages, done){
    G.talk = { pages: pages.map(parse), i: 0, cur: { t: '' }, shown: 0, choice: null, done };
    enter(0);
  };

  // ---- 場面転換 ----
  G.transition = function(fn, after){
    if (G.fade) return;
    G.fade = { dir: 'out', t: 0, fn, after };
  };
  G.fadeLevel = () => G.fade ? Math.ceil(G.fade.t / 3) : 0;   // 0..4

  G.enterMap = function(id, x, y, face){
    G.mode = 'walk'; G.mapId = id; G.note = null;
    G.walker.enter(G.ch.maps[id], x, y, face);
  };
  G.startDig = function(){ G.mode = 'dig'; G.dig = createDig(G.rng, 30); };
  G.startWipe = function(){ G.mode = 'wipe'; G.wipe = createWipe(); };
  G.startRepair = function(){ G.mode = 'repair'; G.repair = createRepair(G.rng); };
  G.startArm = function(){ G.mode = 'arm'; G.arm = createArm(); };
  G.startChop = function(){ G.mode = 'chop'; G.chop = createChop(); };
  G.startBand = function(len, rainAt){ G.mode = 'band'; G.band = createBand(len, rainAt); };
  G.startCover = function(){ G.mode = 'cover'; G.wipe = createWipe(); G.wipe.active = true; };
  G.addObject = o => G.walker.addObject(o);
  G.removeObject = id => G.walker.removeObject(id);
  G.toTitle = function(){ G.idx = first; G.ch = chapters[first]; G.mode = 'title'; G.titleSel = 0; G.auto = null; G.credits = null; G.outro = null; G.cue('stopAll'); };
  G.finish = function(){ G.mode = 'end'; G.cue('stopAll'); };

  G.start = function(){ G.flags = {}; G.note = null; G.hud = null; G.auto = null; G.credits = null; G.outro = null; hook('start'); };

  // ---- STARTボタン：ヒント／章えらび（クリアしていなくても、どの章からでも始められる） ----
  const TOP = ['ヒント', '章えらび'];
  G.toggleMenu = function(){
    if (G.menu){ G.menu = null; return; }
    if (G.fade) return;
    G.menu = G.mode === 'title' ? { page: 'chapters', sel: G.idx } : { page: 'top', sel: 0 };
  };
  G.menuItems = () => G.menu.page === 'top' ? TOP : chapters.map(c => c.title);

  // 同じ場面で押すたびに、ヒントが具体的になる（章が返す配列の、上から順）
  const hintCount = {};
  function hint(){
    if (G.talk) return;
    const levels = G.ch.hint ? G.ch.hint(G) : null;
    if (!levels || !levels.length) return G.say(['……今は、/ヒントはない。']);
    const key = G.idx + ':' + G.mode + ':' + (G.mapId || '') + ':' + (levels.key || '');
    const n = hintCount[key] || 0;
    hintCount[key] = n + 1;
    G.say(levels[Math.min(n, levels.length - 1)]);
  }
  function jump(){
    G.idx = G.menu.sel; G.ch = chapters[G.idx];
    G.menu = null; G.talk = null; G.fade = null; G.note = null; G.hud = null; G.auto = null; G.credits = null; G.outro = null;
    G.cue('stopAll');
    for (const k in hintCount) delete hintCount[k];
    G.start();
  }
  function menuPress(){
    const m = G.menu;
    if (m.page === 'chapters') return jump();
    if (m.sel === 0){ G.menu = null; hint(); }
    else G.menu = { page: 'chapters', sel: G.idx };
  }

  // 章の「おわり」のあと：次の章へ。最後の章ならタイトルへ
  function afterEnd(){
    if (G.idx + 1 < chapters.length){ G.idx++; G.ch = chapters[G.idx]; G.start(); }
    else G.toTitle();
  }

  // ---- 入力 ----
  G.press = function(){                 // Aボタン
    if (G.menu) return menuPress();
    if (G.fade) return;
    if (G.mode === 'title'){
      if (G.titleSel === 1 && G.canWatch){        // 「眺める」：最後の章の街を、見ているだけ
        G.idx = chapters.length - 1; G.ch = chapters[G.idx];
        G.flags = {}; G.note = null; G.hud = null; G.auto = null; G.credits = null; G.outro = null;
        return hook('startWatch');
      }
      return G.start();
    }
    const t = G.talk;
    if (t){
      if (t.choice){ G.lastChoice = t.choice.sel; return advance(); }
      if (t.shown < t.cur.t.length){ t.shown = t.cur.t.length; return; }
      return advance();
    }
    if (G.mode === 'walk'){ const o = G.walker.facing(); if (o) hook('interact', o); }
    else if (G.mode === 'dig') hook('onPick', G.dig.pick());
    else if (G.mode === 'repair'){ const ev = G.repair.press(); if (ev) hook('onRepair', ev); }
    else if (G.mode === 'arm') hook('onArm', G.arm.press());
    else if (G.mode === 'chop') hook('onChop', G.chop.press());
    else if (G.mode === 'band') hook('onBand', G.band.sel);
    else if (G.mode === 'end') afterEnd();
  };

  G.back = function(){                  // Bボタン
    if (G.menu){ G.menu = G.menu.page === 'chapters' && G.mode !== 'title' ? { page: 'top', sel: 1 } : null; return; }
    if (G.fade || G.talk) return;
    if (G.mode === 'dig') hook('onDigLeave');
    else if (G.mode === 'repair') G.repair.back();
    else if (G.mode === 'end') afterEnd();
  };

  G.dir = function(d){                  // 方向キーを押した瞬間
    if (G.menu){
      if (d === 'up' || d === 'down'){
        const n = G.menuItems().length;
        G.menu.sel = (G.menu.sel + (d === 'down' ? 1 : n - 1)) % n;
      }
      return;
    }
    if (G.mode === 'title'){ if (G.canWatch && (d === 'up' || d === 'down')) G.titleSel ^= 1; return; }
    if (G.fade) return;
    const t = G.talk;
    if (t){
      if (t.choice && (d === 'up' || d === 'down')){
        const n = t.choice.opts.length;
        t.choice.sel = (t.choice.sel + (d === 'down' ? 1 : n - 1)) % n;
      }
      return;
    }
    if (G.mode === 'dig' && (d === 'left' || d === 'right')){
      if (G.dig.move(d === 'left' ? -1 : 1)) hook('onNotice');
    } else if (G.mode === 'repair'){
      const ev = G.repair.dir(d);
      if (ev) hook('onRepair', ev);
    } else if (G.mode === 'band' && (d === 'up' || d === 'down')){
      const n = G.band.options.length;
      G.band.sel = (G.band.sel + (d === 'down' ? 1 : n - 1)) % n;
    }
  };

  // ---- 1フレーム進める。held は押されている方向キー（とA）の集合 ----
  G.update = function(held){
    G.tick++;
    if (G.outro) G.outro.t++;
    if (G.menu) return;
    const f = G.fade;
    if (f){
      if (f.dir === 'out'){ if (++f.t >= FADE){ if (f.fn) f.fn(); f.dir = 'in'; } }
      else if (--f.t <= 0){ G.fade = null; if (f.after) f.after(); }
      return;
    }
    const t = G.talk;
    if (t){
      if (!t.choice && G.tick % 3 === 0 && t.shown < t.cur.t.length) t.shown++;
      return;
    }
    if (G.mode === 'walk'){
      const id = G.walker.update(G.auto || held);
      if (id) hook('onStep', id);
      if (!G.talk && !G.fade) hook('onTick');
    } else if (G.mode === 'wipe' || G.mode === 'cover'){
      G.wipe.update(held);
      if (G.wipe.done && !G.wipe.fired){ G.wipe.fired = true; hook(G.mode === 'wipe' ? 'onWipeDone' : 'onCoverDone'); }
    } else if (G.mode === 'chop'){
      G.chop.update();
    } else if (G.mode === 'band'){
      const ev = G.band.update();
      if (ev) hook('onBandEvent', ev);
    } else if (G.mode === 'repair'){
      const ev = G.repair.update(held);
      if (ev) hook('onRepair', ev);
    } else if (G.mode === 'arm'){
      G.arm.update(held);
    }
  };

  return G;
}

return { create };
})();
