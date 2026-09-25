// ===== 「足あと」⇔「出会いの糸」表示切替 =====
window.Buttons = window.Buttons || {};
window.Buttons.heatToggle = function(ctx){
  ctx.$('heatBtn').addEventListener('click', () => {
    ctx.showHeat = !ctx.showHeat;
    ctx.say(ctx.showHeat ? '昨日、住民が歩いた場所です。色が濃いほど長くいました。' : '線は、昨日出会った住民どうしの家を結んでいます。');
    ctx.renderUI();
  });
};
