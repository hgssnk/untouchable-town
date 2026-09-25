// ===== 「1日すすめる」ボタン：シミュレーション開始 + アニメーションループ =====
window.Buttons = window.Buttons || {};
window.Buttons.advanceDay = function(ctx){
  const { T, daySeed, simulateDay } = window.Sim;
  const finishDay = window.Buttons._advanceDay.finishDay;

  ctx.$('next').addEventListener('click', () => {
    if (ctx.anim) return;
    const res = simulateDay(ctx.state.layout, daySeed(ctx.state.seed, ctx.state.day));
    ctx.showHeat = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctx.anim = { res, t: 0, start: performance.now(), skip: reduce };
    ctx.say(res.rain ? '雨の一日です。外に出る人が少なくなります。' : '晴れの一日が始まりました。盤面をタップすると飛ばせます。');
    ctx.renderUI();
    const DUR = 5200;
    const loop = now => {
      ctx.anim.t = ctx.anim.skip ? T-1 : Math.min(T-1, (now - ctx.anim.start) / DUR * (T-1));
      ctx.draw();
      if (ctx.anim.t < T-1) requestAnimationFrame(loop); else finishDay(ctx, res);
    };
    requestAnimationFrame(loop);
  });
};
