// ===== Model：バンド（曲が流れ、指示を出す。曲が終わる／雨が降る） =====
window.Band = (function(){
const OPTIONS = ['もっと大きく', 'テンポを上げて', '今、スクラッチ', 'ここで止めて', '何も言わない'];

// len：曲の長さ（フレーム）／rainAt：雨が降り出すフレーム（なければ null）
function createBand(len, rainAt){
  const B = { t: 0, len, rainAt: rainAt == null ? null : rainAt, sel: 0, options: OPTIONS, ended: false };
  B.update = function(){
    B.t++;
    if (B.rainAt !== null && B.t === B.rainAt) return 'rain';
    if (!B.ended && B.t >= B.len){ B.ended = true; return 'end'; }
    return null;
  };
  return B;
}
return { createBand, OPTIONS };
})();
