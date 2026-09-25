// ===== 盤面タップで今日の1手を置く/撤去する =====
window.Buttons = window.Buttons || {};
window.Buttons.boardPlacement = function(ctx){
  const { N, HOUSE } = window.Sim;

  ctx.cv.addEventListener('pointerdown', e => {
    if (ctx.anim){ ctx.anim.skip = true; return; }
    const r = ctx.cv.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / (r.width / N)), y = Math.floor((e.clientY - r.top) / (r.height / N));
    if (x<0||y<0||x>=N||y>=N) return;
    const i = y*N + x, cur = ctx.state.layout[i];
    if (cur === HOUSE){ ctx.say('家は動かせません。'); return; }
    if (ctx.state.action){
      if (ctx.state.action.x === x && ctx.state.action.y === y){
        ctx.state.layout[i] = ctx.tool; ctx.state.action.next = ctx.tool;
        if (ctx.state.layout[i] === ctx.state.action.prev){ ctx.state.action = null; }
        ctx.renderUI(); ctx.save(); return;
      }
      ctx.say('今日の1手はもう使いました。1日すすめてください。'); return;
    }
    if (cur === ctx.tool){ ctx.say(ctx.tool === 0 ? 'そこには何もありません。' : `そこにはもう${ctx.TOOLNAME[ctx.tool]}があります。`); return; }
    ctx.state.action = {x, y, prev: cur, next: ctx.tool};
    ctx.state.layout[i] = ctx.tool;
    ctx.showHeat = false;
    ctx.say(ctx.tool === 0 ? `(${x+1}, ${y+1}) を更地にしました。` : `(${x+1}, ${y+1}) に${ctx.TOOLNAME[ctx.tool]}を置きました。`);
    ctx.renderUI(); ctx.save();
  });
};
