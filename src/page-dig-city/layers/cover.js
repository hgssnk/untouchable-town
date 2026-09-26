// ===== 描画レイヤー：盤を守る（雨の中、シャツをかぶせる） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.cover = function cover(r, { wipe }){
  const { g, C, W } = r, CX = 80, CY = 46, R = 36;
  g.fillStyle = C[2]; g.fillRect(0, 0, W, 96);
  g.fillStyle = C[3]; g.beginPath(); g.arc(CX, CY, R, 0, Math.PI*2); g.fill();
  g.fillStyle = C[1]; g.beginPath(); g.arc(CX, CY, 10, 0, Math.PI*2); g.fill();
  const h = Math.round((R * 2 + 6) * wipe.g);                              // シャツが下りてくる
  g.fillStyle = C[1]; g.fillRect(CX - R - 4, CY - R - 3, R * 2 + 8, h);
  g.fillStyle = C[0]; g.fillRect(CX - R - 4, CY - R - 3 + h - 2, R * 2 + 8, 2);
  g.strokeStyle = C[0]; g.lineWidth = 1; g.strokeRect(40.5, 86.5, 79, 6);   // ゲージ
  g.fillStyle = C[0]; g.fillRect(42, 88, Math.round(76 * wipe.g), 3);
};
