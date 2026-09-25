// ===== 「最初からやり直す」リンク =====
window.Buttons = window.Buttons || {};
window.Buttons.reset = function(ctx){
  const { freshState } = window.State;

  ctx.$('reset').addEventListener('click', () => {
    if (ctx.anim) return;
    if (!confirm('街を更地に戻して、1日目からやり直します。')) return;
    ctx.state = freshState(); ctx.lastRes = null;
    ctx.say('道・ベンチ・灯りを置いて、住民どうしが自然に出会う街にしてください。'); ctx.renderUI(); ctx.save();
  });
};
