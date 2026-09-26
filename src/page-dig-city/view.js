// ===== View：描画の起点：共有描画コンテキスト(rctx)の組み立て・モードごとの描画 =====
window.createRenderer = (function(){

// 場面転換：パレット内で暗くする（4段階のディザ → 全面）
function createFadePatterns(g){
  const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  return [1,2,3].map(level=>{
    const c = document.createElement('canvas'); c.width = c.height = 4;
    const x = c.getContext('2d'); x.fillStyle = '#0f380f';
    BAYER.forEach((v,i)=>{ if (v < level*4) x.fillRect(i%4, Math.floor(i/4), 1, 1); });
    return g.createPattern(c, 'repeat');
  });
}

function createRenderer(canvas){
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;

  const rctx = {
    g, W: 160, H: 144,
    C: ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'],   // 明 → 暗
    font: px => `${px}px DotGothic16, monospace`,
  };
  const fades = createFadePatterns(g);

  function centered(text, y, px){
    const { g, C, W } = rctx;
    g.fillStyle = C[0]; g.font = rctx.font(px); g.textAlign = 'center';
    g.fillText(text, W/2, y);
    g.textAlign = 'left';
  }

  // 雨：斜めの細い線
  function rain(tick){
    const { g, C } = rctx;
    g.fillStyle = C[0];
    for (let i = 0; i < 40; i++){
      const x = (i * 37 + tick * 3) % 176 - 8, y = (i * 53 + tick * 6) % 160 - 8;
      g.fillRect(x, y, 1, 4);
    }
  }

  function draw(game){
    const { g, C, W, H } = rctx, L = window.RenderLayers, talk = game.talk;
    g.fillStyle = C[0]; g.fillRect(0,0,W,H);
    g.textBaseline = 'top';

    if (game.mode === 'title'){
      L.city(rctx, { shopLit: false });
      centered('ディグ・シティ', 30, 16);
      if (game.canWatch){
        centered('はじめる', 104, 10); centered('眺める', 118, 10);
        g.fillStyle = C[0]; g.font = rctx.font(10); g.textAlign = 'left'; g.fillText('▶', 48, 104 + game.titleSel * 14);
      } else if (game.tick % 60 < 40) centered('PRESS  A', 118, 10);
    } else if (game.mode === 'still'){
      L.city(rctx, { shopLit: !!(talk && talk.cur && talk.cur.shop) });
    } else if (game.mode === 'walk'){
      L.walk(rctx, { me: game.walker.me, late: !!game.flags.late, note: game.note, tick: game.tick });
    } else if (game.mode === 'dig'){
      L.dig(rctx, { dig: game.dig, tick: game.tick });
    } else if (game.mode === 'wipe'){
      L.wipe(rctx, { wipe: game.wipe });
    } else if (game.mode === 'repair'){
      L.repair(rctx, { R: game.repair, tick: game.tick });
    } else if (game.mode === 'arm'){
      L.arm(rctx, { arm: game.arm, tick: game.tick });
    } else if (game.mode === 'chop'){
      L.chop(rctx, { chop: game.chop });
    } else if (game.mode === 'band'){
      L.band(rctx, { band: game.band, tick: game.tick, talking: !!talk });
    } else if (game.mode === 'cover'){
      L.cover(rctx, { wipe: game.wipe });
    } else {
      g.fillStyle = C[3]; g.fillRect(0,0,W,H);
      centered(game.ch.title, 52, 12);
      centered('おわり', 78, 10);
    }

    if (game.flags.rain && ['walk','band','cover'].includes(game.mode)) rain(game.tick);
    if (game.credits){                                         // スタッフロール
      const cr = game.credits, y0 = 144 - cr.t * 0.2;
      g.font = rctx.font(10); g.textAlign = 'center';
      cr.lines.forEach((line, i)=>{
        if (!line) return;
        const y = y0 + i * 14;
        if (y < -12 || y > 144) return;
        const w = line.length * 10 + 8;
        g.fillStyle = C[3]; g.fillRect(80 - w/2, y - 1, w, 12);
        g.fillStyle = C[0]; g.fillText(line, 80, y);
      });
      g.textAlign = 'left';
    }
    if (game.hud && game.mode === 'walk'){                     // 画面の隅の時計
      g.fillStyle = C[0]; g.fillRect(116, 2, 42, 12);
      g.strokeStyle = C[3]; g.strokeRect(116.5, 2.5, 41, 11);
      g.fillStyle = C[3]; g.font = rctx.font(9); g.textAlign = 'center'; g.fillText(game.hud, 137, 4); g.textAlign = 'left';
    }
    if (talk) L.textbox(rctx, { talk, tick: game.tick });

    if (game.menu){                                            // STARTボタン：章えらび
      g.fillStyle = C[0]; g.fillRect(20,16,120,112);
      g.strokeStyle = C[3]; g.lineWidth = 1; g.strokeRect(20.5,16.5,119,111);
      g.strokeStyle = C[2]; g.strokeRect(22.5,18.5,115,107);
      g.fillStyle = C[3]; g.font = rctx.font(10); g.textBaseline = 'top';
      const items = game.menuItems(), gap = items.length > 5 ? 13 : 16;
      items.forEach((t,i)=>{
        g.fillText(t, 44, 24 + i*gap);
        if (i === game.menu.sel) g.fillText('▶', 30, 24 + i*gap);
      });
    }

    const lv = game.fadeLevel();
    if (lv > 0){
      g.fillStyle = lv >= 4 ? C[3] : fades[lv - 1];
      g.fillRect(0,0,W,H);
    }
  }

  return { draw };
}

return createRenderer;
})();
