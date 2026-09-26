// ===== 描画レイヤー：バンド（公園の街灯の下。ミオとケンと主人公、指示のメニュー） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.band = function band(r, { band, tick, talking }){
  const { g, C, W } = r, O = window.RenderLayers.objects;
  g.fillStyle = C[3]; g.fillRect(0, 0, W, 96);
  g.fillStyle = C[1]; g.beginPath(); g.moveTo(80, 6); g.lineTo(38, 74); g.lineTo(122, 74); g.closePath(); g.fill();   // 街灯の光
  g.fillStyle = C[2]; g.fillRect(0, 62, W, 34);                                                                       // 地面
  O(r, 'lamp', 72, 8);
  O(r, 'mio', 44, 46); O(r, 'ken', 100, 46);
  g.fillStyle = C[3]; g.fillRect(76, 52, 8, 10); g.fillStyle = C[2]; g.fillRect(76, 49, 8, 5);   // 主人公
  g.fillStyle = C[0]; g.fillRect(76, 62, 8, 2);                                                    // プレーヤー
  const bob = tick % 30 < 15 ? 0 : 1;                                                              // 音に合わせて揺れる
  g.fillStyle = C[0]; g.fillRect(50, 44 - bob, 2, 2); g.fillRect(106, 44 - bob, 2, 2);

  if (talking) return;
  g.fillStyle = C[0]; g.fillRect(4, 70, 152, 70);
  g.strokeStyle = C[3]; g.lineWidth = 1; g.strokeRect(4.5, 70.5, 151, 69);
  g.font = r.font(10); g.textBaseline = 'top'; g.fillStyle = C[3];
  band.options.forEach((o, i) => {
    g.fillText(o, 24, 76 + i * 12);
    if (i === band.sel) g.fillText('▶', 12, 76 + i * 12);
  });
};
