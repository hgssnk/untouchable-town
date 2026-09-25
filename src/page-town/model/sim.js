// ===== Model：シミュレーション核（純粋関数：同じ配置と同じシードなら同じ一日） =====
window.Sim = (function(){
const N = 10, T = 64, NIGHT = 40, LATE = 56;
const EMPTY = 0, PATH = 1, BENCH = 2, LAMP = 3, HOUSE = 4;
const HOMES = [{x:5,y:0},{x:9,y:3},{x:0,y:5},{x:2,y:9},{x:7,y:9}];
const TARGET = 4, CLEAR_DAYS = 7;

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function daySeed(base, day){ let h = (base ^ Math.imul(day, 2654435761)) >>> 0; h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0; return h; }

function emptyLayout(){
  const g = new Array(N*N).fill(EMPTY);
  HOMES.forEach(h => g[h.y*N+h.x] = HOUSE);
  return g;
}
const man = (a,b) => Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
function nearestDist(list, p){ let d = Infinity; for (const q of list){ const k = man(p,q); if (k < d) d = k; } return d; }

function simulateDay(layout, seed){
  const rng = mulberry32(seed);
  const rain = rng() < 0.25;
  const benches = [], lamps = [];
  layout.forEach((v,i) => { const p = {x:i%N, y:Math.floor(i/N)}; if (v===BENCH) benches.push(p); if (v===LAMP) lamps.push(p); });
  const litAt = p => nearestDist(lamps, p) <= 2;
  const cell = p => layout[p.y*N+p.x];

  let rs = HOMES.map((h,i) => ({ id:i, x:h.x, y:h.y, out: rng() < (rain ? 0.35 : 0.9), start: Math.floor(rng()*10), sit:0, done:false }));
  const frames = [], meets = [], heat = new Array(N*N).fill(0), met = new Set();

  for (let t = 0; t < T; t++){
    const night = t >= NIGHT, late = t >= LATE;
    rs = rs.map(r => {
      const home = HOMES[r.id];
      const atHome = r.x===home.x && r.y===home.y;
      if (!r.out || r.done || t < r.start) return r;
      if (r.sit > 0 && !late) return {...r, sit: r.sit-1};
      if (atHome && t > r.start + 2 && (late || (night && !litAt(r)))) return {...r, done:true, sit:0};
      const cur = {x:r.x, y:r.y};
      const opts = [cur, {x:r.x+1,y:r.y}, {x:r.x-1,y:r.y}, {x:r.x,y:r.y+1}, {x:r.x,y:r.y-1}]
        .filter(p => p.x>=0 && p.y>=0 && p.x<N && p.y<N)
        .filter(p => cell(p)!==HOUSE || (p.x===home.x && p.y===home.y));
      const dB0 = nearestDist(benches, cur), dL0 = nearestDist(lamps, cur), dH0 = man(cur, home);
      const ws = opts.map(p => {
        const stay = p === cur;
        const c = cell(p);
        let w = stay ? 0.5 : (c===PATH ? 3 : c===BENCH ? 2 : 1);
        if (!stay && p.x===home.x && p.y===home.y) w = (late || night) ? 1 : 0.1;
        if (!night && !stay && dB0 <= 3 && nearestDist(benches, p) < dB0) w *= 2;
        if (night){
          if (!stay && dL0 <= 5 && nearestDist(lamps, p) < dL0) w *= 3;
          if (!litAt(p)) w *= 0.45;
          if (!stay && man(p, home) < dH0) w *= litAt(cur) ? 1.1 : 3;
          if (stay && litAt(cur)) w *= 2.5;
        }
        if (late && !stay && man(p, home) < dH0) w *= 8;
        return w;
      });
      let s = ws.reduce((a,b)=>a+b,0) * rng(), k = 0;
      while (k < ws.length-1 && (s -= ws[k]) > 0) k++;
      const p = opts[k];
      const sit = (!late && p !== cur && cell(p)===BENCH) ? 3 + Math.floor(rng()*5) : 0;
      return {...r, x:p.x, y:p.y, sit};
    });

    const outside = rs.filter(r => r.out && !r.done && t >= r.start && !(r.x===HOMES[r.id].x && r.y===HOMES[r.id].y));
    outside.forEach(r => heat[r.y*N+r.x]++);
    for (let i = 0; i < outside.length; i++) for (let j = i+1; j < outside.length; j++){
      const a = outside[i], b = outside[j];
      if (man(a,b) > 1) continue;
      const onBench = (a.sit>0 && cell(a)===BENCH) || (b.sit>0 && cell(b)===BENCH);
      const underLamp = night && litAt(a) && litAt(b);
      if (!onBench && !underLamp) continue;
      const key = Math.min(a.id,b.id) + '-' + Math.max(a.id,b.id);
      if (met.has(key)) continue;
      met.add(key);
      meets.push({t, a:a.id, b:b.id, x:(a.x+b.x)/2, y:(a.y+b.y)/2, why: onBench ? 'bench' : 'lamp'});
    }
    frames.push(rs.map(r => ({x:r.x, y:r.y, sit:r.sit, vis: r.out && !r.done && t >= r.start})));
  }
  return { rain, frames, meets, heat, encounters: met.size };
}

function trial(layout, runs, base){
  let ok = 0, sum = 0;
  for (let i = 0; i < runs; i++){ const r = simulateDay(layout, daySeed(base, 1000+i)); sum += r.encounters; if (r.encounters >= TARGET) ok++; }
  return { rate: ok/runs, avg: sum/runs };
}

return { N, T, NIGHT, LATE, EMPTY, PATH, BENCH, LAMP, HOUSE, HOMES, TARGET, CLEAR_DAYS, mulberry32, daySeed, emptyLayout, simulateDay, trial };
})();
