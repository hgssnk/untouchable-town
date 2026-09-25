// ===== 夜の照明オーバーレイ（灯りの周りだけ明るくする合成処理） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.night = function(rctx, { layout, nightA }){
  if (nightA <= 0) return;
  const { N, LAMP } = window.Sim;
  const { ctx, canvas, shade, sctx, W, cellPx: c, center } = rctx;

  shade.width = canvas.width; shade.height = canvas.height;
  const dpr = canvas.width / W; sctx.setTransform(dpr,0,0,dpr,0,0);
  sctx.globalCompositeOperation = 'source-over';
  sctx.fillStyle = `rgba(18,26,48,${nightA})`; sctx.fillRect(0,0,W,W);
  sctx.globalCompositeOperation = 'destination-out';
  layout.forEach((v,i) => { if (v !== LAMP) return; const [lx,ly] = center(i%N, Math.floor(i/N));
    const g = sctx.createRadialGradient(lx,ly,0,lx,ly,c*2.6); g.addColorStop(0,'rgba(0,0,0,0.95)'); g.addColorStop(0.7,'rgba(0,0,0,0.6)'); g.addColorStop(1,'rgba(0,0,0,0)');
    sctx.fillStyle = g; sctx.beginPath(); sctx.arc(lx,ly,c*2.6,0,Math.PI*2); sctx.fill(); });
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(shade,0,0); ctx.restore();
};
