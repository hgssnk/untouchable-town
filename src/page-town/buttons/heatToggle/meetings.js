// ===== 出会いの糸（家同士を結ぶ曲線） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.meetings = function(rctx, { anim, tick, lastRes, showHeat }){
  const { HOMES } = window.Sim;
  const { ctx, center, COLORS, cellPx: c } = rctx;

  const meets = anim ? anim.res.meets.filter(m => m.t <= tick) : (lastRes && !showHeat ? lastRes.meets : []);
  meets.forEach(m => {
    const ha = HOMES[m.a], hb = HOMES[m.b];
    const [ax, ay] = center(ha.x, ha.y), [bx, by] = center(hb.x, hb.y), [mx, my] = center(m.x, m.y);
    const age = anim ? tick - m.t : 99;
    ctx.save();
    ctx.globalAlpha = anim ? Math.min(0.55, age/6) : 0.7;
    ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    const grad = ctx.createLinearGradient(ax,ay,bx,by); grad.addColorStop(0, COLORS[m.a]); grad.addColorStop(1, COLORS[m.b]);
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.quadraticCurveTo(mx*2 - (ax+bx)/2, my*2 - (ay+by)/2, bx, by); ctx.stroke();
    ctx.restore();
    if (anim && age < 5){ ctx.beginPath(); ctx.arc(mx, my, c*(0.25 + age*0.12), 0, Math.PI*2); ctx.strokeStyle = `rgba(255,236,170,${1-age/5})`; ctx.lineWidth = 2; ctx.stroke(); }
  });
};
