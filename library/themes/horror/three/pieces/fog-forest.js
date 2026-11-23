import {scene, hex, C, clamp, span, mix, easeInOut, easeOut, hash, noise, lamp, step} from './_scene.js';

// Bare trees in fog: black branching silhouettes standing in rows that fade into a cold blue
// mist, a pale moon behind them, and the camera creeping forward between the trunks. Loops.
export const meta = {duration: 10, live: true, loop: true};
export const defaults = {fog: '#2a3352', sky: '#1c2440', trees: 26, seed: 3};

export function mount(el, props = defaults) {
  const s = scene(el, {background: props.sky, fov: 46, z: 0, fog: [props.fog, .055], flicker: .25}), {T} = s, DEPTH = 40;
  /** One tree as flat quads in the XY plane: a trunk that splits again and again. */
  const tree = seed => { const pos = []; let n = 0;
    const branch = (x, y, a, len, w, depth) => { const x2 = x + Math.sin(a) * len, y2 = y + Math.cos(a) * len, w2 = w * .62, px = Math.cos(a), py = -Math.sin(a);
      pos.push(x - px * w, y - py * w, 0, x + px * w, y + py * w, 0, x2 + px * w2, y2 + py * w2, 0, x - px * w, y - py * w, 0, x2 + px * w2, y2 + py * w2, 0, x2 - px * w2, y2 - py * w2, 0);
      if (depth <= 0) return; const kids = 2 + (hash(++n, seed) < .35 ? 1 : 0);
      for (let k = 0; k < kids; k++) branch(x2, y2, a + (k - (kids - 1) / 2) * (.5 + hash(++n, seed) * .5) + (hash(++n, seed) - .5) * .4, len * (.62 + hash(++n, seed) * .2), w2, depth - 1); };
    branch(0, -3, (hash(seed, 1) - .5) * .12, 3.4 + hash(seed, 2) * 1.6, .16 + hash(seed, 3) * .1, 6);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); return g; };
  const mat = new T.MeshBasicMaterial({color: 0x020305, side: T.DoubleSide}), shapes = [0, 1, 2, 3, 4].map(i => tree(props.seed * 10 + i));
  const trees = Array.from({length: props.trees}, (_, i) => { const m = new T.Mesh(shapes[i % shapes.length], mat), side = i % 2 ? 1 : -1; m.userData = {x: side * (1.1 + hash(i, 5) * 6.5), z: -(i / props.trees) * DEPTH, s: .8 + hash(i, 6) * .7}; m.scale.set(m.userData.s * (hash(i, 7) < .5 ? -1 : 1), m.userData.s, 1); s.scene.add(m); return m; });
  const ground = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshBasicMaterial({color: 0x030406})); ground.rotation.x = -Math.PI / 2; ground.position.y = -3; s.scene.add(ground);
  const moon = s.glow('#cfd8f2', 16, .9), disc = new T.Mesh(new T.CircleGeometry(1.5, 40), new T.MeshBasicMaterial({color: 0xdfe5f5, fog: false})); moon.position.set(2.2, 5.5, -44); disc.position.set(2.2, 5.5, -43.9); s.scene.add(moon, disc);
  const mist = [0, 1, 2].map(i => { const m = s.glow(props.fog, 30, .5); m.material.blending = T.NormalBlending; m.scale.set(2.4, .22, 1); s.scene.add(m); return m; });
  return {seek(t) {
    const q = (t / meta.duration) % 1, travel = q * DEPTH; s.camera.position.set(Math.sin(q * Math.PI * 2) * .25, -.6 + Math.sin(q * Math.PI * 4) * .04, 0); s.camera.rotation.z = Math.sin(q * Math.PI * 2) * .008;
    trees.forEach(m => { const z = ((m.userData.z + travel) % DEPTH + DEPTH) % DEPTH - DEPTH; m.position.set(m.userData.x, 0, z); });
    mist.forEach((m, i) => m.position.set(Math.sin(q * Math.PI * 2 + i * 2) * 5, -2.2 + i * .5, -9 - i * 7));
    s.finish(t);
  }};
}
