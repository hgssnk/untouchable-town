// ===== Model：第6章「置く」。原稿は scenario/ch6-push.md =====
window.Ch6 = (function(){
const S = {
  intro: ['六日目の夜。', '決めるのは、/もうやめる。', '誘うのも、/やめる。', '来たくなる場所を、/置くだけだ。', '……濡れない場所。'],
  dry: ['ここだけ、/雨が届かない。', '公園と高架下の、/ちょうど境目。', '傘も、/構造だ。'],
  lamp: ['ケンと会った灯り。/今夜は、誰もいない。'],
  mic: [
    'マイクスタンドを、/一本立てる。', '誰のためでもない。/ただ、置いておく。',
    '歌われていない歌は、/歌われるまで、', '歌かどうかも/決まらない。',
  ],
  nightEnd: ['今夜も、/鳴らしただけ。', '誘わない。/決めない。/……待つ。'],
  mioA: [
    'あの夜の傘。/返そうとして、止められた。', 'ミオ：……持ってて。/また降るかもしれない。',
    'ミオ：今日は、/何も言わないんだ。', 'うん。', { t: 'ミオ：……じゃあ、/弾こうかな。', cue: 'bass' },
  ],
  mioB: [
    'ミオ：毎晩、/ここで鳴らしてるって。', 'ミオ：今日は、/何も言わないんだ。', 'うん。',
    { t: 'ミオ：……じゃあ、/弾こうかな。', cue: 'bass' },
  ],
  ken: ['ケン：よっ。/連れてきた。', 'ケン：誘われたから、/じゃないよ。', 'ケン：ここ、/なんか居やすいから。'],
  satStart: ['誰も呼んでいない。', 'でも、/人がいる。'],
  quiet: ['……言わなくていい。'],
  box: ['知らない誰かが、/箱をめくっている。', '手が、/一枚のところで止まった。'],
  rainSheet: [{ t: 'ぽつ。', cue: 'rain' }, '……降った。', 'でも、/音は止まらなかった。', '雨が、シートを叩く。/それもリズムになる。'],
  rainNoSheet: [{ t: 'ぽつ。', cue: 'rain' }, '……降った。', '人が、/高架の下に詰め寄る。', 'それでも、/音は止まらない。'],   // 原稿にない：シートなしの場合
  mic7: [
    'ロク：止まった針を/また落とす', 'ロク：雨の中でも/鳴りやまない', 'ロク：決めたのは/場所だけだ',
    { t: 'ロク：……あとは、/勝手に鳴る。', cue: 'finale' },
  ],
  after: ['ロク：……何も、/言わなかったな。', '言わなくても、/来たから。', 'ロク：三年かかった。/俺は。', 'ロク：お前は、/一週間だ。', 'ロク：……悪くない。'],
  room: ['置いただけ。', 'それで、/全部が鳴った。'],
  desk: [{ t: 'ループを鳴らす。', cue: 'loop' }, 'もう、/頭の中だけの音じゃない。'],
  sleep: ['疲れた。/でも、悪くない。'],
};

// 置けるもの（場所は公園の端）。マイクスタンドは最初の夜に必ず置く
const ITEMS = [
  { id: 'sheet', name: 'シート', x: 8, y: 2 },
  { id: 'lantern', name: '灯り', x: 5, y: 5 },
  { id: 'crates', name: 'ベンチ', x: 6, y: 6 },
  { id: 'recordBox', name: 'レコード箱', x: 7, y: 6 },
];
const MIC = { id: 'mic', x: 7, y: 3 };
const CROWD = [[4,3],[6,3],[3,4],[6,4],[4,6],[3,6],[5,7],[6,7],[3,3],[4,4]];   // 来る人が立つ場所
const RAIN_AT = 900;

const maps = Object.assign({}, window.Maps, { room: window.Maps.roomOut });
const placed = G => G.flags.placed;

function start(G){
  G.flags.placed = [];
  G.enterMap('room', 4, 4, 'up');
  G.say(S.intro, () => { G.flags.ready = true; });
}

// ---- 場面3：置く夜（三晩） ----
function night(G){
  const f = G.flags;
  f.night = (f.night || 0) + 1;
  const opts = ITEMS.filter(i => !placed(G).includes(i.id));
  const choose = () => G.say([{ choice: opts.map(o => o.name) }], () => {
    const it = opts[G.lastChoice];
    placed(G).push(it.id);
    G.addObject({ x: it.x, y: it.y, id: it.id });
    G.cue('loop');
    G.say(S.nightEnd, () => { G.cue('stop'); endNight(G); });
  });
  if (f.night === 1){ G.addObject(MIC); G.say(S.mic, choose); } else choose();
}

function person(G, id, x, y){ G.addObject({ x, y, id }); }

function endNight(G){
  const f = G.flags, next = () => G.transition(() => {}, () => night(G));
  if (f.night === 2){                                       // ミオ
    person(G, 'mio', 7, 4);
    G.say(G.memory.umbrella ? S.mioA : S.mioB, () => { G.removeObject('mio'); G.cue('stop'); next(); });
  } else if (f.night === 3){                                // ケン（知らない二人つき）
    person(G, 'ken', 7, 4); person(G, 'npc', 6, 4); person(G, 'npc', 5, 4);
    G.say(S.ken, () => {
      G.walker.removeObject('ken'); G.walker.removeObject('npc');
      G.transition(() => saturday(G));
    });
  } else next();
}

// ---- 場面6：土曜 ----
function saturday(G){
  G.memory.placed = placed(G).slice();                       // 最後のブロックパーティーに反映される
  const f = G.flags, n = 2 + (placed(G).includes('lantern') ? 3 : 0) + (placed(G).includes('crates') ? 2 : 0);
  CROWD.slice(0, n).forEach(([x, y]) => G.addObject({ x, y, id: 'npc' }));
  f.sat = true; f.satT = 0;
  G.say(S.satStart);
}

function interact(G, o){
  const f = G.flags;
  switch (o.id){
    case 'viaduct':
      if (f.ready && !f.night) G.say(S.dry, () => G.transition(() => G.walker.place(8, 4), () => night(G)));
      break;
    case 'lamp': if (f.ready && !f.night) G.say(S.lamp); break;
    case 'npc': if (f.sat && !f.rokIn) G.say(S.quiet); break;
    case 'recordBox': if (f.sat && !f.rokIn) G.say(S.box); break;
    case 'desk': if (f.late) G.say(S.desk, () => G.cue('stop')); break;
    case 'futon': if (f.late) G.say(S.sleep, () => G.transition(() => G.finish())); break;
  }
}

function onStep(G, id){
  const f = G.flags;
  if (id === 'roomDoor'){
    if (f.ready && !f.night) G.transition(() => G.enterMap('town', 3, 7, 'up'));
    else G.walker.place(4, 7);
  } else if (id === 'home' && f.late){
    G.transition(() => G.enterMap('room', 4, 7, 'up'), () => G.say(S.room));
  }
}

// 土曜：しばらく歩いていると、必ず雨が降る
function onTick(G){
  const f = G.flags;
  if (!f.sat || f.rain) return;
  if (++f.satT < RAIN_AT) return;
  f.rain = true;
  G.say(placed(G).includes('sheet') ? S.rainSheet : S.rainNoSheet, () => {
    f.rokIn = true;
    G.walker.place(8, 4);
    G.addObject({ x: 7, y: 4, id: 'rok' });
    G.say(S.mic7, () => {
      G.transition(() => {
        f.late = true;
        for (let i = 0; i < CROWD.length; i++) G.walker.removeObject('npc');   // 人がまばらになる
        G.addObject({ x: 3, y: 6, id: 'npc' });                                // 通路はふさがない
        G.cue('stop'); G.cue('rain');
      }, () => G.say(S.after, () => { G.removeObject('rok'); f.rokIn = false; }));
    });
  });
}

const lv = (key, ...levels) => Object.assign(levels, { key });   // 場面の状態ごとに、ヒントの段階を数える

// STARTボタンのヒント（同じ場面で押すたびに具体的になる）
function hint(G){
  const f = G.flags;
  if (G.mode !== 'walk') return null;
  if (G.mapId === 'room') return f.late
    ? lv('late', ['布団の前で、A。', '机で、ループも鳴らせる。'])
    : lv('door', ['外に出よう。', '下のドアだ。']);
  if (G.mapId === 'town'){
    if (f.late) return lv('back', ['家に帰ろう。', '左下のドアだ。']);
    if (f.sat) return lv('sat',
      ['誰かの前でAを押しても、/何も言わなくていい。'],
      ['しばらく、/歩いていよう。', '……待つだけだ。']);
    if (!f.night) return lv('dry',
      ['雨の届かない場所を、/探そう。'],
      ['右端の、/高架の下。', '前で、A。']);
  }
  return null;
}

return { title: '第6章 置く', maps, hint, start, interact, onStep, onTick };
})();
