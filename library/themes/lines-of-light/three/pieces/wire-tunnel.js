import {lightStage, circle, ease, io, span, noise, clamp} from './_light.js';

// Flying down a tunnel of light: rings of light come at the camera along eight rails that draw
// themselves into the distance first. A red pulse runs away down one rail and lands blue at the
// vanishing point, again and again. Loops. "Going deeper", "the journey", "inside the system".
export const meta = {duration: 8, loop: true};
export const defaults = {clear: false, speed: 2};
const GAP = 2, N = 20, R = 2.6;

export function mount(el, props = defaults) {
  const s = lightStage(el, props, {fov: 62, near: 3, far: 36}), {T, camera} = s, speed = props.speed ?? 2;
  camera.position.set(0, 0, 0); camera.lookAt(0, 0, -1);
  const rails = s.line(Array.from({length: 8}, (_, i) => { const a = i / 8 * Math.PI * 2; return [[Math.cos(a) * R, Math.sin(a) * R, -.6], [Math.cos(a) * R, Math.sin(a) * R, -GAP * N]]; }), {opacity: .7, near: 3, far: 38});
  const ring = circle(R, 8, 'z'), rings = Array.from({length: N}, () => s.line(ring, {near: 2, far: 36}));
  const fx = s.points(3, {size: .5}), railA = Math.PI / 8 * 2;
  return {seek(t) {
    const q = ease(span(t, 0, 2.2)); rails.draw(q);
    const shift = (t * speed) % GAP - GAP;
    rings.forEach((r, i) => { const z = -i * GAP + shift; r.obj.position.z = z; r.obj.rotation.z = (t * speed - z) * .035; r.opacity((-z < GAP * N * q ? 1 : 0) * clamp((-z - .3) / 1.5)); });
    camera.rotation.z = (noise(t * .3, 2) - .5) * .25;
    const u = ((t - 1) % 3) / 3, depth = -GAP * N * .9 * ease(u), on = t > 1;
    fx.set(0, [Math.cos(railA) * R, Math.sin(railA) * R, depth], on && u < .95 ? 1 : 0, .45, 'red');
    fx.set(1, [0, 0, -GAP * N * .9], on && u > .7 ? (1 - (u - .7) / .3) * 1.4 : 0, 9, 'blue');
    s.render(t);
  }};
}
