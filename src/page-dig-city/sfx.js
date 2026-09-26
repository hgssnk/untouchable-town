// ===== 音：Web Audioで作る効果音とドラム（外部ライブラリなし）。ゲームからは合図の名前で呼ばれる =====
window.Sfx = (function(){
let ac = null, master = null;
let bed = null, rainBed = null, crowdBed = null, drumTimer = null, timeouts = [], intervals = [];
let bpm = 68, kicks = [0, 7, 10], snares = [4, 12], bassOn = false;
const BASS = { 0: 41, 3: 41, 6: 49, 10: 55, 13: 49 };   // ステップ → 周波数(Hz)

function ctx(){
  if (ac) return ac;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ac = new AC();
  master = ac.createGain(); master.gain.value = 0.6; master.connect(ac.destination);
  return ac;
}
function resume(){ const a = ctx(); if (a && a.state === 'suspended') a.resume(); }

// レコードのパチパチ：まばらなクリックと、かすかなヒス
function startBed(){
  const a = ctx(); if (!a || bed) return;
  const len = a.sampleRate * 2, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() < 0.0006 ? (Math.random()*2 - 1) : 0) + (Math.random()*2 - 1) * 0.012;
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
  const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  const gain = a.createGain(); gain.gain.value = 0.9;
  src.connect(hp); hp.connect(gain); gain.connect(master); src.start();
  bed = { src, gain };
}
function stopBed(){
  if (!bed) return;
  const { src, gain } = bed; bed = null;
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.3);
  src.stop(ac.currentTime + 0.35);
}

function noiseBurst(t, dur, freq, vol){
  const a = ac, len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random()*2 - 1) * (1 - i/len);
  const src = a.createBufferSource(); src.buffer = buf;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq;
  const g = a.createGain(); g.gain.value = vol;
  src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
}
function kick(t){
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
  g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.32);
}
function snare(t){                       // 乾いたスネア
  noiseBurst(t, 0.13, 1900, 0.55);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle'; o.frequency.value = 190;
  g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.1);
}

// ドラム（8分音符16ステップ）。テンポ・パターン・ベースは、途中で変えられる
function bass(t, f){
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.42);
}
function startDrums(){
  const a = ctx(); if (!a || drumTimer) return;
  let step = 0, next = a.currentTime + 0.1;
  drumTimer = setInterval(()=>{
    while (next < a.currentTime + 0.15){
      const s = step % 16;
      if (kicks.includes(s)) kick(next);
      if (snares.includes(s)) snare(next);
      if (bassOn && BASS[s]) bass(next, BASS[s]);
      next += 60 / bpm / 2; step++;
    }
  }, 30);
}
function stopDrums(){ if (drumTimer){ clearInterval(drumTimer); drumTimer = null; } }

// 誰かの声：母音のようなフォルマントを2つ重ねた、短い一言（仮の音）
function voice(){
  const a = ctx(); if (!a) return;
  const syl = (t, f0, f1, f2, dur)=>{
    const o = a.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * 0.9, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.05); g.gain.linearRampToValueAtTime(0, t + dur);
    [[f1, 1], [f2, 0.6]].forEach(([f, v])=>{
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 6;
      const vg = a.createGain(); vg.gain.value = v;
      o.connect(bp); bp.connect(vg); vg.connect(g);
    });
    g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  };
  const t = a.currentTime + 0.05;
  syl(t, 150, 730, 1090, 0.35);           // 「あ」
  syl(t + 0.4, 140, 300, 2300, 0.45);     // 「い」
}

// スクラッチ：ノイズの帯域を行ったり来たり
function scratch(){
  const a = ctx(); if (!a) return;
  const t = a.currentTime + 0.05, len = Math.floor(a.sampleRate * 0.9), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(); src.buffer = buf;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4;
  [0, .12, .24, .36, .5, .62].forEach((dt, i) => bp.frequency.linearRampToValueAtTime(i % 2 ? 700 : 3200, t + dt));
  bp.frequency.setValueAtTime(1500, t);
  const g = a.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.linearRampToValueAtTime(0, t + 0.9);
  src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
}

// 電車：低い唸りと、レールの継ぎ目（ガタン、ゴトン）
function train(){
  const a = ctx(); if (!a) return;
  const t = a.currentTime + 0.05;
  const o = a.createOscillator(), g = a.createGain();
  o.type = 'sawtooth'; o.frequency.value = 55;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35, t + 1.2); g.gain.linearRampToValueAtTime(0, t + 3.6);
  o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 3.7);
  [0.4, 0.8, 1.6, 2.0, 2.8, 3.2].forEach(dt => noiseBurst(t + dt, 0.08, 500, 0.5));
}

// 声の主のラップ：短い母音をリズムに乗せる（仮の音）
function rap(){
  const a = ctx(); if (!a) return;
  const t0 = a.currentTime + 0.05, dt = 60 / 76 / 2, vow = [[730, 1090], [300, 2300], [520, 1800], [850, 1200]];
  for (let i = 0; i < 12; i++){
    if (i % 4 === 3) continue;
    const t = t0 + i * dt * 1.0, [f1, f2] = vow[i % 4];
    const o = a.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 110 + (i % 3) * 12;
    const g = a.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.4, t + 0.03); g.gain.linearRampToValueAtTime(0, t + dt * 0.8);
    [[f1, 1], [f2, 0.5]].forEach(([f, v]) => {
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 6;
      const vg = a.createGain(); vg.gain.value = v; o.connect(bp); bp.connect(vg); vg.connect(g);
    });
    g.connect(master); o.start(t); o.stop(t + dt);
  }
}

