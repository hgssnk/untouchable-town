// ===== Model：盤を拭く（Aを押し続けてゲージを満たす） =====
window.Wipe = (function(){
const FRAMES = 80;

function createWipe(){
  const W = { g: 0, active: false, done: false, fired: false };
  W.update = function(held){
    if (!W.active || W.done || !held.has('btnA')) return;
    W.g = Math.min(1, W.g + 1 / FRAMES);
    if (W.g >= 1){ W.done = true; W.active = false; }
  };
  return W;
}
return { createWipe };
})();
