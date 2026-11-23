import {C, stage, group, up, span, ease, io, light, title, fit, capH, measure, band, leave} from '../../kit.js';

// A band of moving text between two lines of light across the frame. The lines open from the
// centre outward, then the words drift through between them; a thinner mono strip above runs the
// other way. `y` is the band's centre, `height` its height.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'NEW EPISODE', sub: 'OUT NOW', y: 1760, height: 130, tilt: 0, speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, y = props.y ?? 1760, h = props.height ?? 130, sp = props.speed ?? 1;
  root.attr('transform', `rotate(${props.tilt ?? 0} ${W / 2} ${y})`);
  const shade = band(root, y - h / 2 - 60, y + h / 2 + 30, 1);
  const edges = [y - h / 2, y + h / 2].map(yy => [light(root, [[W / 2, yy], [-20, yy]], {width: 2.4}), light(root, [[W / 2, yy], [W + 20, yy]], {width: 2.4})]);
  const o = {track: .34}, size = h * .4 / .72, cap = capH(size), unit = up(props.text) + '  ·  ', reps = Math.ceil((W + 1600) / measure(unit, size, o)) + 1;
  const g = group(root), run = title(g, unit.repeat(reps), 0, y + cap / 2, size, {...o, anchor: 'start', halo: 5}), uw = measure(unit, size, o) + o.track * size;
  const g2 = group(root), s2 = 24, sub = props.sub ? title(g2, (up(props.sub) + '   /   ').repeat(30), 0, y - h / 2 - 22, s2, {anchor: 'start', land: false, color: C.dim, track: .4, font: '"IBM Plex Mono"', weight: 500, halo: 4}) : null;
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .4)) * (1 - x));
    edges.forEach((pair, i) => pair.forEach(l => l.range(tail, io(span(t, i * .12, .8)))));
    g.attr('transform', `translate(${-((t * 140 * sp) % uw) - uw} 0)`); run.show(ease(span(t, .4, .9)), 1 - x);
    g2.attr('transform', `translate(${-600 + t * 70 * sp} 0)`); sub?.show(1, .9 * ease(span(t, .7, .5)) * (1 - x));
  }};
}