// 雨：ざーっという低めのノイズ（stopまで続く）
function startRain(){
  const a = ctx(); if (!a || rainBed) return;
  const len = a.sampleRate * 2, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500;
  const g = a.createGain(); g.gain.value = 0.12;
  src.connect(lp); lp.connect(g); g.connect(master); src.start();
  rainBed = { src, g };
}
function stopRain(){ if (rainBed){ rainBed.src.stop(); rainBed = null; } }

// 歓声：ざわめきが膨らんで、引いていく
function cheer(){
  const a = ctx(); if (!a) return;
  const t = a.currentTime + 0.05, len = Math.floor(a.sampleRate * 2.6), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(); src.buffer = buf;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 0.8;
  const g = a.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35, t + 0.5); g.gain.linearRampToValueAtTime(0, t + 2.6);
  src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
}

// 扉のベル：澄んだ2つの音
function bell(){
  const a = ctx(); if (!a) return;
  const t = a.currentTime + 0.02;
  [[1568, 1.0], [2349, 0.5]].forEach(([f, v]) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.9 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.7);
  });
}
// レコードをめくる：紙のすれる音
function flip(){
  const a = ctx(); if (!a) return;
  noiseBurst(a.currentTime + 0.01, 0.09, 3200, 1.6);
}

function reset(){ bpm = 68; kicks = [0, 7, 10]; snares = [4, 12]; bassOn = false; if (master) master.gain.value = 0.6; }

function clear(){ timeouts.forEach(clearTimeout); timeouts = []; intervals.forEach(clearInterval); intervals = []; }
// 街のざわめき：人の声のような帯域のノイズが、ゆっくり膨らんだり引いたりする
function startCrowd(){
  const a = ctx(); if (!a || crowdBed) return;
  const len = a.sampleRate * 2, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.7;
  const g = a.createGain(); g.gain.value = 0.07;
  const lfo = a.createOscillator(), depth = a.createGain(); lfo.frequency.value = 0.17; depth.gain.value = 0.04;
  lfo.connect(depth); depth.connect(g.gain);
  src.connect(bp); bp.connect(g); g.connect(master); src.start(); lfo.start();
  crowdBed = { src, lfo };
}
function stopCrowd(){ if (crowdBed){ crowdBed.src.stop(); crowdBed.lfo.stop(); crowdBed = null; } }

// 街のにぎやかさ：ループ・ベース・ざわめきに、スクラッチ・歓声・電車が、ときどき重なる（stopAllまで続く）
function townLoop(){
  if (!ctx()) return;
  stopAll();
  startBed(); kicks = [0, 6, 7, 10]; snares = [4, 12]; bassOn = true; startDrums(); startCrowd();
  const every = (ms, fn, first) => { timeouts.push(setTimeout(fn, first)); intervals.push(setInterval(fn, ms)); };
  every(7000, scratch, 2500); every(13000, cheer, 5000); every(23000, train, 9000);
}

function stopAll(){ clear(); stopDrums(); stopBed(); stopRain(); stopCrowd(); reset(); }

function play(name){
  if (!ctx()) return;
  resume();
  switch (name){
    case 'crackle': startBed(); break;
    case 'drums': startBed(); startDrums(); break;
    case 'voice': stopDrums(); voice(); break;
    case 'stop': { const keepRain = !!rainBed; stopAll(); if (keepRain) startRain(); break; }
    case 'stopAll': stopAll(); break;
    case 'loop': startBed(); kicks = [0, 6, 7, 10]; snares = [4, 12]; startDrums(); break;   // 切って並べたループ
    case 'bass': bassOn = true; break;
    case 'scratch': scratch(); break;
    case 'train': train(); break;
    case 'rap': rap(); break;
    case 'louder': master.gain.value = Math.min(1, master.gain.value + 0.2); break;
    case 'faster': bpm += 14; break;
    case 'cut': { const m = master.gain; m.value = 0; timeouts.push(setTimeout(() => { m.value = 0.6; }, 1600)); break; }
    case 'rain': startRain(); break;
    case 'townLoop': townLoop(); break;
    case 'cheer': cheer(); break;
    case 'bell': bell(); break;
    case 'flip': flip(); break;
    case 'finale':                                                       // ベース・スクラッチ・電車・雨・歓声が重なる
      startBed(); kicks = [0, 6, 7, 10]; snares = [4, 12]; bassOn = true; startDrums();
      scratch(); train(); startRain(); cheer();
      break;
    case 'quiet': master.gain.value = 0.15; break;                       // 机の上から聞こえる小さな音
    case 'replay':
      stopAll(); startBed(); startDrums();
      timeouts.push(setTimeout(()=>{ stopDrums(); voice(); }, 6500));
      timeouts.push(setTimeout(stopAll, 8500));
      break;
  }
}

return { play, resume };
})();
