// ===== View：描画の起点：共有描画コンテキスト(rctx)の組み立て・resize・draw =====
window.createRenderer = (function(){
const { N, T, NIGHT } = window.Sim;

function createRenderer(canvas){
  const shade = document.createElement('canvas');

  const rctx = {
    ctx: canvas.getContext('2d'),
    canvas, shade, sctx: shade.getContext('2d'),
    W: 0, cellPx: 0,
    COLORS: ['#c4553b','#3574a0','#8a5cb0','#c9951a','#2e8a66'],
  };
  rctx.roundRect = function(x,y,w,h,r){ const { ctx } = rctx; ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); };
  rctx.center = (x,y) => [x*rctx.cellPx + rctx.cellPx/2, y*rctx.cellPx + rctx.cellPx/2];

  function resize(){
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    rctx.W = r.width; rctx.cellPx = rctx.W / N;
    canvas.width = Math.round(rctx.W*dpr); canvas.height = Math.round(rctx.W*dpr);
    rctx.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function draw(view){
    if (!rctx.W) return;
    const { layout, action, anim, lastRes } = view;
    const tick = anim ? anim.t : -1;
    const nightA = anim ? Math.max(0, Math.min(0.62, (tick - (NIGHT-6)) / 10 * 0.62)) * (tick > T-3 ? Math.max(0,(T-tick)/3) : 1) : 0;
    const rain = anim ? anim.res.rain : false;

    window.RenderLayers.background(rctx, rain);
    window.RenderLayers.heatmap(rctx, { anim, lastRes });
    window.RenderLayers.tiles(rctx, { layout, action, nightA });
    window.RenderLayers.residents(rctx, { anim, tick, rain });
    window.RenderLayers.night(rctx, { layout, nightA });
  }

  return { resize, draw };
}

return createRenderer;
})();
