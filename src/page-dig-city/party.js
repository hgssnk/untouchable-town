// ===== 演出：ブロックパーティー（立方体だけで組む3D風の夜の公園。視点がゆっくり回る） =====
window.createParty = function(g){
  const PHI = 0.7, S = 19, CX = 160, CY = 150;                        // 見下ろす角度・拡大・画面の中心
  const rgbCache = {};
  const rgb = hex => rgbCache[hex] || (rgbCache[hex] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));
  const LIGHT = [0.4, 0.8, 0.3];
  const FACES = [                                                       // [法線, 頂点(x,y,z の ±1)]
    [[0, 1, 0],  [[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]],
    [[1, 0, 0],  [[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1]]],
    [[-1, 0, 0], [[-1,-1,1],[-1,-1,-1],[-1,1,-1],[-1,1,1]]],
    [[0, 0, 1],  [[1,-1,1],[-1,-1,1],[-1,1,1],[1,1,1]]],
    [[0, 0, -1], [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]]],
  ];

  let boxes, cs, sn, view;

  // 箱を足す：中心(x,z)・底の高さy・大きさ(w,h,d)。emit=光る（陰影なし）
  const box = (x, y, z, w, h, d, c, emit, alpha) => boxes.push({ x, y, z, w, h, d, c, emit, alpha });

  function project(x, y, z){                                            // 世界 → 画面（視点を回す）
    const rx = x * cs - z * sn, rz = x * sn + z * cs;
    return [CX + rx * S, CY - (y * Math.cos(PHI) - rz * Math.sin(PHI)) * S, rx, rz];
  }

  function drawBox(b){
    const hx = b.w / 2, hy = b.h / 2, hz = b.d / 2, cy = b.y + hy;
    const [r, gg, bl] = rgb(b.c);
    g.globalAlpha = b.alpha || 1;
    FACES.forEach(([n, vs]) => {
      const nx = n[0] * cs - n[2] * sn, nz = n[0] * sn + n[2] * cs;
      if (nx * view[0] + n[1] * view[1] + nz * view[2] <= 0) return;   // 裏向きは描かない
      const k = b.emit ? 1 : 0.5 + 0.5 * Math.max(0, (nx * LIGHT[0] + n[1] * LIGHT[1] + nz * LIGHT[2]) / 1.0);
      g.fillStyle = `rgb(${Math.min(255, r * k) | 0},${Math.min(255, gg * k) | 0},${Math.min(255, bl * k) | 0})`;
      g.beginPath();
      vs.forEach(([sx, sy, sz], i) => {
        const p = project(b.x + sx * hx, cy + sy * hy, b.z + sz * hz);
        if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]);
      });
      g.closePath(); g.fill();
    });
    g.globalAlpha = 1;
  }

  // 人：足・体・頭・両腕。踊って弾む。opt：{ body, head, hat, arms, item }
  function person(x, z, t, i, opt){
    const ph = t * 0.24 + i * 0.9, bob = Math.abs(Math.sin(ph)) * 0.28 * (opt.calm ? 0.4 : 1);
    const by = 0.4 + bob;
    box(x - 0.13, 0, z, 0.16, 0.4, 0.16, opt.legs || '#2a2e4a'); box(x + 0.13, 0, z, 0.16, 0.4, 0.16, opt.legs || '#2a2e4a');
    box(x, by, z, 0.5, 0.8, 0.3, opt.body);
    if (opt.apron) box(x, by, z + 0.17, 0.4, 0.55, 0.05, opt.apron);
    box(x, by + 0.8, z, 0.42, 0.42, 0.42, opt.head || '#e8c8a0');
    if (opt.hat) box(x, by + 1.12, z, 0.46, 0.2, 0.46, opt.hat);
    const up = opt.arms === 'up';
    [-1, 1].forEach(sd => {
      const swing = up ? 0.55 + 0.25 * Math.sin(ph + sd * 1.6) : 0.15 + 0.3 * Math.max(0, Math.sin(ph + sd * Math.PI));
      box(x + sd * 0.36, by + 0.15 + swing * 0.5, z, 0.14, 0.5, 0.14, opt.body);
    });
    if (opt.item) opt.item(x, by, z, ph);
  }

  const CROWD = ['#c4553b', '#3574a0', '#8a5cb0', '#c9951a', '#2e8a66', '#d8d2c0', '#a04b6a'];

  function scene(t, placed){
    boxes = [];
    // 地面と、ステージ
    box(0, -0.3, 0, 15, 0.3, 15, '#3a3765');
    box(0, 0, -1.6, 7, 0.12, 3.6, '#5a4a8a');

    // 高架：奥に横たわり、ときどき電車が走る
    box(0, 4, -6.3, 16, 0.7, 2.2, '#20202e');
    [-6, -2, 2, 6].forEach(px => box(px, 0, -6.3, 0.7, 4, 0.9, '#1a1a26'));
    const tr = (t * 0.06) % 40 - 20;
    if (tr > -11 && tr < 11){
      box(tr, 4.7, -6.3, 7, 1.1, 1.4, '#7a7f9a');
      for (let k = -3; k <= 3; k++) box(tr + k * 0.9, 5.0, -5.58, 0.5, 0.45, 0.05, '#f5c46b', true);
    }
    // 街灯
    [[-5.5, 1.5], [5.5, 1.5]].forEach(([lx, lz]) => { box(lx, 0, lz, 0.18, 3.4, 0.18, '#3a3a4a'); box(lx, 3.4, lz, 0.7, 0.3, 0.7, '#f5c46b', true); });

    // 置いたもの
    if (placed.includes('sheet')){                                      // シートの屋根
      box(0, 3.1, -1.6, 7.6, 0.12, 3.8, '#3574a0', false, 0.38);
      [[-3.6, -3.3], [3.6, -3.3], [-3.6, 0.1], [3.6, 0.1]].forEach(([sx, sz]) => box(sx, 0, sz, 0.14, 3.1, 0.14, '#5a5a6a'));
    }
    if (placed.includes('lantern')){                                     // ランタン
      [[-3, 2.6], [3, 2.6], [0, 3.6], [-6, -1], [6, -1]].forEach(([lx, lz], k) => {
        box(lx, 0, lz, 0.1, 1.2, 0.1, '#5a5a6a'); box(lx, 1.2, lz, 0.42, 0.42, 0.42, '#f5c46b', true);
      });
    }
    if (placed.includes('crates')) [[-4.5, 1.2], [-4.5, 2.2], [4.2, 3.6], [5.2, 3.6]].forEach(([cx, cz]) => box(cx, 0, cz, 0.9, 0.55, 0.9, '#8a6540'));
    if (placed.includes('recordBox')){                                   // レコード箱（掘る人がいる）
      box(5.2, 0, 1.2, 1.3, 0.7, 0.8, '#6b4a2f');
      for (let k = 0; k < 6; k++) box(4.75 + k * 0.18, 0.7, 1.2, 0.14, 0.55, 0.6, CROWD[k % 7]);
      person(5.2, 2.1, t, 20, { body: '#d8d2c0', arms: 'down', calm: true });
    }

    // ターンテーブル：レコードは、回り続ける
    box(0, 0, -0.9, 3.2, 0.9, 1.3, '#15151f');
    box(-0.4, 0.9, -0.9, 1.1, 0.08, 1.1, '#0a0a10');
    const a = t * 0.09;
    box(-0.4 + Math.cos(a) * 0.4, 0.98, -0.9 + Math.sin(a) * 0.4, 0.16, 0.06, 0.16, '#f5c46b', true);
    box(-0.4, 0.98, -0.9, 0.22, 0.05, 0.22, '#c4553b');

    // 登場人物（みんな踊る）
    person(0.9, -2.2, t, 1, { body: '#2e8a66', head: '#c89870', hat: '#15151f', arms: 'up',                     // ケン：スクラッチ
      item: (x, by, z, ph) => box(x - 0.9 + Math.sin(ph * 2) * 0.25, 0.95, -0.9, 0.2, 0.12, 0.2, '#e8c8a0') });
    person(-2.7, -1.8, t, 2, { body: '#15151f', hat: '#15151f', arms: 'up',                                      // ロク：マイク
      item: (x) => { box(x + 0.5, 0, -1.3, 0.08, 1.6, 0.08, '#5a5a6a'); box(x + 0.5, 1.6, -1.3, 0.2, 0.2, 0.2, '#d8d2c0'); } });
    person(2.9, -1.4, t, 3, { body: '#8a5cb0', apron: '#d8d2c0', arms: 'down',                                  // ミオ：ベース
      item: (x, by, z, ph) => { box(x - 0.5, by + 0.3 + Math.sin(ph) * 0.05, z + 0.25, 1.0, 0.16, 0.12, '#c9951a'); } });
    person(-1.2, 1.6, t, 4, { body: '#3574a0', arms: 'up' });                                                   // 店主
    person(0, 1.7, t, 0, { body: '#c4553b', head: '#e8c8a0', hat: '#f5c46b', arms: 'up' });                     // 主人公
    const n = 4 + (placed.includes('lantern') ? 3 : 0) + (placed.includes('crates') ? 2 : 0);
    for (let k = 0; k < n; k++){
      const ang = k * 2.4 + 0.7, rad = 3.0 + (k % 3) * 0.9;
      person(Math.cos(ang) * rad * 1.15, 1.2 + Math.abs(Math.sin(ang)) * rad * 0.9, t, 5 + k, { body: CROWD[k % 7], arms: k % 2 ? 'up' : 'down' });
    }
    // 舞う紙ふぶき
    for (let k = 0; k < 28; k++){
      const cx = ((k * 53) % 140) / 10 - 7, cz = ((k * 37) % 140) / 10 - 7, cyy = 6 - ((t * 0.03 + k * 0.37) % 6);
      box(cx + Math.sin(t * 0.03 + k) * 0.6, cyy, cz, 0.12, 0.12, 0.12, CROWD[k % 7], true);
    }
  }

  function draw(t, placed){
    const th = 0.85 * Math.sin(t * 0.0045);                              // 視点は、公園の正面を中心に、ゆっくり左右へ回る（高架は奥のまま）
    cs = Math.cos(th); sn = Math.sin(th);
    view = [0, Math.sin(PHI), Math.cos(PHI)];
    const sky = g.createLinearGradient(0, 0, 0, 240); sky.addColorStop(0, '#0a0d2a'); sky.addColorStop(1, '#2a1f4a');
    g.fillStyle = sky; g.fillRect(-200, -200, 720, 640);
    scene(t, placed);
    boxes.forEach(b => { b.dep = ((b.x * sn + b.z * cs) * view[2] + (b.y + b.h / 2) * view[1]); });
    boxes.sort((p, q) => (p.y < 0 ? -1e9 : p.dep) - (q.y < 0 ? -1e9 : q.dep));                 // 奥から手前へ（地面は最初）
    boxes.forEach(drawBox);
    // 舞台の光（点滅する色）
    const glow = ['#f5c46b', '#c4553b', '#3574a0', '#2e8a66'][Math.floor(t / 24) % 4];
    g.globalAlpha = 0.07; g.fillStyle = glow; g.fillRect(-200, -200, 720, 640); g.globalAlpha = 1;
  }

  return { draw };
};
