import {filmStage, C} from './_film.js';

// Two film reels turning, the strip running between them past a lit gate, seen close and slightly
// from below. Loops seamlessly (each reel has five spokes and turns one spoke per loop).
export const meta = {duration: 3, loop: true};
export const defaults = {};

export function mount(el) {
  const {T, scene, camera, mat, mesh, play} = filmStage(el, {fov: 34});
  const reel = (x, y, r) => {
    const g = new T.Group(); g.position.set(x, y, 0); scene.add(g);
    for (const z of [-.28, .28]) { mesh(new T.TorusGeometry(r, .09, 8, 56), mat(C.silver), g).position.z = z; mesh(new T.CylinderGeometry(.5, .5, .06, 24), mat(C.silver), g).rotation.x = Math.PI / 2; g.children.at(-1).position.z = z;
      for (let i = 0; i < 5; i++) { const s = mesh(new T.BoxGeometry(.3, r - .3, .05), mat(C.bone), g); s.rotation.z = i * 1.2566; s.position.set(-Math.sin(i * 1.2566) * (r + .3) / 2, Math.cos(i * 1.2566) * (r + .3) / 2, z); } }
    mesh(new T.CylinderGeometry(r * .62, r * .62, .5, 40), mat('#1c232d'), g).rotation.x = Math.PI / 2; mesh(new T.CylinderGeometry(.2, .2, .9, 16), mat(C.crimson), g).rotation.x = Math.PI / 2;
    return g;
  };
  const a = reel(-2.5, 1.3, 2.3), b = reel(2.9, -.9, 1.9);
  const strip = (x0, y0, x1, y1) => { const len = Math.hypot(x1 - x0, y1 - y0), m = mesh(new T.BoxGeometry(len, .03, .46), mat('#232b36')); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); m.rotation.z = Math.atan2(y1 - y0, x1 - x0); return m; };
  strip(-3.3, -.1, 1.6, -2.3); strip(-1.2, 3.2, 3.6, .9);
  const gate = mesh(new T.BoxGeometry(1.1, 1.3, .8), mat(C.slate)); gate.position.set(-.9, -1.55, 0); const lamp = mesh(new T.PlaneGeometry(.5, .5), mat(C.bone, {glow: 1})); lamp.position.set(-.9, -1.5, .45);
  const beam = mesh(new T.ConeGeometry(2.6, 9, 24, 1, true), mat(C.steel, {glow: 1, opacity: .1, additive: true, side: T.DoubleSide})); beam.rotation.x = -Math.PI / 2; beam.position.set(-.9, -1.5, 5);
  return play(t => {
    const u = t / meta.duration, w = u * 6.2832;
    a.rotation.z = -u * 1.2566; b.rotation.z = -u * 1.2566 * 2;                 // one and two spokes per loop
    camera.position.set(.4 + Math.sin(w) * .25, -.4 + Math.cos(w) * .12, 15.5); camera.lookAt(.2, .1, 0);
    lamp.material.uniforms.uOpacity.value = 1;
  });
}
