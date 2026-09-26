// ===== Model：針を落とす（アームを動かし、盤の縁の少し内側で落とす） =====
window.Arm = (function(){
const R_MAX = 46, R_MIN = 6, EDGE = 36, OK_MIN = 29;

function createArm(){
  const A = { r: R_MAX };
  A.reset = () => { A.r = R_MAX; };
  A.update = function(held){
    if (held.has('left')) A.r = Math.max(R_MIN, A.r - 0.6);
    if (held.has('right')) A.r = Math.min(R_MAX, A.r + 0.6);
  };
  // 'out'=縁の外 'in'=内側すぎ 'ok'
  A.press = () => A.r > EDGE - 1 ? 'out' : A.r < OK_MIN ? 'in' : 'ok';
  return A;
}

return { createArm, EDGE };
})();
