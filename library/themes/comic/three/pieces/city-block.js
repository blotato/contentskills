import {toonStage, C, hex, rand, cutout, burstShape} from './_toon.js';

// A cartoon skyline sliding past: flat inked towers with lit windows in three rows of depth, a
// burst of a sun behind them and halftone in the sky. A moving backdrop that loops.
export const meta = {duration: 8, loop: true};

export function mount(el) {
  const {T, scene, camera, render, setTurn} = toonStage(el, {background: C.sky, dots: C.blue, from: [0, 1], reach: .8, rays: 26, ray: '#7fd0f2', centre: [.68, .62], hole: .2, frame: 'over', fov: 35, z: 10});
  const sun = cutout(burstShape(1.25, {points: 16, depth: .78, seed: 2}), C.yellow, {grow: 1.06}); sun.position.set(1.1, .9, -6); sun.scale.setScalar(1.5); scene.add(sun);
  const windows = (cols, rows, lit, wall, seed) => {
    const c = document.createElement('canvas'); c.width = cols * 32; c.height = rows * 32; const g = c.getContext('2d'); g.fillStyle = wall; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { g.fillStyle = C.ink; g.fillRect(i * 32 + 7, j * 32 + 7, 18, 20); g.fillStyle = rand(i * 17 + j, seed) > .45 ? lit : '#3a3350'; g.fillRect(i * 32 + 10, j * 32 + 10, 12, 14); }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.magFilter = T.NearestFilter; return tex;
  };
  // Three rows; each row repeats every `period` and moves a whole number of periods per loop.
  const rows = [{z: -3, period: 12, laps: 1, walls: [C.purple, C.blue], h: [2.2, 4.4], y: -3.6}, {z: -1, period: 10, laps: 2, walls: [C.red, C.orange, C.teal], h: [1.5, 3.4], y: -3.5}, {z: 1, period: 8, laps: 3, walls: [C.night, C.ink], h: [.9, 1.9], y: -3.2}].map((row, r) => {
    const group = new T.Group(); let x = 0, i = 0; const strip = new T.Group();
    while (x < row.period - .01) {
      const w = Math.min(row.period - x, .9 + rand(i, r + 1) * .9), h = row.h[0] + rand(i, r + 5) * (row.h[1] - row.h[0]), cols = Math.max(2, Math.round(w * 2.6)), floors = Math.max(2, Math.round(h * 2.4));
      const b = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: windows(cols, floors, r === 2 ? C.yellow : C.paper, row.walls[i % row.walls.length], i + r * 9)}));
      const line = new T.Mesh(new T.PlaneGeometry(w + .12, h + .12), new T.MeshBasicMaterial({color: hex(C.ink)})); line.position.z = -.01;
      const one = new T.Group(); one.add(line, b); one.position.set(x + w / 2, h / 2, 0); strip.add(one); x += w; i++;
    }
    [-1, 0, 1].forEach(k => { const copy = strip.clone(); copy.position.x = k * row.period; group.add(copy); });
    group.position.set(0, row.y, row.z); scene.add(group); return {...row, group};
  });
  const ground = new T.Mesh(new T.PlaneGeometry(40, 3), new T.MeshBasicMaterial({color: hex(C.ink)})); ground.position.set(0, -4.6, 1.5); scene.add(ground);
  return {seek(t) {
    const p = t / meta.duration;
    rows.forEach(row => { row.group.position.x = -((p * row.laps) % 1) * row.period - row.period / 2 + row.period / 2; });
    sun.rotation.z = Math.floor(p * 56) % 2 * .11; setTurn(Math.floor(p * 56) % 2 * .06);
    camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0);
    render();
  }};
}
