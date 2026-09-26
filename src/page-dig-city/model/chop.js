// ===== Model：チョップ（流れる曲の、キック・スネアの瞬間にAで切る） =====
window.Chop = (function(){
const STEPS = 16, PERIOD = 424;                 // 16ステップ＝1周（約7秒）
const MARKS = [0, 4, 7, 12];                    // キック・スネア・キック・スネア
const WINDOW = 0.7;                             // 許容（ステップ）

function createChop(){
  const C = { t: 0, cuts: 0, marks: MARKS };
  C.pos = () => (C.t % PERIOD) / PERIOD * STEPS;
  C.update = () => { C.t++; };
  // 'cut'：1つ切れた／'done'：4つ切れた／'miss'：ずれた（最初から）
  C.press = function(){
    const p = C.pos(), target = MARKS[C.cuts];
    const d = Math.min(Math.abs(p - target), STEPS - Math.abs(p - target));
    if (d > WINDOW){ C.cuts = 0; return 'miss'; }
    return ++C.cuts >= MARKS.length ? 'done' : 'cut';
  };
  return C;
}
return { createChop, STEPS };
})();
