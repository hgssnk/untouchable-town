// ===== 描画レイヤー：ディグ（箱の中のレコードを正面から見る） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.dig = (function(){
const S = 64, Y = 12, CX = 48;

// 番号ごとに決まる、でたらめなジャケット
function sleeve(r, idx, x, plain){
  const { g, C } = r;
  g.fillStyle = C[3]; g.fillRect(x-1, Y-1, S+2, S+2);
  if (plain){ g.fillStyle = C[0]; g.fillRect(x, Y, S, S); return; }   // 当たり：ラベルもジャケットもない
  let s = (idx + 1) * 2654435761 % 4294967296;
  const rnd = n => { s = (s * 1664525 + 1013904223) % 4294967296; return Math.floor(s / 65536) % n; };
  g.fillStyle = C[rnd(3)]; g.fillRect(x, Y, S, S);
  for (let k=0;k<3;k++){
    g.fillStyle = C[rnd(4)];
    g.fillRect(x + rnd(40), Y + rnd(40), 8 + rnd(24), 8 + rnd(24));
  }
}

return function dig(r, { dig, tick }){
  const { g, C, W } = r;
  g.fillStyle = C[2]; g.fillRect(0,0,W,96);
  for (let k=3;k>=1;k--){
    if (dig.i - k >= 0) sleeve(r, dig.i - k, CX - 14*k, false);
    if (dig.i + k < dig.n) sleeve(r, dig.i + k, CX + 14*k, false);
  }
  sleeve(r, dig.i, CX, dig.i === dig.hit);

  g.fillStyle = C[0]; g.font = r.font(10); g.textBaseline = 'top'; g.textAlign = 'center';
  g.fillText(`${dig.i + 1} / ${dig.n}`, W/2, 80);
  if (tick % 60 < 40){
    if (dig.i > 0) g.fillText('◀', 12, 36);
    if (dig.i < dig.n - 1) g.fillText('▶', W - 12, 36);
  }
  g.textAlign = 'left';
};
})();
