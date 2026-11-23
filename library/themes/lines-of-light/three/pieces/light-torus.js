import {lightStage, circle, ease, io, span} from './_light.js';

// A torus of light turning slowly: its rings open one after another, the tube's meridians come up
// round them, and a red spark runs the main ring, flashing blue each time it passes the front.
// "The cycle", "always on", "the loop", "it comes back round".
export const meta = {duration: 8, loop: true};
export const defaults = {clear: false};

export function mount(el, props = defaults) {
  const s = lightStage(el, props, {fov: 38, near: 10, far: 18}), {T, scene, camera} = s;
  camera.position.set(0, 0, 14); camera.lookAt(0, 0, 0);
  const R = 2.7, r = .9, g = new T.Group(); scene.add(g); g.rotation.x = 1.08;
  const ringAt = phi => circle(R + r * Math.cos(phi), 120, 'y', [0, r * Math.sin(phi), 0]);
  const rings = Array.from({length: 6}, (_, i) => s.line(ringAt(i / 6 * Math.PI * 2), {opacity: i ? .75 : 1}));
  const mer = s.line(Array.from({length: 36}, (_, j) => { const a = j / 36 * Math.PI * 2; return Array.from({length: 33}, (_, k) => { const p = k / 32 * Math.PI * 2, d = R + r * Math.cos(p); return [Math.cos(a) * d, r * Math.sin(p), Math.sin(a) * d]; }); }), {opacity: .45, echo: false});
  [...rings, mer].forEach(l => g.add(l.obj));
  const fx = s.points(2, {size: .35}); g.add(fx.obj);
  return {seek(t) {
    s.hold(.85);
    rings.forEach((l, i) => l.draw(io(span(t, .1 + i * .25, 1.8))));
    mer.draw(ease(span(t, 1.2, 2)));
    g.rotation.y = t * Math.PI * 2 / 16; g.rotation.z = Math.sin(t * Math.PI * 2 / 8) * .08;
    const a = t * Math.PI * 2 / 4 + 1, rr = R + r, on = t > 2.2 ? 1 : 0;
    fx.set(0, [Math.cos(a) * rr, 0, Math.sin(a) * rr], on, .4, 'red');
    const front = Math.max(0, Math.cos(a + g.rotation.y - Math.PI / 2)); fx.set(1, [Math.cos(a) * rr, 0, Math.sin(a) * rr], on * Math.pow(front, 12) * 1.2, 3, 'blue');
    s.render(t);
  }};
}
