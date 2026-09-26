// ===== 描画レイヤー：夜の街のシルエット =====
window.RenderLayers = window.RenderLayers || {};
window.RenderLayers.city = (function(){
const BUILDINGS = [[0,74,22,70],[20,60,18,84],[36,82,26,62],[60,68,20,76],[78,88,24,56],[100,64,18,80],[116,78,22,66],[136,58,24,86]];

return function city(r, { shopLit }){
  const { g, C, W, H } = r;
  g.fillStyle = C[2]; g.fillRect(0,0,W,H);
  g.fillStyle = C[3];
  BUILDINGS.forEach(([x,y,w,h],i)=>{
    g.fillRect(x,y,w,h);
    g.fillStyle = C[2];
    for (let yy=y+6; yy<y+h-8; yy+=10) for (let xx=x+4; xx<x+w-4; xx+=7){
      if ((i*7 + xx*3 + yy) % 5 === 0) g.fillRect(xx,yy,3,4);
    }
    g.fillStyle = C[3];
  });
  if (shopLit){
    g.fillStyle = C[0]; g.fillRect(78,104,24,14);          // 店の看板
    g.fillStyle = C[3]; g.fillRect(82,108,16,2); g.fillRect(82,112,10,2);
    g.fillStyle = C[1]; g.fillRect(84,118,12,26);           // 入り口の光
  }
};
})();
