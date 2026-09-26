// ===== Model：歩く（1マス移動・衝突判定・向いている先のオブジェクト） =====
window.Walk = (function(){
const T = 16, STEP = 6;
const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
const ORDER = ['up','down','left','right'];

// map = { rows:['#..', ...], objects:[{x,y,id}], steps:[{x,y,id}] }
//   objects：向いてAで調べる（通れない）／steps：踏むと反応する床
function createWalker(){
  const me = { x: 0, y: 0, fx: 0, fy: 0, t: 0, face: 'up', map: null };

  const tileAt = (x,y) => me.map.rows[y] && me.map.rows[y][x];
  const objectAt = (x,y) => me.map.objects.find(o => o.x === x && o.y === y);
  const stepAt = (x,y) => me.map.steps.find(o => o.x === x && o.y === y);
  const walkable = (x,y) => tileAt(x,y) === '.' && !objectAt(x,y);

  // マップは共有なので、複製して入る（一時的なオブジェクトの出し入れが元に影響しない）
  function enter(map, x, y, face){
    Object.assign(me, { map: Object.assign({}, map, { objects: map.objects.slice() }), x, y, fx:0, fy:0, t:0, face: face || 'up' });
  }
  function addObject(o){ me.map.objects.push(o); }
  function removeObject(id){ me.map.objects = me.map.objects.filter(o => o.id !== id); }
  function place(x, y){ Object.assign(me, { x, y, fx:0, fy:0, t:0 }); }

  // 向いている先のオブジェクト（立ち止まっているときだけ）
  function facing(){
    if (me.t > 0) return null;
    const [dx,dy] = DIRS[me.face];
    return objectAt(me.x + dx, me.y + dy) || null;
  }

  // 1フレーム進める。マスを渡り終えたとき、そこにstepがあればそのidを返す
  function update(held){
    if (me.t > 0){
      me.t--;
      if (me.t === 0){
        me.x += me.fx; me.y += me.fy; me.fx = me.fy = 0;
        const s = stepAt(me.x, me.y);
        return s ? s.id : null;
      }
      return null;
    }
    const d = ORDER.find(k => held.has(k));
    if (!d) return null;
    me.face = d;
    const [dx,dy] = DIRS[d];
    if (walkable(me.x + dx, me.y + dy)){ me.fx = dx; me.fy = dy; me.t = STEP; }
    return null;
  }

  return { me, enter, place, addObject, removeObject, facing, update };
}

return { T, STEP, createWalker };
})();
