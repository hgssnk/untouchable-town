// ===== Model：第4章「集める」。原稿は scenario/ch4-crew.md =====
window.Ch4 = (function(){
const S = {
  intro: ['四日目の夜。', '高架下だけじゃない。/街のあちこちで鳴らす。', '誰かが、/反応するかもしれない。', '夜は短い。/回れるのは、三か所くらいだ。'],
  cafeEarly: ['まだ営業中だ。/店の音にかき消される。'],
  cafeMiss: ['裏口は静かだ。', '……今夜は、/誰も出てこない。', '来ない確率も、/確率のうちだ。'],
  bench: ['音が、/夜の広さに負けている。', '……広いものには、/たいてい負ける。', 'もう少し、/明るい所で鳴らすか。'],
  lampMiss: ['光の中で、/音だけが回っている。', '……今夜は、/誰も来ない。'],
  laundry: ['乾燥機が、/リズムを刻んでいる。', '回転数は、/たぶん一定。', '……いい音だ。/でも、誰も来ない。'],
  viaductNone: ['……何も、/起きなかった。'],   // 原稿にない：ロクが現れなかったとき
  mio1: ['ミオ：……うるさい。', 'ミオ：嘘。/そのベースライン、何？', 'ベースは、/入ってない。', 'ミオ：だから、/足りないって言ってるの。'],
  mio2: ['低い音が、/床を這う。', 'ループが、/急に歩き出した。', 'ミオ：店を閉めたあとなら、/いつでも弾ける。'],
  ken1: ['ケン：おっ、/それ生の盤？', 'ケン：ちょっと、/貸して。'],
  ken2: ['キュッ、キュキュッ。', '盤が、/しゃべり出した。', 'ケン：夜の公園、/毎日いるから。'],
  roku1: ['ロク：……今夜も、/一人か。'],
  roku2: ['ロク：……増えたな。', 'ロク：人が増えると、/音は良くも悪くもなる。', 'ロク：覚えておけ。'],
  sleep6: ['今夜は、/ここまでか。', '明日も、/鳴らしに行こう。'],
  room7: ['ベースと、/スクラッチ。', '一人だった音に、/人が増えていく。', 'もっと人がいれば、/もっと鳴る。', '……そう思った。'],
  desk: ['ループを鳴らす。', '頭の中で、/みんなの音が重なる。'],
  sleep7: ['誰かの笑い声が、/窓の外から聞こえる。'],
};
const END_HOUR = 25;

const clock = G => { G.hud = G.flags.hour + ':00'; };

function startNight(G){
  G.flags.hour = 22; G.flags.late = false; clock(G);
  G.enterMap('town', 3, 7, 'up');
}

function start(G){
  G.enterMap('room', 4, 4, 'up');
  G.say(S.intro, () => G.transition(() => startNight(G)));
}

// 1回鳴らすと1時間進む。二人に会えたら部屋へ、25時になったらその夜は終わり
function advance(G){
  const f = G.flags;
  f.hour++; clock(G);
  const both = f.mio && f.ken;
  if (both || f.hour >= END_HOUR){
    G.transition(
      () => { f.late = true; G.hud = null; G.enterMap('room', 4, 4, 'up'); },
      both ? () => G.say(S.room7) : null
    );
  }
}

// ループを鳴らして、文を出す
function play(G, pages, done){
  G.cue('loop');
  G.say(pages, () => { G.cue('stop'); done(); });
}

// 会えた人を、プレイヤーの隣に出す
function appear(G, id){ const me = G.walker.me; G.addObject({ x: me.x - 1, y: me.y, id }); }

function meet(G, id, part1, cueName, part2, flag){
  appear(G, id);
  G.cue('loop');
  G.say(part1, () => {
    G.cue(cueName);
    G.say(part2, () => { G.removeObject(id); G.cue('stop'); if (flag) G.flags[flag] = true; advance(G); });
  });
}

function interact(G, o){
  const f = G.flags, adv = () => advance(G), roll = p => G.rng() < p;
  switch (o.id){
    case 'cafeDoor':
      if (f.mio) play(G, ['ミオ：店を閉めたあとなら、/いつでも弾ける。'], adv);
      else if (f.hour < 23) play(G, S.cafeEarly, adv);
      else if (roll(0.65)) meet(G, 'mio', S.mio1, 'bass', S.mio2, 'mio');
      else play(G, S.cafeMiss, adv);
      break;
    case 'bench': play(G, S.bench, adv); break;
    case 'lamp':
      if (f.ken) play(G, ['ケン：夜の公園、/毎日いるから。'], adv);
      else if (roll(0.6)) meet(G, 'ken', S.ken1, 'scratch', S.ken2, 'ken');
      else play(G, S.lampMiss, adv);
      break;
    case 'viaduct':
      if (roll(0.5)){
        appear(G, 'rok'); G.cue('loop');
        G.say(f.mio || f.ken ? S.roku2 : S.roku1, () => { G.removeObject('rok'); G.cue('stop'); adv(); });
      } else play(G, S.viaductNone, adv);
      break;
    case 'laundry': play(G, S.laundry, adv); break;
    case 'desk': if (f.mio && f.ken) play(G, S.desk, () => {}); break;
    case 'futon':
      if (f.mio && f.ken) G.say(S.sleep7, () => G.transition(() => G.finish()));
      else G.say(S.sleep6, () => G.transition(() => startNight(G)));
      break;
  }
}

// STARTボタンのヒント。まだ会っていない人の分だけ、具体的になる
function hint(G){
  const f = G.flags;
  if (G.mode === 'walk' && G.mapId === 'room') return f.mio && f.ken
    ? [['机で、ループを鳴らせる。', '布団の前で、A。']]
    : [['今夜は、ここまで。', '布団の前で、A。']];
  if (G.mode !== 'walk' || G.mapId !== 'town') return null;
  const who = [];
  if (!f.mio) who.push('ミオは、喫茶店の裏口。/23時になってから。');
  if (!f.ken) who.push('ケンは、公園の/街灯の下。');
  return [
    ['人は、それぞれ/いる場所と時間がある。', '夜は、25時まで。'],
    who.length ? who : ['二人とも、会えている。', '部屋に戻ろう。'],
    ['会えるかは、運。/外れても、また鳴らそう。', '二人に会えるまで、/夜は何度でも続く。'],
  ];
}

return { title: '第4章 集める', maps: window.Maps, start, interact, hint };
})();
