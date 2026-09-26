// ===== Model：第3章「鳴らす」。原稿は scenario/ch3-spin.md =====
window.Ch3 = (function(){
const S = {
  intro: ['三日目の夜。', '盤をかけたまま、/ずっと考えていた。', 'このまま鳴らしても、/誰かの曲のままだ。', '切って、並べる。/自分の音にする。'],
  miss: ['もたついた。/もう一度。'],
  chopped: [{ t: 'ドン、タン。/ドドン、タン。', cue: 'loop' }, '止まらない。/ずっと回っている。', '……できた。'],
  vending: ['つめたい、も/戻っていた。'],
  shopDoor: ['今日は定休日。/ガラスに、自分が映る。'],
  board: ['三年前のチラシ。/今夜は、素通りした。'],
  arrive: ['誰もいない。', 'ここなら、/音がよく響きそうだ。'],
  spotExit: [{ t: '音が、/外に逃げていく。', cue: 'loop' }, '……逃げ足だけは、/速い。'],
  spotPillar: [{ t: '柱に吸われて、/こもってしまう。', cue: 'loop' }],
  spotMid: [{ t: '壁に当たって、/音が返ってくる。', cue: 'loop' }, 'ここだ。'],
  train: [{ t: '電車が来た。', cue: 'train' }, 'ガタン、ゴトン。/……合っている。', '時刻表は、/偶然までは約束しない。', '暗がりから、/声がした。'],
  rap: [
    { t: '？？？：止まった針を/また落とす', cue: 'rap' },
    '？？？：三年分の/ホコリを払う',
    '？？？：……まだ、/鳴るのかよ。',
  ],
  rok: [
    '男：その盤、/どこで拾った。',
    { choice: ['中古屋で', '百円で'] },
    '男：……百円か。/安くなったもんだ。',
    '男：昔の、/知り合いの音だ。',
    '盤の最後の声。/あんたか？',
    '男：……さあな。',
    '男：俺はもう、/やってない。',
    '男：でも、/そのスネアは悪くない。',
    '男：明日も、/ここで鳴らすのか。',
    { choice: ['鳴らす', '分からない'] },
    '男：……そうか。',
    '男：名前は、/聞くなよ。',
    '男：観測すると、/変わる。',
    '男は、/暗がりに戻っていった。',
    '名前も、/聞かなかった。',
  ],
  notYet: ['……まだ、/ここで鳴らしたい。'],   // 原稿にない：高架下を出ようとしたとき
  board7: ['三年前のチラシ。/隅に、小さな文字。', '「MC ロク」', '……まさかな。'],
  replay: [{ t: 'ループを鳴らす。', cue: 'loop' }, 'あの声が乗らないと、/少しさびしい。'],
  sleep: ['耳に、/まだ残っている。'],
};

const maps = Object.assign({}, window.Maps, { room: window.Maps.roomOut });

function start(G){
  G.enterMap('room', 4, 4, 'up');
  G.say(S.intro, () => G.transition(() => G.startChop(), () => G.cue('drums')));
}

function onChop(G, ev){
  if (ev === 'miss') G.say(S.miss);
  else if (ev === 'done'){
    G.say(S.chopped, () => { G.cue('stop'); G.transition(() => { G.flags.chopped = true; G.enterMap('room', 4, 4, 'up'); }); });
  }
}

function interact(G, o){
  const f = G.flags;
  switch (o.id){
    case 'vending': G.say(S.vending); break;
    case 'shopDoor': G.say(S.shopDoor); break;
    case 'board': G.say(f.rokDone ? S.board7 : S.board); break;
    case 'viaduct':
      if (!f.rokDone) G.transition(() => G.enterMap('under', 4, 7, 'up'), () => G.say(S.arrive));
      break;
    case 'spotExit': G.say(S.spotExit, () => G.cue('stop')); break;
    case 'spotPillar': G.say(S.spotPillar, () => G.cue('stop')); break;
    case 'spotMid':
      if (f.rokDone) break;
      G.say([...S.spotMid, ...S.train, ...S.rap], () => {
        G.addObject({ x: 6, y: 3, id: 'rok' });
        G.say(S.rok, () => { G.removeObject('rok'); G.cue('stop'); f.rokDone = true; });
      });
      break;
    case 'desk': if (f.late) G.say(S.replay, () => G.cue('stop')); break;
    case 'futon': if (f.late) G.say(S.sleep, () => G.transition(() => G.finish())); break;
  }
}

function onStep(G, id){
  const f = G.flags;
  if (id === 'roomDoor' && f.chopped && !f.late) G.transition(() => G.enterMap('street', 3, 7, 'up'));
  else if (id === 'roomDoor') G.walker.place(4, 7);
  else if (id === 'exit'){
    if (!f.rokDone){ G.walker.place(4, 7); G.say(S.notYet); }
    else G.transition(() => { f.late = true; G.enterMap('street', 8, 4, 'right'); });
  } else if (id === 'home' && f.late) G.transition(() => G.enterMap('room', 4, 7, 'up'));
}

const lv = (key, ...levels) => Object.assign(levels, { key });   // 場面の状態ごとに、ヒントの段階を数える
// STARTボタンのヒント（同じ場面で押すたびに具体的になる）
function hint(G){
  const f = G.flags;
  if (G.mode === 'chop') return lv('chop', [
    '波の高いところに、/四角い印がある。', '線が印に来た瞬間に、A。',
  ], [
    '印は、左から順番に。/1つずつ切る。', 'ずれたら最初から。/何度でも、やり直せる。',
  ]);
  if (G.mode === 'walk' && G.mapId === 'room') return f.late
    ? lv('late', ['布団の前で、A。', '机で、ループも鳴らせる。'])
    : lv('door', ['プレーヤーを持って、/外に出よう。', '下のドアだ。']);
  if (G.mode === 'walk' && G.mapId === 'street') return f.rokDone
    ? lv('back', ['家に帰ろう。', '左下のドアだ。'])
    : lv('out', ['右端の、/高架下に行ってみよう。', '高架の前で、A。']);
  if (G.mode === 'walk' && G.mapId === 'under') return f.rokDone
    ? lv('done', ['下の出口から、/帰ろう。'])
    : lv('under',
        ['置ける場所は、/床の印の3か所。', '場所を変えて、/試してみよう。'],
        ['音が一番響くのは、/真ん中。', '印の前で、A。']);
  return null;
}

return { title: '第3章 鳴らす', maps, start, interact, onStep, onChop, hint };
})();
