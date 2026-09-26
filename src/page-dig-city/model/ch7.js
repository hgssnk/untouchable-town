// ===== Model：第7章「手放す」。原稿は scenario/ch7-keepitreal.md =====
window.Ch7 = (function(){
const S = {
  intro: ['七日目の夜。', '今夜は、/何も予定がない。', '……少し、/歩くか。'],
  shop: ['店主：……またお前か。/今日は掘らないのか。', '今日は、/見てるだけ。', '店主：観測だけか。/……一番安上がりだ。', '店主：……そうか。'],
  board: ['三年前のチラシの横に、/新しいチラシ。', '「公園で、音を鳴らそう」', '知らない字だ。'],
  cafe: ['裏口から、/ベースが漏れている。', 'ノックは、/しなかった。'],
  park: ['街灯の下で、ケンが/誰かに盤を回させている。', '笑い声。/……いい音だ。'],
  under: ['ロクが、/誰かに何か教えている。', 'こちらに気づいて、/片手だけ上げた。'],
  laundry: ['乾燥機が、/今夜もリズムを刻んでいる。'],
  desk: ['今夜は、/鳴らさなくていい。', '鳴らさない音も、/そこにある。'],
  end: ['……行ってみるか。'],
};

// スタッフロール（仮：章の題と、登場した人たち。名前などは、あとで足せる）
const CREDITS = [
  'ディグ・シティ', '',
  '第1章 掘る', '第2章 直す', '第3章 鳴らす', '第4章 集める', '第5章 崩れる', '第6章 置く', '第7章 手放す', '',
  '店主', 'ミオ', 'ケン', 'ロク', '',
  '聴いてくれて', 'ありがとう', '', 'おわり',
];
const SPEED = 0.2;                                           // スタッフロールの速さ（px/フレーム）
const CREDITS_FRAMES = Math.round((CREDITS.length * 14 + 144) / SPEED);

const maps = Object.assign({}, window.Maps, { room: window.Maps.roomOut });

// 街の人たちは、主人公がいなくても、それぞれの音を鳴らしている
function decor(G){
  G.addObject({ x: 7, y: 6, id: 'ken' }); G.addObject({ x: 6, y: 6, id: 'npc' });
  G.addObject({ x: 8, y: 2, id: 'rok' }); G.addObject({ x: 8, y: 1, id: 'npc' });
}

function start(G){
  G.enterMap('room', 4, 4, 'up');
  G.say(S.intro, () => { G.flags.ready = true; });
}

// ---- 場面4：エンディングロール（街を一周しながら、スタッフロールが流れる） ----
const WAYPOINTS = [[1,1],[4,1],[4,4],[8,4],[4,4],[4,7],[8,7],[4,7],[2,7]];

function bfsRoute(map, from, waypoints){
  const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }, route = [];
  let cur = from;
  for (const to of waypoints){
    const q = [[cur[0], cur[1], []]], seen = new Set([cur.join()]);
    while (q.length){
      const [x, y, p] = q.shift();
      if (x === to[0] && y === to[1]){ route.push(...p); break; }
      for (const d in dirs){
        const nx = x + dirs[d][0], ny = y + dirs[d][1];
        if (seen.has(nx + ',' + ny)) continue;
        if (!(map.rows[ny] && map.rows[ny][nx] === '.') || map.objects.some(o => o.x === nx && o.y === ny)) continue;
        seen.add(nx + ',' + ny); q.push([nx, ny, p.concat(d)]);
      }
    }
    cur = to;
  }
  return route;
}

function beginWatch(G, only){
  const f = G.flags;
  G.enterMap('town', 2, 7, 'up'); decor(G);
  f.watch = true; f.only = only; f.ri = 0;
  f.route = bfsRoute(G.walker.me.map, [2, 7], WAYPOINTS);
  G.credits = { t: 0, lines: CREDITS };
  G.auto = new Set();
  G.cue('finale');                                           // 街の音（歓声・ベース・スクラッチ・電車）
}

function onTick(G){
  const f = G.flags;
  if (!f.watch) return;
  if (G.walker.me.t === 0 && f.route.length) G.auto = new Set([f.route[f.ri++ % f.route.length]]);
  if (!G.credits) return;
  if (++G.credits.t < CREDITS_FRAMES) return;
  G.credits = null;
  if (f.only){ G.cue('stopAll'); G.toTitle(); }
  else startOutro(G);
}

// ---- 場面5：手放す（ゲームボーイの外へ）。ここから先は、そのまま止まる ----
function startOutro(G){
  G.outro = { t: 0 };
  G.cue('quiet');
}

function interact(G, o){
  const f = G.flags;
  if (f.watch) return;
  switch (o.id){
    case 'shopDoor': G.say(S.shop); break;
    case 'board': G.say(S.board); break;
    case 'cafeDoor': G.say(S.cafe); break;
    case 'lamp': case 'bench': G.say(S.park); break;
    case 'viaduct': G.say(S.under); break;
    case 'laundry': G.say(S.laundry); break;
    case 'desk': if (f.late) G.say(S.desk); break;
    case 'futon': if (f.late) beginWatch(G, false); break;     // 暗転しない
  }
}

function onStep(G, id){
  const f = G.flags;
  if (id === 'roomDoor'){
    if (f.ready && !f.late) G.transition(() => { G.enterMap('town', 3, 7, 'up'); decor(G); });
    else G.walker.place(4, 7);
  } else if (id === 'home' && !f.watch){
    G.transition(() => { f.late = true; G.enterMap('room', 4, 7, 'up'); });
  }
}

const lv = (key, ...levels) => Object.assign(levels, { key });   // 場面の状態ごとに、ヒントの段階を数える

// STARTボタンのヒント（同じ場面で押すたびに具体的になる）
function hint(G){
  const f = G.flags;
  if (f.watch) return lv('watch', ['……眺めていよう。']);
  if (G.mode !== 'walk') return null;
  if (G.mapId === 'room') return f.late
    ? lv('late', ['布団の前で、A。', '机でAを押しても、/盤はかけない。'])
    : lv('door', ['少し、歩こう。', '下のドアから外へ。']);
  if (G.mapId === 'town') return lv('town',
    ['どこに寄ってもいい。', '寄らずに帰ってもいい。'],
    ['帰るなら、/左下の家へ。']);
  return null;
}

return { title: '第7章 手放す', maps, hint, start, interact, onStep, onTick, startWatch: G => beginWatch(G, false) };
})();
