import {stage3, pageTexture, shade, matte, span, smooth, clamp} from './_scene.js';

// An open magazine lying on the ground, seen from above the foot of the page: leaves turn from right to left one
// after another, each bending as it lifts and laying itself flat, showing a new printed spread. Slow and exact.
// "Next", "another chapter", "page after page".
// Props: turns (leaves that turn, 1-5), every (seconds between turns), field (ground), clear.
export const meta = {duration: 8};
export const defaults = {clear: false, field: 'stone', turns: 4, every: 1.5};

const W = 2.1, H = 2.94, SEG = 14;
export function mount(el, props = defaults) {
  const s = stage3(el, props, {fov: 28}), {T, scene, camera} = s, n = Math.max(1, Math.min(5, props.turns ?? 4)), book = new T.Group(); scene.add(book);
  const under = shade(5.6, 4.2, .24); under.position.y = -.03; book.add(under);
  const flat = (seed, side) => { const m = new T.Mesh(new T.PlaneGeometry(W, H), matte(null, pageTexture(seed))); m.rotation.x = -Math.PI / 2; m.position.set(side * W / 2, 0, 0); book.add(m); return m; };
  flat(100, -1); flat(200 + n, 1);
  const block = new T.Mesh(new T.BoxGeometry(W * 2 + .06, .05, H + .06), matte('stone')); block.position.y = -.03; book.add(block);
  // each leaf: a strip of SEG segments from the spine outwards; the front shows on the right, the back on the left
  const leaves = Array.from({length: n}, (_, i) => {
    const mk = (seed, flip) => { const g = new T.PlaneGeometry(W, H, SEG, 1), uv = g.attributes.uv; if (flip) for (let k = 0; k < uv.count; k++) uv.setX(k, 1 - uv.getX(k));
      const m = new T.Mesh(g, new T.MeshLambertMaterial({map: pageTexture(seed), side: flip ? T.BackSide : T.FrontSide})); book.add(m); return m; };
    return {front: mk(300 + i, false), back: mk(400 + i, true), at: .5 + i * (props.every ?? 1.5)};
  });
  const bend = (mesh, q, lift) => {
    const pos = mesh.geometry.attributes.position, theta = q * Math.PI, curl = Math.sin(q * Math.PI) * 1.15, ds = W / SEG;
    let x = 0, y = lift;
    for (let k = 0; k <= SEG; k++) {
      if (k) { const u = (k - .5) / SEG, a = theta - curl * (1 - q * .2) * (u * u - .25) * (q < .5 ? 1 : -1) * 0 - curl * (u - .5) * (1 - 2 * q); x += Math.cos(a) * ds; y += Math.max(0, Math.sin(a)) * ds; }
      for (const row of [0, 1]) { const idx = row * (SEG + 1) + k; pos.setXYZ(idx, x, y, row ? H / 2 : -H / 2); }
    }
    pos.needsUpdate = true; mesh.geometry.computeVertexNormals();
  };
  return {seek(t) {
    s.hold(1.05); const push = smooth(span(t, 0, meta.duration));
    camera.position.set(.5 - push * .3, 8.6 - push * .7, 6.6 - push * .6); camera.lookAt(0, 0, -.55);
    book.rotation.y = .1 - push * .08;
    leaves.forEach((l, i) => { const q = smooth(clamp((t - l.at) / 1.15)), lift = .004 * (q < .5 ? n - i : i + 1); bend(l.front, q, lift); bend(l.back, q, lift); });
    s.render(t);
  }};
}
