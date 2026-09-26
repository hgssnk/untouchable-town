// ===== 描画レイヤー：会話ウィンドウ（文字送り・話す人・続きの矢印・選択肢） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.textbox = function textbox(r, { talk, tick }){
  const { g, C } = r, cur = talk.cur;
  g.textBaseline = 'top';

  g.fillStyle = C[0]; g.fillRect(4,96,152,44);
  g.strokeStyle = C[3]; g.lineWidth = 1; g.strokeRect(4.5,96.5,151,43);
  g.strokeStyle = C[2]; g.strokeRect(6.5,98.5,147,39);

  if (cur.who){                                            // 話す人の名札
    const w = cur.who.length * 10 + 10;
    g.fillStyle = C[0]; g.fillRect(8,85,w,12);
    g.strokeStyle = C[3]; g.strokeRect(8.5,85.5,w-1,11);
    g.fillStyle = C[3]; g.font = r.font(9); g.fillText(cur.who, 13, 87);
  }

  g.fillStyle = C[3]; g.font = r.font(10);
  cur.t.slice(0, talk.shown).split('\n').forEach((line,i)=> g.fillText(line, 11, 104 + i*14));

  if (talk.choice){
    const opts = talk.choice.opts, n = opts.length;
    const w = Math.max(...opts.map(o => o.length)) * 10 + 34, h = n * 14 + 6, x = 156 - w, y = 94 - h;
    g.fillStyle = C[0]; g.fillRect(x, y, w, h);
    g.strokeStyle = C[3]; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    g.fillStyle = C[3];
    opts.forEach((o,i)=>{
      g.fillText(o, x + 22, y + 4 + i*14);
      if (i === talk.choice.sel) g.fillText('▶', x + 8, y + 4 + i*14);
    });
  } else if (talk.shown >= cur.t.length && tick % 40 < 24){
    g.fillStyle = C[3]; g.fillRect(146,130,7,2); g.fillRect(147,132,5,2); g.fillRect(148,134,3,1);
  }
};
