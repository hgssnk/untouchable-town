// ===== Controller：入力をモデル更新に繋ぐ共有コンテキスト(ctx)の組み立て + DOM同期ヘルパー =====
window.createCtx = function(cv, renderer){
  const { CLEAR_DAYS } = window.Sim;
  const { freshState, loadState, saveState } = window.State;
  const $ = id => document.getElementById(id);

  let S = loadState() || freshState();
  const TOOLNAME = {0:'撤去', 1:'道', 2:'ベンチ', 3:'灯り'};

  const ctx = {
    cv, $, renderer, TOOLNAME,
    get state(){ return S; }, set state(v){ S = v; },
    tool: 1, anim: null, lastRes: S.lastRes || null,
  };

  ctx.save = function(){
    S.lastRes = ctx.lastRes ? {meets:ctx.lastRes.meets, heat:ctx.lastRes.heat, rain:ctx.lastRes.rain, encounters:ctx.lastRes.encounters} : null;
    saveState(S);
  };

  ctx.draw = function(){
    renderer.draw({ layout: S.layout, action: S.action, anim: ctx.anim, lastRes: ctx.lastRes });
  };

  ctx.resize = function(){
    renderer.resize();
    ctx.draw();
  };

  ctx.renderUI = function(){
    $('day').textContent = `${S.day}日目`;
    const dots = $('dots'); dots.innerHTML = '';
    for (let i=0;i<CLEAR_DAYS;i++){ const d = document.createElement('i'); const w = S.window[i]; if (w !== undefined) d.className = w ? 'ok' : 'ng'; dots.appendChild(d); }
    $('dots').setAttribute('aria-label', `触らなかった日 ${S.window.length}日、うち達成 ${S.window.filter(Boolean).length}日`);
    const busy = !!ctx.anim;
    document.querySelectorAll('.tool').forEach(b => { b.setAttribute('aria-pressed', String(+b.dataset.tool === ctx.tool)); b.disabled = busy; });
    $('next').disabled = busy;
    $('next').textContent = S.action ? '1日すすめる' : '何もせずに1日すすめる';
    const log = $('log'); log.innerHTML = '';
    S.log.slice().reverse().forEach(e => { const li = document.createElement('li'); li.innerHTML = e; log.appendChild(li); });
    if (!S.log.length){ const li = document.createElement('li'); li.textContent = 'まだ一日も過ぎていません。'; log.appendChild(li); }
    ctx.draw();
  };

  ctx.say = h => $('msg').innerHTML = h;

  return ctx;
};
