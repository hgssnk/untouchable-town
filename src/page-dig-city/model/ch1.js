// ===== Model：第1章「掘る」。原稿は scenario/ch1-dig.md（`/`は改行、`名前：`は話す人） =====
window.Ch1 = (function(){
const S = {
  intro: [
    '夜。',
    '誰ともつながらない部屋で/ビートだけを作っている。',
    'この街に、仲間はいない。/まだ。',
    { t: '窓の外に、/中古屋の灯りが見えた。', shop: true },
    { t: '……行ってみるか。', shop: true },
  ],
  vending: ['つめたい、しか/残っていない。'],
  board: ['色あせたチラシ。/「公園で、音を鳴らそう」', '日付は、/三年前だ。'],
  viaduct: ['誰かの声が、/リズムに乗っている。', '近づくと、/音はもう消えていた。'],
  sign: ['古い看板。/「買取・販売 ハリオト商店」', '閉店まで、/あと三十分。'],
  owner: ['店主：……いらっしゃい。', '店主：レコードなら、/奥の箱だ。', '店主：全部百円。/当たりは、自分で探せ。'],
  ownerAfter: ['店主：また来い。'],
  radio: ['値札に「ジャンク」。/……今日はやめておく。'],
  junk: [
    'ジャケットだけ、/やけに派手だ。',
    '盤に大きな傷。/これは鳴らない。',
    '演歌。/……今日じゃない。',
    '同じ盤が、/三枚も入っている。',
  ],
  found: ['……ん？', '手が、止まった。'],
  wipeBefore: ['ラベルのない盤。/ジャケットもない。', 'ホコリで、/溝が見えない。'],
  wipeAfter: ['溝が、光った。', '……これだ。'],
  talk: [
    '店主：それを選んだか。',
    '店主：中身は知らん。/誰も聴いてない。',
    '店主：聴かなくても、/分かることはある。',
    '店主：溝の深さと、/盤の重さ。',
    '店主：外から見えるのは、/構造だけだ。',
    '店主：昔、そういう/研究をしていた。',
    '店主：……ブラックホールのな。',
    '……。',
  ],
  pay: [
    '店主：百円だ。',
    '店主：プレーヤーは/持ってるのか？',
    { choice: ['持ってない', 'これから探す'] },
    '店主：順番が逆だな。',
    'いや。/これでいい。',
    '先に見つける。/鳴らしたいものを。',
    '店主：……変わったやつだ。',
    '店主：また来い。',
  ],
  back: ['また、あの声だ。', '……消えた。', '今は、まだ/会えないらしい。'],
  room: ['ラベルのない盤を/机に置いた。', '鳴らす機械は、/まだない。', 'でも、/鳴らしたい音はある。', '順番は、/合っている。'],
  sleep: ['……一旦、寝るか。'],
  notYet: ['……まだ、何も/見つけていない。'],   // 原稿にない：店を出ようとしたとき
};

const maps = window.Maps;

// ---- 章の進行 ----
function start(G){
  G.memory = {};                       // 新しいゲーム：章をまたぐ記憶をリセット
  G.mode = 'still';
  G.say(S.intro, () => G.transition(() => G.enterMap('street', 3, 7, 'up')));
}

function interact(G, o){
  const f = G.flags;
  switch (o.id){
    case 'vending': G.say(S.vending); break;
    case 'board': G.say(S.board); break;
    case 'viaduct': G.say(S.viaduct); break;
    case 'shopDoor':
      if (f.bought) break;
      if (!f.sign){ f.sign = true; G.say(S.sign); }
      else G.transition(() => G.enterMap('shop', 4, 7, 'up'));
      break;
    case 'owner': G.say(f.bought ? S.ownerAfter : S.owner); break;
    case 'radio': G.say(S.radio); break;
    case 'box':
      if (!f.bought) G.transition(() => G.startDig());
      break;
    case 'futon': G.say(S.sleep, () => G.transition(() => G.finish())); break;
  }
}

function onStep(G, id){
  if (id === 'home' && G.flags.late){
    G.transition(() => G.enterMap('room', 4, 7, 'up'), () => G.say(S.room));
  } else if (id === 'exit'){
    if (!G.flags.bought){ G.walker.place(4, 7); G.say(S.notYet); }
    else G.transition(() => { G.flags.late = true; G.enterMap('street', 1, 1, 'down'); });
  }
}

// 高架下の声：近づくと聞こえる（♪）。帰り道では、ある距離まで近づくと消える
function onTick(G){
  const me = G.walker.me;
  const near = G.mapId === 'street' && !G.flags.heardBack ? Math.abs(me.x - 9) + Math.abs(me.y - 4) : 99;
  G.note = near <= 3 ? { x: 9, y: 4 } : null;
  if (G.flags.late && near <= 2){
    G.flags.heardBack = true; G.note = null;
    G.say(S.back);
  }
}

function onNotice(G){ G.say(S.found); }

function onPick(G, kind){
  if (kind === 'junk') return G.say([S.junk[Math.floor(G.rng() * S.junk.length)]]);
  G.transition(() => G.startWipe(), () => G.say(S.wipeBefore, () => { G.wipe.active = true; }));
}

function onDigLeave(G){ G.transition(() => G.enterMap('shop', 5, 1, 'up')); }

function onWipeDone(G){
  G.say(S.wipeAfter, () => G.transition(
    () => G.enterMap('shop', 6, 6, 'right'),
    () => G.say(S.talk, () => G.say(S.pay, () => { G.flags.bought = true; }))
  ));
}

const lv = (key, ...levels) => Object.assign(levels, { key });   // 場面の状態ごとに、ヒントの段階を数える

// STARTボタンのヒント（同じ場面で押すたびに具体的になる）
function hint(G){
  const f = G.flags;
  if (G.mode === 'walk' && G.mapId === 'street') return f.bought
    ? lv('home', ['家に帰ろう。', '左下のドアだ。'])
    : lv('out',
        ['街を歩いて、/気になる物を調べる。', '向きを合わせて、A。'],
        ['左上の中古屋に、/入ってみよう。', '入り口の前で、A。'],
        ['看板を読んだら、/もう一度A。']);
  if (G.mode === 'walk' && G.mapId === 'shop') return f.bought
    ? lv('bought', ['出口は、/下の真ん中。'])
    : lv('shop', ['奥の箱を、/掘ってみよう。', '箱の前で、A。'], ['店主にも、/話しかけてみよう。']);
  if (G.mode === 'dig') return lv('dig',
    ['←→で、1枚ずつめくる。', '気になったら、A。'],
    ['手が止まる、/一枚がある。', 'そこで、A。']);
  if (G.mode === 'wipe') return lv('wipe', ['Aを押し続ける。'], ['ゲージが満ちるまで、/離さない。']);
  if (G.mode === 'walk' && G.mapId === 'room') return lv('room', ['布団の前で、A。']);
  return null;
}

return { title: '第1章 掘る', maps, hint, start, interact, onStep, onTick, onNotice, onPick, onDigLeave, onWipeDone };
})();
