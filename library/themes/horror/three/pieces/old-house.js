import {scene, hex, C, clamp, span, mix, easeInOut, easeOut, hash, noise, lamp, step} from './_scene.js';

// A house on a hill at night, in silhouette against a cold sky, with one upstairs window lit and
// unsteady; mist slides past in layers and the camera drifts slowly closer. Loops.
export const meta = {duration: 12, live: true, loop: true};
export const defaults = {sky: '#0d1226', window: '#ffd98a', lit: 1};

export function mount(el, props = defaults) {
  const s = scene(el, {background: props.sky, fov: 40, z: 12, flicker: .25}), {T} = s, black = new T.MeshBasicMaterial({color: 0x030406}), far = new T.MeshBasicMaterial({color: 0x0a0e1b});
  const shape = (pts, mat, z) => { const sh = new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y))), m = new T.Mesh(new T.ShapeGeometry(sh), mat); m.position.z = z; s.scene.add(m); return m; };
  const sky = s.glow('#5f6fa8', 34, .38); sky.position.set(0, 1, -6); s.scene.add(sky); const moon = new T.Mesh(new T.CircleGeometry(.85, 40), new T.MeshBasicMaterial({color: 0xdde4f6})), mg = s.glow('#cfd8f2', 8, .8); moon.position.set(-2.6, 4.6, -5); mg.position.set(-2.6, 4.6, -5.1); s.scene.add(mg, moon);
  const ridge = (n, amp, base, seed) => { const pts = [[-14, -9]]; for (let i = 0; i <= n; i++) { const x = -14 + 28 * i / n; pts.push([x, base + Math.sin(i / n * Math.PI) * amp + (hash(i, seed) - .5) * .35]); } pts.push([14, -9]); return pts; };
  shape(ridge(40, 1.2, -2.4, 3), far, -3); const hill = ridge(60, 2.3, -3.6, 5); shape(hill, black, 0);
  const hx = .3, hy = -1.45;   // the house: body, wing, steep roofs, a tower and chimneys
  shape([[-1.5, 0], [1.5, 0], [1.5, 2], [0, 3.3], [-1.5, 2]].map(([x, y]) => [x + hx, y + hy]), black, .05); shape([[1.4, 0], [2.9, 0], [2.9, 1.4], [2.15, 2.1], [1.4, 1.4]].map(([x, y]) => [x + hx, y + hy]), black, .05);
  shape([[-2.1, 0], [-1.2, 0], [-1.2, 3.1], [-1.65, 4.3], [-2.1, 3.1]].map(([x, y]) => [x + hx, y + hy]), black, .05); shape([[.7, 2.3], [1.0, 2.3], [1.0, 3.5], [.7, 3.5]].map(([x, y]) => [x + hx, y + hy]), black, .05);
  const pane = (x, y, w, h) => { const g = new T.Group(), m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({color: hex(props.window)})); g.add(m); [[w, .03, 0, 0], [.03, h, 0, 0]].forEach(([bw, bh]) => { const b = new T.Mesh(new T.PlaneGeometry(bw, bh), black); b.position.z = .01; g.add(b); }); g.position.set(x + hx, y + hy, .1); s.scene.add(g); return m; };
  const lit = pane(-1.65, 2.5, .34, .55), glowW = s.glow(props.window, 2.6, .5); glowW.position.set(-1.65 + hx, 2.5 + hy, .2); s.scene.add(glowW); const dim = [pane(.2, 1.1, .34, .6), pane(2.2, .7, .3, .5)]; dim.forEach(m => m.material.color.set(0x0d1220));
  // A bare tree beside it, as flat quads.
  const pos = []; let k = 0; const br = (x, y, a, len, w, d) => { const x2 = x + Math.sin(a) * len, y2 = y + Math.cos(a) * len, w2 = w * .6, px = Math.cos(a), py = -Math.sin(a); pos.push(x - px * w, y - py * w, 0, x + px * w, y + py * w, 0, x2 + px * w2, y2 + py * w2, 0, x - px * w, y - py * w, 0, x2 + px * w2, y2 + py * w2, 0, x2 - px * w2, y2 - py * w2, 0); if (d > 0) for (let j = 0; j < 2 + (hash(++k, 2) < .4 ? 1 : 0); j++) br(x2, y2, a + (hash(++k, 3) - .5) * 1.5, len * (.6 + hash(++k, 4) * .2), w2, d - 1); };
  br(-4.4, -2.5, .1, 1.5, .09, 5); const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); const treeM = new T.Mesh(tg, new T.MeshBasicMaterial({color: 0x030406, side: T.DoubleSide})); treeM.position.z = .3; s.scene.add(treeM);
  const mist = [0, 1, 2, 3].map(i => { const m = s.glow('#7d8cc0', 16, .2 + i * .04); m.material.blending = T.NormalBlending; m.scale.set(2.2, .2 + i * .04, 1); m.position.z = .6 + i * .8; s.scene.add(m); return m; });
  return {seek(t) {
    const q = (t / meta.duration) % 1, f = step(t, 10), v = props.lit * (hash(f, 6) < .1 ? .15 : .8 + .2 * noise(t * 5, 2)); lit.material.color.set(hex(props.window)).multiplyScalar(v); glowW.material.opacity = .5 * v;
    mist.forEach((m, i) => m.position.set(((q * (i % 2 ? 1 : 2) + i * .31) % 1) * 44 - 22, -2.6 + i * .45 + Math.sin(q * Math.PI * 2 + i) * .1, m.position.z));
    s.camera.position.set(Math.sin(q * Math.PI * 2) * .35, .9 + Math.sin(q * Math.PI * 2) * .05, 12 - Math.sin(q * Math.PI) * .8); s.camera.lookAt(0, .8, 0); s.finish(t);
  }};
}
