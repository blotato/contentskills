import {lightStage, circle, ease, io, span, clamp} from './_light.js';

// A grid of light running to the horizon under a sun made of lines: the horizon draws out from the
// middle, the grid rails run away from the camera, cross-lines stream toward it, and the sun rises
// as an outline banded with horizontal light and ringed with rays. Loops. "The future", "the road ahead".
export const meta = {duration: 8, loop: true};
export const defaults = {clear: false, speed: 3};

export function mount(el, props = defaults) {
  const s = lightStage(el, props, {fov: 55}), {camera} = s, Y = -1.3, FAR = -70, speed = props.speed ?? 3, GAP = 2.5;
  camera.position.set(0, .4, 4); camera.lookAt(0, .9, -20);
  const horizon = s.line([[[0, Y, FAR], [-80, Y, FAR]], [[0, Y, FAR], [80, Y, FAR]]], {near: 10, far: 400});
  const rails = s.line(Array.from({length: 33}, (_, i) => { const x = (i - 16) * 2; return [[x, Y, 2.5], [x, Y, FAR]]; }), {near: 2, far: 70, opacity: .75});
  const cross = Array.from({length: 28}, () => s.line([[-40, Y, 0], [40, Y, 0]], {near: 2, far: 66, opacity: .7}));
  const sz = FAR - 1, SR = 17, sun = s.line(circle(SR, 120, 'z', [0, Y, sz], Math.PI, 0), {near: 10, far: 400});
  const bands = s.line(Array.from({length: 7}, (_, i) => { const y = 1.8 + i * 2.1; const w = Math.sqrt(Math.max(0, SR * SR - y * y)); return [[-w, Y + y, sz], [w, Y + y, sz]]; }), {near: 10, far: 400, opacity: .8});
  const rays = s.line(Array.from({length: 19}, (_, i) => { const a = Math.PI + (i + 1) / 20 * Math.PI, r0 = SR + 2.5, r1 = SR + (i % 2 ? 7 : 11); return [[Math.cos(a) * r0, Y + -Math.sin(a) * -r0 * -1 * -1, sz], [Math.cos(a) * r1, Y - Math.sin(a) * r1 * -1 * -1, sz]].map(p => [p[0], Math.abs(p[1] - Y) + Y, p[2]]); }), {near: 10, far: 400, opacity: .5, echo: false});
  const fx = s.points(1, {size: 14});
  return {seek(t) {
    horizon.draw(ease(span(t, 0, 1.6))); rails.draw(ease(span(t, .4, 2.2)));
    const shift = (t * speed) % GAP, grid = ease(span(t, .8, 2));
    cross.forEach((l, i) => { const z = -i * GAP + shift; l.obj.position.z = z; l.opacity(clamp((z - FAR * grid) / 4) * clamp((2.5 - z) / 3)); });
    const rise = ease(span(t, 1.2, 3)); sun.draw(io(span(t, 1.2, 2.4))); bands.draw(ease(span(t, 2, 2)));
    rays.draw(ease(span(t, 2.8, 1.6))); [sun, bands, rays].forEach(l => { l.obj.position.y = (rise - 1) * 6; });
    fx.set(0, [0, Y + 4, sz + 2], .35 * rise, 22, 'blue');
    s.render(t);
  }};
}
