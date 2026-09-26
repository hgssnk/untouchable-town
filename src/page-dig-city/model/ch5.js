// ===== Model：第5章「崩れる」。原稿は scenario/ch5-break.md =====
window.Ch5 = (function(){
const S = {
  intro: [
    '五日目の夜。', 'ベースがいる。/スクラッチもいる。', 'なら、/人を集めればいい。',
    '公園で、/パーティをやろう。', '日付は、/今週の土曜。',
    { choice: ['公園で、音を鳴らそう'] },
    '……どこかで、/見た言葉だ。', 'まあ、いい。',
  ],
  postOver: ['三年前の紙が、/見えなくなった。'],
  postNext: ['同じ言葉が、/二枚並んだ。'],
  npc: [
    ['目を合わせずに、/通りすぎていった。'],
    ['通行人：……あ、/はい。', '受け取って、/すぐポケットにしまった。'],
  ],
  reply1: ['ミオ：……分かった。', 'ケン：はいよ。'],
  reply3: ['ミオ：それ、/あなたの音？', 'ケン：なんか、/楽しくなくない？'],
  nothing: ['言いかけて、/やめた。', '……でも、/土曜まで時間がない。'],
  invite: [
    '土曜、/公園でやる。', '出てくれ。/あんたの声が要る。', 'ロク：……やめとけ。',
    { choice: ['頼む', 'あんたが必要なんだ'] },
    'ロク：……。', 'ロク：三年前の俺と、/同じ顔をしてる。', 'ロクは、/振り返らずに行った。',
  ],
  dayStart: ['来たのは、/数人だけ。', 'もっと、/盛り上げないと。'],
  rain: [{ t: 'ぽつ。', cue: 'rain' }, '……ぽつ、ぽつ。', '盤が、/濡れる。', '天気予報は、/構造までは教えない。'],
  afterCover: ['顔を上げると、/誰もいなかった。'],
  mioStays: ['街灯の下に、/ミオだけが残っていた。', 'ミオ：……風邪ひくよ。', 'ミオは、/傘を置いて帰った。'],
  rok: [
    'ロク：……降ったな。', 'ロク：三年前も、/こうだった。', 'ロク：曲も、順番も、/誰がいつ出るかも。',
    'ロク：全部、/俺が決めてた。', 'ロク：そして、/雨が降った。', 'ロク：みんな帰って、/戻ってこなかった。',
    'ロク：あの盤は、/その前に作った一枚だ。', 'ロク：最後の声は、/俺だ。',
    'ロク：……捨てたつもりが、/百円で売られてた。', 'ロク：雨は、/止められない。',
    'ロク：でも、/濡れない場所はある。', 'ロク：……それだけだ。',
  ],
  notYet: ['……まだ、/話が終わっていない。'],   // 原稿にない：話の途中で高架下を出ようとしたとき
  room7: ['全部、/自分で決めた。', 'だから、/全部こぼれた。'],
  desk: ['盤を拭く。', '……傷は、/ついていない。'],
  sleep: ['雨の音しか、/聞こえない。'],
};
const CUES = ['louder', 'faster', 'scratch', 'cut'];   // 指示ごとの音の変化

const maps = Object.assign({}, window.Maps, { room: window.Maps.roomOut });

function start(G){
  G.enterMap('room', 4, 4, 'up');
  G.say(S.intro, () => { G.flags.flyer = true; });
}

function underWithRok(G, x, y){ G.enterMap('under', 4, 7, 'up'); G.addObject({ x: 6, y: 3, id: 'rok' }); }

function interact(G, o){
  const f = G.flags;
  switch (o.id){
    case 'board':
      if (f.posted || f.late) break;
      G.say([{ choice: ['古いチラシの上に貼る', '隣に貼る'] }], () => {
        G.say(G.lastChoice === 0 ? S.postOver : S.postNext, () => {
          f.posted = true;
          G.transition(() => { G.removeObject('npc'); f.cmd = 0; G.startBand(1500); G.cue('loop'); });
        });
      });
      break;
    case 'npc': G.say(S.npc[Math.floor(G.rng() * S.npc.length)]); break;
    case 'desk': if (f.late) G.say(S.desk); break;
    case 'futon': if (f.late) G.say(S.sleep, () => G.transition(() => G.finish())); break;
  }
}

function onStep(G, id){
  const f = G.flags;
  if (id === 'roomDoor'){
    if (f.flyer && !f.posted && !f.late){
      G.transition(() => { G.enterMap('town', 3, 7, 'up'); G.addObject({ x: 4, y: 4, id: 'npc' }); });
    } else G.walker.place(4, 7);
  } else if (id === 'exit'){
    if (!f.rokDone){ G.walker.place(4, 7); G.say(S.notYet); }
    else G.transition(() => { f.late = true; G.enterMap('town', 8, 4, 'right'); });
  } else if (id === 'home' && f.late){
    G.transition(() => G.enterMap('room', 4, 7, 'up'), () => G.say(S.room7));
  }
}

// 指示：もっと大きく／テンポを上げて／今、スクラッチ／ここで止めて／何も言わない
function onBand(G, sel){
  const f = G.flags;
  if (sel === 4) return G.say(S.nothing);
  f.cmd = (f.cmd || 0) + 1;
  G.cue(CUES[sel]);
  G.say(f.cmd <= 2 ? S.reply1 : S.reply3);
}

function onBandEvent(G, ev){
  const f = G.flags;
  if (ev === 'rain'){
    f.rain = true;
    G.say(S.rain, () => G.transition(() => G.startCover()));
  } else if (ev === 'end'){                                   // 練習が終わった → ロクを誘う
    G.cue('stop'); f.cmdPractice = f.cmd || 0;
    G.transition(() => underWithRok(G), () => G.say(S.invite, () => {
      G.removeObject('rok');
      G.transition(() => { G.startBand(1800, 600); G.cue('loop'); }, () => G.say(S.dayStart));
    }));
  }
}

// 盤を守ったあと
function onCoverDone(G){
  const f = G.flags;
  const next = () => G.transition(() => { G.cue('stop'); underWithRok(G); f.rain = true; },
                                  () => G.say(S.rok, () => { G.removeObject('rok'); f.rokDone = true; }));
  G.say(S.afterCover, () => { if (f.cmdPractice <= 2){ G.memory.umbrella = true; G.say(S.mioStays, next); } else next(); });
}

const lv = (key, ...levels) => Object.assign(levels, { key });   // 場面の状態ごとに、ヒントの段階を数える

// STARTボタンのヒント（同じ場面で押すたびに具体的になる）
function hint(G){
  const f = G.flags;
  if (G.mode === 'walk' && G.mapId === 'room') return f.late
    ? lv('late', ['布団の前で、A。', '机で、盤も拭ける。'])
    : lv('door', ['チラシを持って、/外に出よう。', '下のドアだ。']);
  if (G.mode === 'walk' && G.mapId === 'town') return f.late
    ? lv('back', ['家に帰ろう。', '左下のドアだ。'])
    : lv('flyer', ['掲示板の前で、A。', '通行人にも、/話しかけられる。']);
  if (G.mode === 'band') return lv('band',
    ['↑↓で指示を選んで、A。'],
    ['指示を出すと、/二人の音が変わる。'],
    ['二人の返事を、/よく聞いてみよう。', '「何も言わない」も、/選べる。']);
  if (G.mode === 'cover') return lv('cover', ['Aを押し続けて、/盤を守る。'], ['シャツが、/盤を覆うまで。']);
  if (G.mode === 'walk' && G.mapId === 'under') return lv('under', ['ロクの話を、/最後まで聞こう。', '終わったら、/下の出口から。']);
  return null;
}

return { title: '第5章 崩れる', maps, hint, start, interact, onStep, onBand, onBandEvent, onCoverDone };
})();
