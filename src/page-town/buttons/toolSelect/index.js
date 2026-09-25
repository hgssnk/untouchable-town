// ===== ツールパレットのボタン選択（道/ベンチ/灯り/撤去） =====
window.Buttons = window.Buttons || {};
window.Buttons.toolSelect = function(ctx){
  document.querySelectorAll('.tool').forEach(b => b.addEventListener('click', () => {
    ctx.tool = +b.dataset.tool;
    ctx.renderUI();
  }));
};
