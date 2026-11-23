import {textStage, look, up, fit, capH, measure, glyphs, pose, txt, plate, shade, halo, mark, clipLive, appear, span, spring, easeOut, easeBack, leave, vel} from '../kit.js';

// Overlay: a name plate. A filled plate whips in from the left edge and overshoots, the name
// rises out of it letter by letter in dark ink, a second dark plate with the role slides out
// underneath and a targeting ring smears in at the end of the plate. `y` is the top edge.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'ALEX RIVERA', role: 'MAKES THINGS MOVE', y: 1540, accent: 'cyan'};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), y = props.y, x0 = 56, h = 150, o = {role: 'mono'};
  const size = fit(up(props.name), 780, 100), cap = capH(size), w = measure(up(props.name), size) + 90;
  const rsize = fit(up(props.role), 740, 40, o), rw = measure(up(props.role), rsize, o) + 60;
  const ring = halo(root, stage, {color: ink.alt, ghosts: 4}), under = root.append('g'), sub = shade(under, .8, 14), subEdge = under.append('path').attr('fill', 'none').attr('stroke', ink.alt).attr('stroke-width', 3);
  const role = txt(under, x0 + 72, y + h + 37 + capH(rsize, o) / 2, up(props.role), {size: rsize, role: 'mono', color: ink.alt});
  const slab = plate(root, {fill: ink.accent, cut: 30}), mask = clipLive(stage); mask.rect.attr('y', y).attr('height', h);
  const letters = glyphs(root.append('g').attr('clip-path', mask.url), up(props.name), x0, y + h / 2 + cap / 2, size, {color: ink.on});
  const star = mark(root, x0 + w + 34, y, 28, ink.third);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .45), e = easeBack(q) * (1 - x), sw = Math.max(0, (x0 + w + 60) * e);
      mask.rect.attr('x', -60).attr('width', sw); slab.set(-60, y, sw, h); slab.node.attr('transform', `skewX(${-vel(q) * 14})`);
      letters.forEach(u => { const p = span(t, .22 + u.i * .035, .42); pose(u, {y: (1 - easeBack(p)) * h + x * h, sy: 1 + vel(p) * .3, o: p > 0 ? 1 : 0}); });
      const ke = easeOut(span(t, .5, .4)) * (1 - x); sub.set(x0 + 44, y + h + 4, rw * ke, 66); subEdge.attr('d', ke > .02 ? `M${x0 + 44} ${y + h + 70}h${rw * ke}` : '');
      role.attr('opacity', appear(t, .72) * (1 - x)).attr('transform', `translate(${-30 * (1 - easeOut(span(t, .72, .3)))} 0)`);
      const p = span(t, .3, .7); ring.set(x0 + w + 20 + Math.sin(t * 1.1) * 8 - (1 - easeOut(p)) * 500, y + h + 10 + Math.cos(t * .9) * 6, 44 * (1 - x) * (p > 0 ? 1 : 0), -(30 + vel(p) * 260) + Math.cos(t * 1.1) * 8, 0, 1, t * 50);
      star.attr('transform', `rotate(${t * 80}) scale(${spring(span(t, .8, .5)) * (1 - x)})`);
    },
  };
}
