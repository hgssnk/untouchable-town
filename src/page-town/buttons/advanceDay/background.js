// ===== 天候の背景色 + グリッド線 =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.background = function(rctx, rain){
  const { N } = window.Sim;
  const { ctx, W, cellPx: c } = rctx;

  ctx.fillStyle = rain ? '#aab39d' : '#b8c39f'; ctx.fillRect(0,0,W,W);
  ctx.strokeStyle = 'rgba(40,55,40,0.08)'; ctx.lineWidth = 1;
  for (let i=1;i<N;i++){ ctx.beginPath(); ctx.moveTo(i*c,0); ctx.lineTo(i*c,W); ctx.moveTo(0,i*c); ctx.lineTo(W,i*c); ctx.stroke(); }
};
