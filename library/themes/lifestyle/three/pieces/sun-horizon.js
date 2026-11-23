import {C, glide, span, fade} from '../../kit.js';
import {softStage, rand, hex} from './_soft.js';

// A warm sun lifting over soft layered hills while small clouds slide past, all drifting with a
// slow parallax — mornings, a new start, a calm backdrop behind a title.
export const meta = {duration: 9, live: true};
export const defaults = {};

export function mount(el) {
  const {T, scene, render, view} = softStage(el, {z: 12, fov: 34}), flat = (color, o = 1) => new T.MeshBasicMaterial({color: hex(color), transparent: o < 1, opacity: o});
  const halo = new T.Mesh(new T.CircleGeometry(3.3, 64), flat(C.cream, .75)), sun = new T.Mesh(new T.CircleGeometry(1.7, 64), flat(C.sun)); halo.position.z = -6.1; sun.position.z = -6; scene.add(halo, sun);
  const hills = [[C.sky, -5, -.9, .9], [C.sage, -3.6, -1.6, .7], ['#9DBB6C', -2.2, -2.2, .7], [C.leaf, -1, -2.75, .5], [C.teal, .4, -3.2, .4]].map(([color, z, base, amp], i) => {
    const s = new T.Shape(), W = 44; s.moveTo(-W / 2, -14); for (let k = 0; k <= 80; k++) { const x = -W / 2 + W * k / 80; s.lineTo(x, base + amp * (Math.sin(x * .42 + i * 2.1) * .7 + Math.sin(x * .93 + i * 4.3) * .3)); } s.lineTo(W / 2, -14);
    const m = new T.Mesh(new T.ShapeGeometry(s), flat(color)); m.position.z = z; scene.add(m); return m;
  });
  const clouds = Array.from({length: 5}, (_, i) => { const g = new T.Group(); [[0, 0, 1], [.9, .12, .75], [-.9, .05, .65]].forEach(([x, y, r]) => { const c = new T.Mesh(new T.CircleGeometry(.55 * r, 32), flat(C.cream, .92)); c.position.set(x * .6, y, 0); c.scale.x = 1.9; g.add(c); });
    g.position.set(0, 2.2 + rand(i, 1) * 3.6, -5.5 + i * .1); g.scale.setScalar(.7 + rand(i, 2) * .8); scene.add(g); return g; });
  return {seek(t) {
    const e = glide(span(t, 0, 3.2)), y = -1.4 + 3.6 * e + .25 * (1 - Math.exp(-t / 6));
    sun.position.y = halo.position.y = y; halo.scale.setScalar(.9 + .12 * Math.sin(t * .8) + .2 * e); halo.material.opacity = .75 * fade(t, .3, 1.5);
    hills.forEach((m, i) => { m.position.x = Math.sin(t * .1 + i) * .3 - t * .04 * (i + 1); m.position.y = (1 - glide(span(t, i * .12, 1.6))) * -1.4; });
    clouds.forEach((g, i) => { const span20 = 20, x = ((rand(i, 3) * span20 + t * (.25 + rand(i, 4) * .3)) % span20) - span20 / 2; g.position.x = x; g.children.forEach(c => c.material.opacity = .92 * fade(t, .4 + i * .2, 1.2)); });
    view(0, 0, 1.05 - .05 * glide(span(t, 0, 7))); render();
  }};
}
