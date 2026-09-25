// ===== 道/ベンチ/灯り/家のタイル描画 + 今日の1手の選択枠 =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.tiles = function(rctx, { layout, action, nightA }){
  const { N, PATH, BENCH, LAMP, HOUSE, HOMES } = window.Sim;
  const { ctx, cellPx, roundRect, COLORS } = rctx;

  function drawTile(v, x, y){
    const c = cellPx, px = x*c, py = y*c;
    if (v === PATH){ ctx.fillStyle = '#d9d0b6'; roundRect(px+2, py+2, c-4, c-4, c*0.18); ctx.fill(); }
    if (v === BENCH){
      ctx.fillStyle = '#7b5639';
      ctx.fillRect(px+c*0.18, py+c*0.42, c*0.64, c*0.14);
      ctx.fillRect(px+c*0.18, py+c*0.26, c*0.64, c*0.08);
      ctx.fillRect(px+c*0.24, py+c*0.56, c*0.06, c*0.16); ctx.fillRect(px+c*0.70, py+c*0.56, c*0.06, c*0.16);
    }
    if (v === LAMP){
      ctx.fillStyle = '#3d403c'; ctx.fillRect(px+c*0.47, py+c*0.3, c*0.06, c*0.5);
      ctx.fillStyle = '#3d403c'; ctx.fillRect(px+c*0.36, py+c*0.78, c*0.28, c*0.06);
      ctx.beginPath(); ctx.arc(px+c/2, py+c*0.28, c*0.12, 0, Math.PI*2);
      ctx.fillStyle = nightA > 0.1 ? '#ffd46b' : '#e9e2c4'; ctx.fill();
    }
    if (v === HOUSE){
      const id = HOMES.findIndex(h => h.x===x && h.y===y);
      ctx.fillStyle = '#f1ece0'; ctx.fillRect(px+c*0.2, py+c*0.45, c*0.6, c*0.4);
      ctx.fillStyle = COLORS[id];
      ctx.beginPath(); ctx.moveTo(px+c*0.12, py+c*0.47); ctx.lineTo(px+c*0.5, py+c*0.14); ctx.lineTo(px+c*0.88, py+c*0.47); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5b4a3a'; ctx.fillRect(px+c*0.44, py+c*0.62, c*0.12, c*0.23);
    }
  }

  layout.forEach((v,i) => drawTile(v, i%N, Math.floor(i/N)));
  if (action){ const a = action, c = cellPx; ctx.strokeStyle = '#243029'; ctx.setLineDash([4,3]); ctx.lineWidth = 1.5; ctx.strokeRect(a.x*c+1.5, a.y*c+1.5, c-3, c-3); ctx.setLineDash([]); }
};
