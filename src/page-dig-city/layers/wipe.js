// ===== 描画レイヤー：盤を拭く（ホコリがゲージに合わせて消える） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.wipe = (function(){
const CX = 80, CY = 46, R = 36, DUST = 160;

// ホコリの位置は固定（番号順に消える）
const dust = (function(){
  let s = 12345; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  return Array.from({ length: DUST }, () => { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (R - 2); return [CX + Math.cos(a)*d, CY + Math.sin(a)*d, rnd() < .5]; });
})();

return function wipe(r, { wipe }){
  const { g, C, W } = r;
  g.fillStyle = C[2]; g.fillRect(0,0,W,96);
  g.fillStyle = C[3]; g.beginPath(); g.arc(CX, CY, R, 0, Math.PI*2); g.fill();

  g.strokeStyle = C[2]; g.lineWidth = 1;
  [30, 24, 18].forEach(rr => { g.beginPath(); g.arc(CX, CY, rr, 0, Math.PI*2); g.stroke(); });
  g.fillStyle = C[1]; g.beginPath(); g.arc(CX, CY, 10, 0, Math.PI*2); g.fill();
  g.fillStyle = C[0]; g.fillRect(CX-1, CY-1, 2, 2);

  dust.forEach(([x,y,big], j)=>{
    if (j / DUST < wipe.g) return;
    g.fillStyle = C[1]; g.fillRect(Math.round(x), Math.round(y), big ? 3 : 2, big ? 2 : 1);
  });
  if (wipe.done){                                          // 溝が光る
    g.strokeStyle = C[0]; g.beginPath(); g.arc(CX, CY, 30, -2.7, -1.8); g.stroke();
    g.beginPath(); g.arc(CX, CY, 24, 0.4, 1.2); g.stroke();
  }

  g.strokeStyle = C[0]; g.strokeRect(40.5, 86.5, 79, 6);   // ゲージ
  g.fillStyle = C[0]; g.fillRect(42, 88, Math.round(76 * wipe.g), 3);
};
})();
