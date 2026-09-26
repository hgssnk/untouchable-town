// ===== 描画レイヤー：チョップ（波形・キックとスネアの印・流れる再生位置） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.chop = (function(){
const { STEPS } = window.Chop;

return function chop(r, { chop }){
  const { g, C, W } = r;
  g.fillStyle = C[2]; g.fillRect(0, 0, W, 96);

  // 波形：印のところは高く、そのほかは低い
  const px = W / STEPS;
  for (let i = 0; i < STEPS; i++){
    const hit = chop.marks.includes(i);
    const h = hit ? 34 : 6 + ((i * 7) % 5) * 3;
    g.fillStyle = hit ? C[1] : C[3];
    g.fillRect(Math.round(i * px) + 1, 48 - h/2, Math.round(px) - 2, h);
  }
  // 切る印（切れたものは塗りつぶし）
  chop.marks.forEach((m, i) => {
    const x = Math.round((m + 0.5) * px);
    g.fillStyle = i < chop.cuts ? C[0] : C[3];
    g.fillRect(x - 3, 78, 7, 7);
    g.strokeStyle = C[0]; g.lineWidth = 1; g.strokeRect(x - 2.5, 78.5, 6, 6);
  });
  // 再生位置
  const x = Math.round(chop.pos() * px);
  g.fillStyle = C[0]; g.fillRect(x, 8, 2, 76);
};
})();
