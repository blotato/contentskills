import {lightStage, ease, io, span, hash} from './_light.js';

// A beam of light standing on a point: two floor lines run in from the corners of the frame and meet
// at an apex, a small prism opens there, the red cause-line climbs to it, and a fan of fine rays
// bursts upward, white at the core, lilac at the edges, breathing slowly. "The moment", "the launch",
// "it begins here", a title backdrop.
export const meta = {duration: 7, loop: false};
export const defaults = {clear: false};

export function mount(el, props = defaults) {
  const s = lightStage(el, props, {fov: 45, near: 4, far: 40, glow: 1.6}), {camera} = s;
  camera.position.set(0, .4, 12); camera.lookAt(0, 1.6, 0);
  const A = [0, -.9, 0], floor = s.line([[[-14, -10, 6], A], [[14, -10, 6], A]], {near: 2, far: 60});
  const prism = s.line([[-.5, -.9, .3], [0, -.05, 0], [.5, -.9, .3], [-.5, -.9, .3]], {near: 2, far: 60});
  const cause = s.line([[0, -10, 6], A], {color: 'red', echo: false, near: 2, far: 60});
  const N = 70, rays = Array.from({length: N}, (_, i) => { const k = i / (N - 1) - .5, a = k * .8 + (hash(i, 3) - .5) * .02, len = 11 + 7 * (1 - Math.abs(k) * 2) + hash(i, 5) * 2;
    return {k, l: s.line([[0, 0, 0], [Math.sin(a) * len, Math.cos(a) * len, 0]], {opacity: (.25 + .75 * Math.pow(1 - Math.abs(k) * 2, 2)) * .8, echo: Math.abs(k) < .12, color: Math.abs(k) > .3 ? 'lilac' : 'core', near: 2, far: 60, double: false})}; });
  const fx = s.points(2, {size: 1});
  return {seek(t) {
    floor.draw(io(span(t, 0, 1.8))); cause.range(ease(span(t, 2.2, .8)), ease(span(t, .8, 1.2)));
    prism.draw(ease(span(t, 1.8, .7)));
    rays.forEach(({k, l}, i) => { const q = ease(span(t, 2.1 + Math.abs(k) * 1.2 + hash(i, 9) * .2, 1.6)); l.draw(q); l.opacity(.9 + .1 * Math.sin(t * 1.3 + i)); });
    const u = t - 2; fx.set(0, [0, -.4, 0], u > 0 ? .6 + 1.4 * Math.exp(-u * 2) : 0, 3 + 4 * Math.exp(-Math.max(0, u) * 2), 'blue');
    fx.set(1, [0, -.9, 0], t > .8 && t < 2.3 ? 1 : 0, .5, 'red');
    s.render(t);
  }};
}
