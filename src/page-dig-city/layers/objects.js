// ===== 描画レイヤー：オブジェクトの絵（16×16。id ごと） =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.objects = (function(){
const SPRITES = {
  shopDoor(g, C, x, y){ g.fillStyle = C[0]; g.fillRect(x+2,y+2,12,14); g.fillStyle = C[3]; g.fillRect(x+4,y+5,8,2); g.fillRect(x+4,y+9,6,2); },
  vending(g, C, x, y){ g.fillStyle = C[1]; g.fillRect(x+3,y+1,10,15); g.fillStyle = C[0]; g.fillRect(x+5,y+3,6,5); g.fillStyle = C[3]; g.fillRect(x+5,y+11,6,2); },
  board(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+7,y+9,2,7); g.fillRect(x+2,y+2,12,8); g.fillStyle = C[0]; g.fillRect(x+4,y+4,3,4); g.fillRect(x+9,y+4,3,4); },
  viaduct(g, C, x, y){ g.fillStyle = C[2]; g.fillRect(x,y,16,16); g.fillStyle = C[3]; g.fillRect(x+2,y+5,12,11); },
  home(g, C, x, y){ g.fillStyle = C[0]; g.fillRect(x+2,y+2,12,13); g.fillStyle = C[3]; g.fillRect(x+11,y+8,2,2); },
  box(g, C, x, y){ g.fillStyle = C[1]; g.fillRect(x+1,y+3,14,12); g.fillStyle = C[3]; g.fillRect(x+1,y+7,14,1); g.fillRect(x+1,y+11,14,1); g.fillStyle = C[0]; g.fillRect(x+3,y+1,2,3); g.fillRect(x+7,y+1,2,3); g.fillRect(x+11,y+1,2,3); },
  radio(g, C, x, y){ g.fillStyle = C[1]; g.fillRect(x+2,y+4,12,10); g.fillStyle = C[3]; g.fillRect(x+4,y+6,4,4); g.fillStyle = C[0]; g.fillRect(x+10,y+7,2,2); g.fillRect(x+11,y+1,1,3); },
  owner(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+4,y+6,8,9); g.fillStyle = C[2]; g.fillRect(x+4,y+2,8,5); g.fillStyle = C[0]; g.fillRect(x+5,y+4,6,1); },
  exit(g, C, x, y){ g.fillStyle = C[1]; g.fillRect(x+2,y,12,16); g.fillStyle = C[0]; g.fillRect(x+2,y+13,12,3); },
  desk(g, C, x, y){ g.fillStyle = C[1]; g.fillRect(x+1,y+6,14,9); g.fillStyle = C[0]; g.fillRect(x+9,y+2,5,4); },
  futon(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x,y+2,16,13); g.fillStyle = C[2]; g.fillRect(x+1,y+3,14,11); g.fillStyle = C[0]; g.fillRect(x+2,y+4,5,4); },
  cafeDoor(g, C, x, y){ g.fillStyle = C[1]; g.fillRect(x+2,y+3,12,13); g.fillStyle = C[3]; g.fillRect(x+2,y+3,12,3); g.fillStyle = C[0]; g.fillRect(x+6,y+8,4,7); },
  laundry(g, C, x, y){ g.fillStyle = C[1]; g.fillRect(x+1,y+2,14,14); g.fillStyle = C[3]; g.beginPath(); g.arc(x+8,y+9,5,0,Math.PI*2); g.fill(); g.fillStyle = C[0]; g.fillRect(x+6,y+7,2,2); },
  bench(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+1,y+7,14,3); g.fillRect(x+2,y+10,2,5); g.fillRect(x+12,y+10,2,5); },
  lamp(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+7,y+4,2,12); g.fillStyle = C[0]; g.fillRect(x+4,y+1,8,4); },
  spot(g, C, x, y){ g.fillStyle = C[0]; g.fillRect(x+3,y+3,10,10); g.fillStyle = C[2]; g.fillRect(x+5,y+5,6,6); },
  // 人（ミオ：エプロン／ケン：スケボー／ロク：フード／通行人）
  mio(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+4,y+6,8,9); g.fillStyle = C[0]; g.fillRect(x+5,y+9,6,6); g.fillStyle = C[2]; g.fillRect(x+4,y+2,8,5); },
  ken(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+4,y+5,8,8); g.fillStyle = C[2]; g.fillRect(x+4,y+2,8,4); g.fillStyle = C[0]; g.fillRect(x+2,y+14,12,2); },
  rok(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+3,y+5,10,10); g.fillStyle = C[1]; g.fillRect(x+4,y+1,8,5); g.fillStyle = C[3]; g.fillRect(x+5,y+3,6,3); },
  npc(g, C, x, y){ g.fillStyle = C[2]; g.fillRect(x+4,y+6,8,9); g.fillStyle = C[3]; g.fillRect(x+4,y+2,8,5); },
};
SPRITES.mic = function(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+7,y+6,2,10); g.fillRect(x+4,y+15,8,1); g.fillStyle = C[0]; g.fillRect(x+5,y+2,6,5); };
SPRITES.sheet = function(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+1,y+3,14,3); g.fillStyle = C[1]; g.fillRect(x+2,y+6,12,3); g.fillStyle = C[3]; g.fillRect(x+2,y+9,1,7); g.fillRect(x+13,y+9,1,7); };
SPRITES.lantern = function(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+5,y+5,6,9); g.fillStyle = C[0]; g.fillRect(x+6,y+7,4,5); g.fillRect(x+6,y+3,4,2); };
SPRITES.crates = function(g, C, x, y){ g.fillStyle = C[3]; g.fillRect(x+1,y+6,14,9); g.fillStyle = C[1]; g.fillRect(x+2,y+7,5,7); g.fillRect(x+9,y+7,5,7); };
SPRITES.recordBox = SPRITES.box;
SPRITES.spotExit = SPRITES.spotPillar = SPRITES.spotMid = SPRITES.spot;

return function objects(r, id, x, y){ const s = SPRITES[id]; if (s) s(r.g, r.C, x, y); };
})();
