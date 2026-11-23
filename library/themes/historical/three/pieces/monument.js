import {filmStage, C, hash} from './_film.js';

// A ruined colonnade around an obelisk on a stepped base, in haze; the camera travels a slow arc
// around it. A crimson pennant marks the obelisk. props.columns sets how many columns stand in the ring.
export const meta = {duration: 7, live: true};
export const defaults = {columns: 10};

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, mesh, table, play} = filmStage(el, {fov: 34, near: 12, far: 38});
  table(90); const stone = mat(C.silver), pale = mat(C.bone), dark = mat('#7d8791');
  [[5.2, .3, 0], [4.6, .3, .3], [4, .3, .6]].forEach(([r, h, y]) => mesh(new T.CylinderGeometry(r, r, h, 48), y ? pale : stone).position.y = y + h / 2);
  const n = props.columns;
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.2832, broken = hash(i * 3.7) > .62, h = broken ? 1 + 2 * hash(i * 5.1) : 4.4, g = new T.Group(); g.position.set(Math.cos(a) * 3.5, .9, Math.sin(a) * 3.5); scene.add(g);
    mesh(new T.CylinderGeometry(.27, .32, h, 14), stone, g).position.y = h / 2; mesh(new T.BoxGeometry(.8, .16, .8), pale, g).position.y = .08;
    if (!broken) mesh(new T.BoxGeometry(.86, .22, .86), pale, g).position.y = h + .11; else { const c = mesh(new T.CylinderGeometry(.27, .27, .9, 14), dark); c.rotation.z = Math.PI / 2; c.rotation.y = a * 3; c.position.set(Math.cos(a) * 5.6, .28, Math.sin(a) * 5.6); }
  }
  for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832; if (hash(i * 3.7) > .62 || hash(((i + 1) % n) * 3.7) > .62) continue; const m = mesh(new T.BoxGeometry(2.3, .34, .7), pale); m.position.set(Math.cos((a0 + a1) / 2) * 3.42, 5.69, Math.sin((a0 + a1) / 2) * 3.42); m.rotation.y = -(a0 + a1) / 2 + Math.PI / 2; }
  mesh(new T.CylinderGeometry(.16, .5, 5.6, 4), pale).position.y = 3.7; mesh(new T.ConeGeometry(.23, .5, 4), pale).position.y = 6.75;
  const flag = mesh(new T.PlaneGeometry(.9, .42, 8, 1), mat(C.crimson, {side: T.DoubleSide})); flag.position.set(.5, 6.2, .1); const base = flag.geometry.attributes.position.array.slice();
  return play(t => {
    const u = t / meta.duration, a = .9 + u * .5, pos = flag.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(base[i * 3] * 5 - t * 4) * .07 * (base[i * 3] + .45)); pos.needsUpdate = true;
    camera.position.set(Math.cos(a) * (15 - u * 1.4), 2.6 + u * .5, Math.sin(a) * (15 - u * 1.4)); camera.lookAt(0, 3.1, 0);
  });
}
