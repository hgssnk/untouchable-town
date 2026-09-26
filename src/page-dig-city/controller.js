// ===== Controller：キーボード・画面ボタンの入力をゲームに繋ぐ =====
window.createInput = function(cv, game){
  const held = new Set();     // 押されている方向キーと、Aボタン('btnA')
  const KEYDIR = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right' };
  const isA = k => ['Enter','z','Z',' '].includes(k);

  function pressA(){ held.add('btnA'); if (window.Sfx) window.Sfx.resume(); game.press(); }
  function releaseA(){ held.delete('btnA'); }
  function pressDir(d){ held.add(d); game.dir(d); }

  addEventListener('keyup', e=>{
    const d = KEYDIR[e.key];
    if (d) held.delete(d);
    if (isA(e.key)) releaseA();
  });
  addEventListener('keydown', e=>{
    const d = KEYDIR[e.key];
    if (d){ e.preventDefault(); pressDir(d); return; }
    if (e.repeat) return;
    if (e.key === 'Tab'){ e.preventDefault(); if (game.outro) game.toHome(); else game.toggleMenu(); return; }   // 最後の演出中は、ゲームボーイが隠れているので、Tabで直接ホームへ
    if (isA(e.key)){ e.preventDefault(); pressA(); }
    else if (['x','X','Escape'].includes(e.key)){ if (game.outro) game.toHome(); else game.back(); }
  });

  const A = document.getElementById('bA');
  [A, cv].forEach(el=>{
    el.addEventListener('pointerdown', pressA);
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>el.addEventListener(ev, releaseA));
  });
  document.getElementById('bB').addEventListener('pointerdown', ()=>game.back());
  document.getElementById('bS').addEventListener('pointerdown', ()=>game.toggleMenu());
  document.querySelectorAll('.dpad button').forEach(b=>{
    const d = b.dataset.dir;
    b.addEventListener('pointerdown', e=>{ e.preventDefault(); pressDir(d); });
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev, ()=>held.delete(d)));
  });

  return { held };
};
