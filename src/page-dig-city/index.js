// ===== 「ディグ・シティ」ページの起動：各層の組み立てとゲームループ =====
(function(){
const cv = document.getElementById('cv');
const game = window.Game.create([window.Ch1, window.Ch2, window.Ch3, window.Ch4, window.Ch5, window.Ch6, window.Ch7]);
game.onCue = name => window.Sfx.play(name);
const input = window.createInput(cv, game);
const renderer = window.createRenderer(cv);
const outro = window.createOutro(document.getElementById('outro'), cv);

function loop(){
  game.update(input.held);
  renderer.draw(game);
  outro.draw(game);
  requestAnimationFrame(loop);
}
loop();
})();
