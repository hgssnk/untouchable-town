// ===== 1日の締め処理：結果の判定・ログ/連続記録の更新・案内文の組み立て =====
window.Buttons = window.Buttons || {};
window.Buttons._advanceDay = window.Buttons._advanceDay || {};
window.Buttons._advanceDay.finishDay = function(ctx, res){
  const { TARGET, CLEAR_DAYS } = window.Sim;

  ctx.anim = null; ctx.lastRes = res;
  const ok = res.encounters >= TARGET, touched = !!ctx.state.action;
  const a = ctx.state.action;
  const what = !a ? '何もしなかった' : (a.next === 0 ? `(${a.x+1}, ${a.y+1}) を撤去` : `(${a.x+1}, ${a.y+1}) に${ctx.TOOLNAME[a.next]}`);
  ctx.state.log.push(`<strong>${ctx.state.day}日目</strong> ${res.rain ? '雨' : '晴れ'}、出会い ${res.encounters}組${ok ? '(達成)' : ''}。${what}。`);
  if (ctx.state.log.length > 60) ctx.state.log.shift();
  let text;
  if (touched){ ctx.state.window = []; }
  else {
    ctx.state.window.push(ok);
    if (ctx.state.window.length > CLEAR_DAYS) ctx.state.window.shift();
  }
  const wins = ctx.state.window.filter(Boolean).length;
  if (!touched && ctx.state.window.length === CLEAR_DAYS && wins >= 4 && !ctx.state.cleared){
    ctx.state.cleared = true;
    text = `<b>7日間、何も触らずに街が回りました。</b>無意識的フローに到達です。このまま眺め続けても、もっと良い街を目指しても構いません。`;
  } else if (touched){
    text = `出会いは ${res.encounters}組${ok ? '、目標達成です' : ''}。手を加えたので、触らなかった日の記録は0から数え直しです。`;
  } else {
    text = `出会いは ${res.encounters}組${ok ? '、目標達成です' : `。目標まであと${TARGET - res.encounters}組`}。触らなかった日が ${ctx.state.window.length}日続いています。`;
    if (ctx.state.window.length === CLEAR_DAYS && wins < 4) text += ' 直近7日の達成は4日に届いていません。';
  }
  ctx.state.action = null; ctx.state.day++;
  ctx.say(text); ctx.renderUI(); ctx.save();
};
