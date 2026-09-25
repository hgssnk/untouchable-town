// ===== 足あとヒートマップ（直近の1日が終わったら常に表示） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.heatmap = function(rctx, { anim, lastRes }){
  if (anim || !lastRes) return;
  const { N } = window.Sim;
  const { ctx, cellPx: c } = rctx;

  const mx = Math.max(1, ...lastRes.heat);
  lastRes.heat.forEach((h,i) => { if (!h) return; ctx.fillStyle = `rgba(214,120,40,${0.12 + 0.55*h/mx})`; ctx.fillRect((i%N)*c, Math.floor(i/N)*c, c, c); });
};
