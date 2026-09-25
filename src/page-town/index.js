// ===== 「町」ページの起動：ctx組み立て・各buttonsの配線 =====
(function(){
const cv = document.getElementById('cv');
const renderer = createRenderer(cv);
const ctx = createCtx(cv, renderer);

window.Buttons.toolSelect(ctx);
window.Buttons.boardPlacement(ctx);
window.Buttons.heatToggle(ctx);
window.Buttons.reset(ctx);
window.Buttons.advanceDay(ctx);

window.addEventListener('resize', ctx.resize);
if (ctx.lastRes) ctx.say('前回の続きです。線は、前日に出会った住民どうしの家を結んでいます。');
ctx.resize(); ctx.renderUI();
})();
