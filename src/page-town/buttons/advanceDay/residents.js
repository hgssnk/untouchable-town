// ===== 住民の移動アニメーション + 雨エフェクト =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.residents = function(rctx, { anim, tick, rain }){
  if (!anim) return;
  const { ctx, cellPx: c, center, COLORS, W } = rctx;

  const fr = anim.res.frames, i0 = Math.max(0, Math.min(fr.length-1, Math.floor(tick))), i1 = Math.min(fr.length-1, i0+1), f = tick - Math.floor(tick);
  fr[i0].forEach((r0, id) => {
    const r1 = fr[i1][id]; if (!r0.vis && !r1.vis) return;
    const x = r0.x + (r1.x - r0.x)*f, y = r0.y + (r1.y - r0.y)*f;
    const [cx, cy] = center(x, y);
    ctx.beginPath(); ctx.arc(cx, cy - (r0.sit ? c*0.12 : 0), c*0.2, 0, Math.PI*2);
    ctx.fillStyle = COLORS[id]; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#f7f5ee'; ctx.stroke();
  });
  if (rain){ ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; const off = (tick*9)%W;
    for (let k=0;k<40;k++){ const x = (k*97 % W), y = ((k*53 + off) % W); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-3,y+9); ctx.stroke(); } }
};
