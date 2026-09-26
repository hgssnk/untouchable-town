// ===== Model：第2章「直す」。原稿は scenario/ch2-junk.md（`/`は改行、`名前：`は話す人、cueは音の合図） =====
window.Ch2 = (function(){
const S = {
  intro: ['次の夜。', 'ラベルのない盤は、/まだ黙っている。', '鳴らしたい。/でも、鳴らす機械がない。', '……あの店に、/何かあるかもしれない。'],
  vending: ['あたたかい、が/補充されていた。'],
  board: ['三年前のチラシ。/まだ、剥がされていない。'],
  viaduct: ['今夜は、/何も聞こえない。', '電車の音だけが、/上を通りすぎた。'],
  owner: [
    '店主：また来たか。',
    '店主：……鳴らす物を/探しに来た顔だな。',
    '店主：ジャンクなら、/ある。',
    '店主：動くかは知らん。/直せるなら、安い。',
  ],
  ownerAfter: ['店主：また来い。'],
  box: ['今日は、/掘りに来たんじゃない。'],
  junk: [
    'トランク型の/プレーヤー。',
    'スピーカーが/ふたに付いている。',
    '電源を入れても、/何も回らない。',
    '店主：五百円だ。',
    '店主：袋に入れておく。/持っていけ。',
  ],
  notYet: ['……店主と、/話してみよう。'],   // 原稿にない：話す前に店を出ようとしたとき
  bag: ['袋の底に、/小さな包みがある。', '替えのベルトと、/新しい針。', 'メモが一枚。', '「順番が逆なやつへ」'],
  screwDone: ['中は、/思ったより静かだった。', 'ネジが一本、余った。', '……余ったものは、/たいてい必要だった。'],
  beltOff: ['伸びきっている。/これじゃ回らない。'],
  wireDone: ['赤は赤へ。/それだけのことだ。'],
  needleOff: ['先が、/丸くなっている。', 'たくさん、/鳴らしてきたんだろう。'],
  fixed: ['ふたを閉じる。', '電源を入れた。', '……回った。'],
  armOut: ['縁で、/針が滑った。', '境界は、/いつも危ない。'],
  armIn: ['途中から鳴った。/最初から聴きたい。'],
  first: [
    { t: 'パチ、パチ。', cue: 'crackle' },
    { t: '……ドラムだ。', cue: 'drums' },
    '乾いたスネア。/遅いテンポ。',
    'ネタになる。/そう思った。',
    { t: '曲の終わり。/誰かの声が、一言。', cue: 'voice' },
    '……どこかで、/聞いた声だ。',
  ],
  replay: [{ t: 'もう一度、/針を落とす。', cue: 'replay' }, '何度聴いても、/最後の声が気になる。'],
  sleep: ['このプレーヤーなら、/外にも持っていける。', '明日、外で/鳴らしてみるか。'],
};

// ---- 章の進行 ----
function start(G){
  G.enterMap('room', 4, 4, 'up');
  G.say(S.intro, () => G.transition(() => G.enterMap('street', 3, 7, 'up')));
}

function interact(G, o){
  const f = G.flags;
  switch (o.id){
    case 'vending': G.say(S.vending); break;
    case 'board': G.say(S.board); break;
    case 'viaduct': G.say(S.viaduct); break;
    case 'shopDoor': if (!f.bag) G.transition(() => G.enterMap('shop', 4, 7, 'up')); break;
    case 'owner':
      if (f.bag) G.say(S.ownerAfter);
      else G.say(S.owner, () => G.say(S.junk, () => { f.bag = true; }));
      break;
    case 'box': G.say(S.box); break;
    case 'desk': if (f.played) G.say(S.replay, () => G.cue('stop')); break;
    case 'futon': if (f.played) G.say(S.sleep, () => G.transition(() => G.finish())); break;
  }
}

function onStep(G, id){
  if (id === 'home' && G.flags.bag){
    G.transition(
      () => { G.flags.late = true; G.enterMap('room', 4, 7, 'up'); },
      () => G.say(S.bag, () => G.transition(() => G.startRepair()))
    );
  } else if (id === 'exit'){
    if (!G.flags.bag){ G.walker.place(4, 7); G.say(S.notYet); }
    else G.transition(() => { G.flags.late = true; G.enterMap('street', 1, 1, 'down'); });
  }
}

// 修理の作業が進んだとき。全部終わったら、針を落とす場面へ
function onRepair(G, ev){
  const after = () => { if (G.repair.allDone()) G.say(S.fixed, () => G.transition(() => G.startArm())); };
  if (S[ev]) G.say(S[ev], after); else after();
}

function onArm(G, result){
  if (result === 'out'){ G.say(S.armOut, () => G.arm.reset()); }
  else if (result === 'in'){ G.say(S.armIn, () => G.arm.reset()); }
  else G.transition(
    () => G.enterMap('room', 4, 4, 'up'),
    () => G.say(S.first, () => { G.flags.played = true; G.cue('stop'); })
  );
}

const lv = (key, ...levels) => Object.assign(levels, { key });   // 場面の状態ごとに、ヒントの段階を数える

// STARTボタンのヒント（同じ場面で押すたびに具体的になる）
function hint(G){
  const f = G.flags, R = G.repair;
  if (G.mode === 'walk' && G.mapId === 'street') return f.bag
    ? lv('bag', ['袋を持って、/家に帰ろう。', '左下のドアだ。'])
    : lv('out', ['左上の中古屋の、/店主に相談してみよう。'], ['店の中で、/店主に話しかける。']);
  if (G.mode === 'walk' && G.mapId === 'shop') return f.bag
    ? lv('bag', ['出口は、/下の真ん中。'])
    : lv('shop', ['手前にいる、/店主に話しかける。', '向きを合わせて、A。']);
  if (G.mode === 'walk' && G.mapId === 'room') return f.played
    ? lv('played', ['机で、もう一度鳴らせる。', '布団の前で、A。'])
    : null;
  if (G.mode === 'repair'){
    if (!R.task) return lv('menu', ['4つの作業を、/好きな順で。', '↑↓で選んで、A。'], ['まだの作業には、/○が付いている。', 'Bで、選び直せる。']);
    if (R.task === 'screw') return lv('screw', ['Aを押し続けて、/ネジを回す。'], ['4本、/全部外す。']);
    if (R.task === 'belt') return R.belt.phase === 0
      ? lv('belt0', ['まず、古いベルトを/外す。A。'])
      : lv('belt1', ['矢印の順に、/十字キーを押す。'], ['ぐるっと、/2周まわす。']);
    if (R.task === 'wire') return lv('wire', ['同じ印の端子に/つなぐ。', '↑↓で選んで、A。'], ['点滅している線が、/いまの線。']);
    if (R.task === 'needle') return R.needle.phase === 0
      ? lv('needle0', ['まず、古い針を/抜く。A。'])
      : lv('needle1', ['針が揺れている。', 'まっすぐになった/瞬間に、A。']);
  }
  if (G.mode === 'arm') return lv('arm',
    ['←→で、針を動かす。'],
    ['盤の縁の、/少し内側で、A。'],
    ['外側すぎても、/内側すぎても、失敗。']);
  return null;
}

return { title: '第2章 直す', maps: window.Maps, hint, start, interact, onStep, onRepair, onArm };
})();
