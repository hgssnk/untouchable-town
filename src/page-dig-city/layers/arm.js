// ===== 描画レイヤー：針を落とす（回る盤と、アーム） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.arm = (function(){
const CX = 62, CY = 50, R = 36;

return function arm(r, { arm, tick }){
  const { g, C, W } = r;
  g.fillStyle = C[2]; g.fillRect(0, 0, W, 96);
  g.fillStyle = C[3]; g.beginPath(); g.arc(CX, CY, R, 0, Math.PI*2); g.fill();
  g.strokeStyle = C[2]; g.lineWidth = 1;
  [32, 26, 20].forEach(rr => { g.beginPath(); g.arc(CX, CY, rr, 0, Math.PI*2); g.stroke(); });
  g.fillStyle = C[1]; g.beginPath(); g.arc(CX, CY, 10, 0, Math.PI*2); g.fill();
  const a = tick * 0.12;                                                   // 回っているしるし
  g.fillStyle = C[0]; g.fillRect(Math.round(CX + Math.cos(a)*6) - 1, Math.round(CY + Math.sin(a)*6) - 1, 2, 2);

  const nx = CX + arm.r, ny = CY;                                          // アーム：右上の支点から針の先へ
  g.strokeStyle = C[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(148, 10); g.lineTo(nx, ny); g.stroke();
  g.fillStyle = C[0]; g.fillRect(Math.round(nx) - 2, Math.round(ny) - 2, 4, 4);
  g.fillStyle = C[3]; g.fillRect(144, 6, 10, 10);
};
})();
