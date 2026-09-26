// ===== 描画レイヤー：修理（メニューと、4つの作業のアップ） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.repair = (function(){
const { TASKS, BELT_SEQ, SCREWS, BELT_STEPS, WIRES } = window.Repair;
const NAMES = { screw: 'ネジ', belt: 'ベルト', wire: '配線', needle: '針' };
const ARROW = { up: '▲', right: '▶', down: '▼', left: '◀' };

function circle(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI*2); g.fill(); }
// 配線の印（色のかわりに形で見分ける）：0=丸 1=四角 2=三角
function mark(g, i, x, y, col){
  g.fillStyle = col;
  if (i === 0) circle(g, x, y, 4, col);
  else if (i === 1) g.fillRect(x-4, y-4, 8, 8);
  else { g.beginPath(); g.moveTo(x, y-5); g.lineTo(x+5, y+4); g.lineTo(x-5, y+4); g.closePath(); g.fill(); }
}

function menu(r, R){
  const { g, C } = r;
  g.fillStyle = C[3]; g.fillRect(6, 8, 88, 80);                 // トランクの本体
  g.fillStyle = C[1]; g.fillRect(8, 10, 84, 76);
  circle(g, 40, 48, 24, C[3]); circle(g, 40, 48, 16, C[2]); circle(g, 40, 48, 3, C[0]);
  g.fillStyle = C[3]; g.fillRect(74, 16, 3, 40); g.fillRect(70, 52, 8, 3);   // アーム
  [[11,13],[85,13],[11,80],[85,80]].forEach(([x,y],i)=>{
    if (R.done.screw) { g.fillStyle = C[3]; g.fillRect(x, y, 3, 3); } else { g.fillStyle = C[0]; g.fillRect(x, y, 4, 4); }
  });
  g.font = r.font(10); g.textBaseline = 'top'; g.fillStyle = C[0];
  TASKS.forEach((t, i)=>{
    const y = 14 + i*20;
    g.fillText((R.done[t] ? '●' : '○') + NAMES[t], 110, y);
    if (i === R.sel) g.fillText('▶', 99, y);
  });
}

const SUB = {
  screw(r, R){
    const { g, C } = r, s = R.screw;
    g.fillStyle = C[3]; g.fillRect(22, 8, 116, 80); g.fillStyle = C[1]; g.fillRect(24, 10, 112, 76);
    [[36,22],[124,22],[36,74],[124,74]].slice(0, SCREWS).forEach(([x,y],i)=>{
      if (i < s.n){ circle(g, x, y, 3, C[3]); return; }                    // 外したあとの穴
      const cur = i === s.n;
      circle(g, x, y, cur ? 8 : 6, C[0]);
      const a = cur ? s.p * Math.PI * 2 : 0.6;
      g.strokeStyle = C[3]; g.lineWidth = 2; g.beginPath();
      g.moveTo(x - Math.cos(a)*5, y - Math.sin(a)*5); g.lineTo(x + Math.cos(a)*5, y + Math.sin(a)*5); g.stroke();
    });
  },
  belt(r, R, tick){
    const { g, C } = r, b = R.belt;
    const P1 = [44, 46], P2 = [116, 46], RR = 13;
    g.strokeStyle = C[0]; g.lineWidth = 1;
    if (b.phase === 0){                                                    // 伸びて垂れた古いベルト
      g.strokeStyle = C[1]; g.lineWidth = 2;
      g.beginPath(); g.moveTo(P1[0], P1[1]-RR); g.quadraticCurveTo(80, 64, P2[0], P2[1]-RR); g.stroke();
      g.beginPath(); g.moveTo(P1[0], P1[1]+RR); g.quadraticCurveTo(80, 80, P2[0], P2[1]+RR); g.stroke();
    } else {                                                               // 新しいベルトを、少しずつかけていく
      const parts = b.seq / 2;                                             // 0..4：上→右→下→左
      g.strokeStyle = C[0]; g.lineWidth = 2;
      const seg = (n, fn) => { const k = Math.max(0, Math.min(1, parts - n)); if (k > 0) fn(k); };
      seg(0, k => { g.beginPath(); g.moveTo(P1[0], P1[1]-RR); g.lineTo(P1[0] + (P2[0]-P1[0])*k, P1[1]-RR); g.stroke(); });
      seg(1, k => { g.beginPath(); g.arc(P2[0], P2[1], RR, -Math.PI/2, -Math.PI/2 + Math.PI*k); g.stroke(); });
      seg(2, k => { g.beginPath(); g.moveTo(P2[0], P2[1]+RR); g.lineTo(P2[0] - (P2[0]-P1[0])*k, P2[1]+RR); g.stroke(); });
      seg(3, k => { g.beginPath(); g.arc(P1[0], P1[1], RR, Math.PI/2, Math.PI/2 + Math.PI*k); g.stroke(); });
      if (tick % 40 < 28){ g.fillStyle = C[0]; g.font = r.font(12); g.textBaseline = 'top'; g.textAlign = 'center'; g.fillText(ARROW[BELT_SEQ[b.seq % 4]], 80, 40); g.textAlign = 'left'; }
    }
    [P1, P2].forEach(([x,y])=>{
      circle(g, x, y, 10, C[3]); circle(g, x, y, 3, C[0]);
      const a = b.seq * Math.PI / 4;
      g.strokeStyle = C[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a)*9, y + Math.sin(a)*9); g.stroke();
    });
  },
  wire(r, R, tick){
    const { g, C } = r, w = R.wire, ys = [20, 46, 72];
    g.fillStyle = C[3]; g.fillRect(20, 6, 120, 84);
    for (let i = 0; i < WIRES; i++){
      mark(g, i, 34, ys[i], C[i === w.k && tick % 30 < 20 ? 0 : 1]);              // 外れた線の端
      mark(g, w.order[i], 126, ys[i], C[0]);                                     // 右の端子
      if (w.order[i] < w.k){                                                    // つないだ線
        const from = w.order[i];
        g.strokeStyle = C[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(40, ys[from]); g.lineTo(120, ys[i]); g.stroke();
      }
    }
    g.fillStyle = C[0]; g.font = r.font(10); g.textBaseline = 'top';
    g.fillText('▶', 106 + (R.flash > 0 ? 3 : 0), ys[w.cursor] - 6);
  },
  needle(r, R, tick){
    const { g, C } = r, n = R.needle;
    g.fillStyle = C[3]; g.fillRect(66, 8, 28, 14);                            // カートリッジ
    g.fillStyle = C[3]; g.fillRect(20, 70, 120, 14);                          // 盤の断面
    g.fillStyle = C[1]; g.fillRect(20, 70, 120, 1);
    if (n.phase === 0){                                                       // 古い針：先が丸い
      g.fillStyle = C[1]; g.fillRect(79, 22, 2, 34); circle(g, 80, 58, 3, C[1]);
    } else {
      const a = Math.sin(n.t * 0.09) * 0.5;
      const tx = 80 + Math.sin(a) * 44, ty = 22 + Math.cos(a) * 44;
      g.strokeStyle = C[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(80, 22); g.lineTo(80, 68); g.stroke();
      g.strokeStyle = C[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(80, 22); g.lineTo(tx, ty); g.stroke();
      g.fillStyle = C[0]; g.fillRect(Math.round(tx) - 1, Math.round(ty) - 1, 3, 3);
    }
  },
};

return function repair(r, { R, tick }){
  const { g, C, W } = r;
  g.fillStyle = C[2]; g.fillRect(0, 0, W, 96);
  if (!R.task) menu(r, R); else SUB[R.task](r, R, tick);
};
})();
