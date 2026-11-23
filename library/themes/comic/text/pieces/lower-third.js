import {comicStage, C, look, up, fit, capH, measure, glyphs, letterOn, plate, captionBox, spark, slabPath, scaleTo, span, spring, easeOut, leave, vel} from '../../kit.js';

// Overlay: a name plate. A lopsided slab pops out from a point and overshoots, a darker plate
// drops out from under it, and the name and role letter themselves on. `y` is the top edge.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'ALEX RIVERA', role: 'MAKES THINGS MOVE', y: 1540, accent: 'red'};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), y = props.y, x0 = 60, h = 140, o = {role: 'slab'};
  const name = up(props.name), size = fit(name, 760, 104, o), cap = capH(size, o), w = measure(name, size, o) + 110;
  const role = up(props.role), rsize = fit(role, 700, 50, o), rcap = capH(rsize, o), rw = measure(role, rsize, o) + 70, rh = rcap + 44;
  const g = root.append('g').attr('transform', `translate(${x0} ${y + h / 2})`).append('g');
  const under = g.append('g'), sub = plate(under, {fill: C.ink, stroke: C.ink, drop: 0, cut: 16}), roleLetters = glyphs(under, role, 64, h / 2 + rh / 2 + rcap / 2 - 2, rsize, {role: 'slab', flat: true, color: ink.alt});
  const slab = plate(g, {fill: ink.accent, cut: 40}).box(0, -h / 2, w, h), letters = glyphs(g, name, 44, cap / 2, size, {role: 'slab', flat: true, color: ink.on});
  const star = spark(root, x0 + w + 6, y - 6, 34, C.yellow);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .45), s = spring(q) * (1 - x);
      g.attr('transform', `rotate(${-2 - (1 - easeOut(q)) * 10}) scale(${Math.max(.0001, s)}) skewX(${-vel(q) * 10})`).attr('opacity', s > .001 ? 1 : 0);
      const d = easeOut(span(t, .3, .35)); sub.box(36, h / 2 - 8 - rh * (1 - d), rw, rh + 8); under.attr('transform', `rotate(${(1 - d) * -6 + 1.5})`);
      letters.forEach(u => letterOn(u, span(t, .25 + u.i * .035, .3)));
      roleLetters.forEach(u => letterOn(u, span(t, .6 + u.i * .025, .25)));
      scaleTo(star, spring(span(t, .7, .4)) * (1 - x) * (1 + .15 * Math.sin(t * 6)), t * 60);
    },
  };
}
