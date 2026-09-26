// ===== 描画レイヤー：歩く街（マップ・オブジェクト・主人公） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.walk = (function(){
const { T, STEP } = window.Walk;

return function walk(r, { me, late, note, tick }){
  const { g, C } = r, map = me.map;
  const floor = late ? C[2] : C[1];
  for (let y=0;y<map.rows.length;y++) for (let x=0;x<map.rows[y].length;x++){
    const c = map.rows[y][x];
    g.fillStyle = c === '#' ? C[3] : floor;
    g.fillRect(x*T, y*T, T, T);
    if (c === '#' && (x*3 + y*5) % 4 === 0){ g.fillStyle = C[2]; g.fillRect(x*T+5, y*T+4, 5, 6); }
  }
  map.steps.forEach(s => window.RenderLayers.objects(r, s.id, s.x*T, s.y*T));
  map.objects.forEach(o => window.RenderLayers.objects(r, o.id, o.x*T, o.y*T));

  const k = me.t ? (STEP - me.t) / STEP : 0;
  const px = (me.x + me.fx*k) * T, py = (me.y + me.fy*k) * T;
  g.fillStyle = C[3]; g.fillRect(px+4, py+5, 8, 10);      // からだ
  g.fillStyle = late ? C[1] : C[2]; g.fillRect(px+4, py+2, 8, 5);   // あたま
  g.fillStyle = C[0];                                     // かお（向き）
  const eye = { up:null, down:[6,4], left:[5,4], right:[9,4] }[me.face];
  if (eye) g.fillRect(px+eye[0], py+eye[1], 2, 2);

  if (note && tick % 50 < 35){                            // 聞こえる音
    g.fillStyle = C[0]; g.font = r.font(10); g.textBaseline = 'top';
    g.fillText('♪', note.x*T + 3, note.y*T - 12);
  }
};
})();
