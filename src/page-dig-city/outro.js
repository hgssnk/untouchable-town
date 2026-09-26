// ===== 演出：ゲームボーイの外へ（枠の外の、色のある絵）。ゲームの画面はそのまま動き続ける =====
window.createOutro = function(overlay, gameCanvas){
  const g = overlay.getContext('2d');
  const LINK = 'https://www.youtube.com/watch?v=5nO7IA1DeeI&list=PL9dk_xtWpAkKXxzv_TfLWmlJj6G3quWQ2';   // 最後の絵をタップすると、別タブで開く（1つ目）
  const LINK2 = 'https://www.youtube.com/watch?v=qVR9KsYH4Sc&list=PLBxu7MPeD3Myd22X64j_J9EbgY9hkLDWn&index=12';   // 「It's Your World」のあと、タップするとこのページへ移る
  const cover = new Image(); cover.src = './assets/jdilla.jpg';                                          // 最後の1枚
  const party = window.createParty(g);
  let tapped = false, tapAt = 0, current = null;                                                                  // タップされたか／いまのゲーム
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const lerp = (a, b, t) => a + (b - a) * t;

  function rrect(x, y, w, h, r){
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  // ゲームボーイ（画面には、今のゲーム画面がそのまま映る）
  function gameboy(cx, cy, w, h){
    const x = cx - w/2, y = cy - h/2;
    g.fillStyle = '#c9c6bd'; rrect(x, y, w, h, w * 0.05); g.fill();
    g.fillStyle = '#5b5f6a'; rrect(x + w*0.08, y + h*0.06, w*0.84, h*0.42, w*0.03); g.fill();
    const sw = w * 0.6, sh = sw * 144 / 160;
    g.imageSmoothingEnabled = false;
    g.drawImage(gameCanvas, cx - sw/2, y + h*0.08 + (h*0.38 - sh)/2, sw, sh);
    g.fillStyle = '#2b2d33'; g.fillRect(x + w*0.14, y + h*0.66, w*0.22, w*0.07); g.fillRect(x + w*0.21, y + h*0.6, w*0.07, w*0.22);
    g.fillStyle = '#8c2f4b'; [[0.66, 0.72], [0.8, 0.66]].forEach(([a, b]) => { g.beginPath(); g.arc(x + w*a, y + h*b, w*0.06, 0, Math.PI*2); g.fill(); });
  }

  // ---- 時間割（フレーム）。上から順に進む ----
  const T_OUT = 460, T_WALK = 540, T_DOOR = 800, T_FLOOD = 860, T_DIG = 940;
  const GAPS = [14, 14, 14, 16, 18, 22, 28, 36, 46];                    // めくる間隔（だんだん遅くなる）
  const FLIPS = GAPS.reduce((a, gap) => a.concat((a.length ? a[a.length - 1] : T_DIG) + gap), []);
  const T_STOP = FLIPS[FLIPS.length - 1], T_IMG = T_STOP + 30, T_TAP = T_IMG + 50;   // T_TAP：タップできるようになる

  // ---- 部屋（ドアが開く） ----
  function room(o, game){
    const t = o.t, base = g.globalAlpha, bgA = base * ease(t / 90);      // 部屋の壁は、ゲームボーイの周りにゆっくり現れる
    g.globalAlpha = bgA;
    const wall = g.createLinearGradient(0, 0, 0, 180); wall.addColorStop(0, '#2b2540'); wall.addColorStop(1, '#3d3352');
    g.fillStyle = wall; g.fillRect(-200, -200, 720, 380);
    g.fillStyle = '#5a4630'; g.fillRect(-200, 178, 720, 300);
    g.fillStyle = '#7a6244'; g.fillRect(-200, 178, 720, 3);

    const open = ease((t - 260) / 100);
    if (open > 0){
      g.fillStyle = '#12173a'; g.fillRect(236, 40, 64, 138);
      g.fillStyle = '#f5c46b'; g.globalAlpha = bgA * open; g.fillRect(262, 120, 5, 4);
      g.globalAlpha = bgA * 0.25 * open; g.fillRect(259, 117, 11, 10); g.globalAlpha = bgA;
      const lw = 64 * (1 - open * 0.85);
      g.fillStyle = '#6b4a2f'; g.fillRect(300 - lw, 40, lw, 138);
    } else { g.fillStyle = '#6b4a2f'; g.fillRect(236, 40, 64, 138); }
    g.globalAlpha = base;

    // ゲームボーイと手：持ち上げた状態から、机に置く
    const rect = document.querySelector('.gb').getBoundingClientRect();
    const s = o.s, w0 = rect.width / s, h0 = rect.height / s;
    const cx0 = (rect.left + rect.width / 2 - o.ox) / s, cy0 = (rect.top + rect.height / 2 - o.oy) / s;
    const p1 = ease(t / 150), p2 = ease((t - 150) / 100);
    let w = lerp(w0, 84, p1), h = lerp(h0, 128, p1), cx = lerp(cx0, 130, p1), cy = lerp(cy0, 110, p1);
    w = lerp(w, 60, p2); h = lerp(h, 92, p2); cy = lerp(cy, 132, p2); cx = lerp(cx, 122, p2);
    const handA = ease((t - 30) / 60) * (1 - p2);
    if (handA > 0){
      g.globalAlpha = base * handA; g.fillStyle = '#e0b090';
      const off = p2 * 26;
      rrect(cx - w/2 - 10 - off, cy + h * 0.15, 14, 44, 6); g.fill();
      rrect(cx + w/2 - 4 + off, cy + h * 0.15, 14, 44, 6); g.fill();
      g.globalAlpha = base;
    }
    gameboy(cx, cy, w, h);

    const ta = ease((t - 380) / 50) * (1 - ease((t - 440) / 25));
    if (ta > 0){
      g.globalAlpha = base * ta;
      g.fillStyle = '#e8e0d0'; g.font = '12px DotGothic16, sans-serif'; g.textAlign = 'center';
      g.fillText('……行ってみるか。', 160, 222); g.textAlign = 'left';
      g.globalAlpha = base;
    }
  }

  // ---- 夜の道：遠くの中古屋に近づいていく（z=0 遠い → 1 目の前）。open=扉の開き ----
  function street(z, open){
    const sky = g.createLinearGradient(0, 0, 0, 130); sky.addColorStop(0, '#080b24'); sky.addColorStop(1, '#1f2552');
    g.fillStyle = sky; g.fillRect(-200, -200, 720, 330);
    g.fillStyle = '#16161f'; g.fillRect(-200, 128, 720, 300);
    g.fillStyle = '#0d1030';                                           // 両側の建物の影
    const side = 40 + z * 60;
    g.fillRect(-200, 40 - z * 30, 200 + side, 100); g.fillRect(320 - side, 40 - z * 30, 200 + side, 100);
    // 街灯：奥から手前へ流れていく
    for (let j = 0; j < 4; j++){
      const ph = (j / 4 + z * 1.4) % 1, sz = 6 + ph * 46;
      [-1, 1].forEach(sd => {
        const x = 160 + sd * (24 + ph * 150), y = 128 + ph * 46;
        g.fillStyle = '#2a2a3a'; g.fillRect(x - sz * 0.03, y - sz * 1.4, sz * 0.06, sz * 1.4);
        g.fillStyle = '#f5c46b'; g.globalAlpha = 0.9; g.fillRect(x - sz * 0.12, y - sz * 1.5, sz * 0.24, sz * 0.14); g.globalAlpha = 1;
      });
    }
    // 店
    const w = 26 + 190 * z, h = w * 0.62, bot = lerp(130, 196, z), x = 160 - w / 2, y = bot - h;
    g.fillStyle = '#3a2b3f'; g.fillRect(x, y, w, h);
    g.fillStyle = '#f5c46b'; g.fillRect(x + w * 0.08, y + h * 0.08, w * 0.84, h * 0.16);       // 看板
    g.fillStyle = '#3a2b3f'; g.fillRect(x + w * 0.14, y + h * 0.13, w * 0.5, h * 0.05);
    g.fillStyle = '#c98f3a'; g.fillRect(x + w * 0.08, y + h * 0.36, w * 0.28, h * 0.32);       // 窓
    const dw = w * 0.24, dh = h * 0.6, dx = 160 - dw / 2 + w * 0.14, dy = bot - dh;
    g.fillStyle = '#f5c46b'; g.fillRect(dx, dy, dw, dh);                                        // 扉の奥の明かり
    g.fillStyle = '#4a3322'; g.fillRect(dx, dy, dw * (1 - open * 0.85), dh);                    // 扉
  }

  // ---- 店の中：棚のレコードを、1枚ずつめくる ----
  const SLEEVE = ['#c4553b', '#3574a0', '#8a5cb0', '#c9951a', '#2e8a66', '#d8d2c0', '#a04b6a'];
  function sleeve(i, cx, size, alpha){
    let sd = (i + 1) * 2654435761 % 4294967296;
    const rnd = n => { sd = (sd * 1664525 + 1013904223) % 4294967296; return Math.floor(sd / 65536) % n; };
    const x = cx - size / 2, y = 176 - size;
    g.globalAlpha = alpha;
    g.fillStyle = '#15100c'; g.fillRect(x - 1, y - 1, size + 2, size + 2);
    g.fillStyle = SLEEVE[rnd(7)]; g.fillRect(x, y, size, size);
    for (let k = 0; k < 3; k++){
      g.fillStyle = SLEEVE[rnd(7)];
      g.fillRect(x + size * rnd(50) / 100, y + size * rnd(50) / 100, size * (0.15 + rnd(30) / 100), size * (0.15 + rnd(30) / 100));
    }
    g.globalAlpha = 1;
  }
  function dig(t){
    g.fillStyle = '#241811'; g.fillRect(-200, -200, 720, 440);
    g.fillStyle = '#33231a'; for (let k = 0; k < 4; k++) g.fillRect(-200, 20 + k * 40, 720, 3);   // 棚の板
    // いま何枚目か（めくるたびに、なめらかに1つ進む）
    let idx = 0;
    FLIPS.forEach((tf, k) => { if (t >= tf) idx = k + 1; else if (t >= tf - 10) idx = k + ease((t - (tf - 10)) / 10); });
    const c = t < T_DIG ? 0 : idx;
    for (let i = Math.floor(c) - 3; i <= Math.floor(c) + 4; i++){
      if (i < 0) continue;
      const d = i - c, size = 104 - Math.min(2, Math.abs(d)) * 22;
      sleeve(i, 160 + d * 58, size, Math.abs(d) > 2.5 ? 0.4 : 1);
    }
    g.fillStyle = '#6b4a2f'; g.fillRect(-200, 176, 720, 90);           // 箱の縁
    g.fillStyle = '#8a6540'; g.fillRect(-200, 176, 720, 3);
  }

  function draw(game){
    const o = game.outro;
    if (!o){ overlay.style.display = 'none'; overlay.style.pointerEvents = 'none'; tapped = false; o_cued.clear(); return; }
    current = game;
    overlay.style.display = 'block';
    overlay.style.opacity = Math.min(1, o.t / 40);
    const dpr = window.devicePixelRatio || 1, W = innerWidth, H = innerHeight;
    if (overlay.width !== Math.round(W * dpr) || overlay.height !== Math.round(H * dpr)){
      overlay.width = Math.round(W * dpr); overlay.height = Math.round(H * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#2a2c33'; g.fillRect(0, 0, W, H);
    const s = Math.min(W / 320, H / 240), ox = (W - 320 * s) / 2, oy = (H - 240 * s) / 2;
    g.translate(ox, oy); g.scale(s, s);
    const t = o.t, ctxo = { t, s, ox, oy };
    const cue = (name, at) => { if (t >= at && !o_cued.has(name + at)){ o_cued.add(name + at); game.cue(name); } };

    g.globalAlpha = 1;
    if (t < T_OUT + 80){
      if (t >= T_OUT){                                                  // ドアの向こうへ：部屋が拡大して薄れ、夜の道が現れる
        street(0.08, 0);
        const p = ease((t - T_OUT) / 80);
        g.globalAlpha = 1 - p; g.save(); g.translate(268, 109); g.scale(1 + p * 4, 1 + p * 4); g.translate(-268, -109);
        room(ctxo, game); g.restore();
      } else room(ctxo, game);
    } else if (t < T_FLOOD + 60){
      const z = ease((t - T_WALK) / (T_DOOR - T_WALK));
      const open = ease((t - T_DOOR) / 60);
      street(lerp(0.08, 1, z), open);
      cue('bell', T_DOOR + 10);                                         // 扉のベル
      if (t >= T_FLOOD){                                                // 明かりが画面いっぱいに広がる
        const p = ease((t - T_FLOOD) / 60), r = 60 + p * 400;
        g.fillStyle = '#f5c46b'; g.fillRect(160 - r, 150 - r, r * 2, r * 2);
      }
    } else {
      dig(t);
      const wp = 1 - ease((t - (T_FLOOD + 60)) / 40);                   // 店の明かりから、店の中へ
      if (wp > 0){ g.globalAlpha = wp; g.fillStyle = '#f5c46b'; g.fillRect(-200, -200, 720, 440); g.globalAlpha = 1; }
      FLIPS.forEach(tf => cue('flip', tf));
      if (t >= T_STOP){                                                 // 最後の1枚で、手が止まる
        const p = ease((t - T_IMG) / 50);
        g.globalAlpha = 0.55 * p; g.fillStyle = '#000'; g.fillRect(-200, -200, 720, 440);
        if (cover.complete && cover.naturalWidth){
          const size = 176 + p * 20;
          g.globalAlpha = p; g.drawImage(cover, 160 - size / 2, 116 - size / 2, size, size);
        }
        g.globalAlpha = 1;
      }
      if (t >= T_TAP){ overlay.style.pointerEvents = 'auto'; overlay.style.cursor = 'pointer'; if (!tapped) clickHint(t, 226); }   // 最後の絵は、クリックできる
    }
    if (tapped){                                                        // タップのあと：ブロックパーティー
      const tt = t - tapAt, p = ease(tt / 90);
      g.globalAlpha = p; party.draw(tt, game.memory.placed || []); g.globalAlpha = 1;
      overlay.style.pointerEvents = tt >= TITLE_AT + 80 ? 'auto' : 'none';
      subtitle(tt);
      const ta = ease((tt - TITLE_AT) / 80);                             // 最後に、画面の中央へ
      if (ta > 0){
        g.globalAlpha = 0.45 * ta; g.fillStyle = '#000'; g.fillRect(-200, -200, 720, 640);
        g.globalAlpha = ta; g.textAlign = 'center';
        g.font = '28px DotGothic16, sans-serif';
        g.fillStyle = '#000'; g.fillText("It's Your World", 162, 128);
        g.fillStyle = '#f2ecd8'; g.fillText("It's Your World", 160, 126);
        g.textAlign = 'left'; g.globalAlpha = 1;
        if (tt >= TITLE_AT + 80) clickHint(tt, 226);
      }
    }
    g.globalAlpha = 1;
  }

  // 「クリック」の補足：ゆっくり点滅する
  function clickHint(t, y){
    g.globalAlpha = 0.45 + 0.45 * Math.sin(t * 0.06); g.fillStyle = '#f2ecd8';
    g.font = '10px DotGothic16, sans-serif'; g.textAlign = 'center'; g.fillText('▶ クリック', 160, y);
    g.textAlign = 'left'; g.globalAlpha = 1;
  }

  // 字幕：ひとことずつ現れて、最後の一行だけ残る
  const SUBS = [
    '雨は、止まなかった。/でも、濡れない場所はあった。',
    '結果は、触れない。/触れたのは、置く場所だけ。',
    '主人公は、何も決めていない。/ただ、いちばん踊っている。',
    '観測はしていない。/たぶん、楽しい。',
    '構造とレコードは、/回り続ける。',
  ];
  const SUB_START = 150, SUB_LEN = 300;
  const TITLE_AT = SUB_START + SUBS.length * SUB_LEN;                 // 最後の字幕のあとに、タイトルが出る
  function subtitle(tt){
    if (tt < SUB_START) return;
    const i = Math.min(SUBS.length - 1, Math.floor((tt - SUB_START) / SUB_LEN)), u = (tt - SUB_START) - i * SUB_LEN;
    let a = ease(u / 30);
    a *= 1 - ease((u - SUB_LEN + 40) / 30);                             // 最後の字幕も、タイトルの前に消える
    if (a <= 0) return;
    const lines = SUBS[i].split('/');
    g.globalAlpha = a * 0.6; g.fillStyle = '#000'; g.fillRect(-200, 205, 720, 16 + lines.length * 14);
    g.globalAlpha = a; g.fillStyle = '#f2ecd8'; g.font = '11px DotGothic16, sans-serif'; g.textAlign = 'center';
    lines.forEach((line, k) => g.fillText(line, 160, 211 + k * 14));
    g.textAlign = 'left'; g.globalAlpha = 1;
  }

  const o_cued = new Set();
  // 最後の絵をタップすると、別タブで開く。最初のタップから、街のにぎやかな音が、ずっと流れる。
  // 「It's Your World」が出たあとにタップすると、このページから2つ目のページへ移る
  overlay.addEventListener('click', () => {
    if (!tapped){
      window.open(LINK, '_blank');
      if (current){ tapped = true; tapAt = current.outro.t; current.cue('townLoop'); }
    } else if (current && current.outro.t - tapAt >= TITLE_AT + 80){
      window.location.href = LINK2;
    }
  });

  return { draw };
};
