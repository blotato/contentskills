import {lightStage, ease, io, span} from './_light.js';

// Strands of light braided round each other, drawing on from the left and slowly twisting. A red
// pulse runs along one strand and lands blue where the braid ends. Faint loose strands drift behind.
// "Connected", "woven together", "the thread that ties it", "DNA of".
export const meta = {duration: 8, loop: true};
export const defaults = {clear: false, strands: 3};

export function mount(el, props = defaults) {
  const s = lightStage(el, props, {fov: 40, near: 7, far: 14}), {T, scene, camera} = s, n = Math.max(2, Math.min(5, props.strands ?? 3));
  camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0);
  const g = new T.Group(); g.rotation.z = -.32; scene.add(g);
  const X0 = -6.5, X1 = 6.5, strand = (ph, r, turns, m = 220) => Array.from({length: m + 1}, (_, k) => { const f = k / m, x = X0 + (X1 - X0) * f, a = ph + f * turns * Math.PI * 2, rr = r * (.55 + .45 * Math.sin(f * Math.PI)); return [x, Math.sin(a) * rr, Math.cos(a) * rr]; });
  const main = Array.from({length: n}, (_, i) => s.line(strand(i / n * Math.PI * 2, 1.15, 2.2), {soft: .02}));
  const loose = s.line(Array.from({length: 4}, (_, i) => strand(i * 1.7, 2 + i * .45, 1.1 + i * .2, 160)), {opacity: .22, echo: false});
  [...main, loose].forEach(l => g.add(l.obj));
  const path = strand(0, 1.15, 2.2), fx = s.points(2, {size: .35}); g.add(fx.obj);
  return {seek(t) {
    s.hold(.85);
    main.forEach((l, i) => l.draw(io(span(t, i * .2, 2.6)))); loose.draw(ease(span(t, .8, 3)));
    g.rotation.x = t * Math.PI * 2 / 8;
    const u = ((t - 3) % 4) / 4, on = t > 3, p = path[Math.min(path.length - 1, Math.floor(ease(u) * (path.length - 1)))];
    fx.set(0, p, on && u < .97 ? 1 : 0, .4, 'red');
    fx.set(1, path.at(-1), on && u > .8 ? 1.4 * (1 - (u - .8) / .2) : 0, 3, 'blue');
    s.render(t);
  }};
}
