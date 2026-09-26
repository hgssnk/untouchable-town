// ===== Model：ディグ（箱のレコードを1枚ずつめくる） =====
window.Dig = (function(){
function createDig(rng, n){
  const D = { n, i: 0, hit: 1 + Math.floor(rng() * (n - 1)), noticed: false };   // 当たりの位置は毎回ランダム

  // めくる。当たりに初めて止まったとき true
  D.move = function(d){
    D.i = Math.max(0, Math.min(n - 1, D.i + d));
    if (D.i === D.hit && !D.noticed){ D.noticed = true; return true; }
    return false;
  };
  D.pick = () => D.i === D.hit ? 'hit' : 'junk';
  return D;
}
return { createDig };
})();
