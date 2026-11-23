import {C, span, hold, easeOut, txt, scrawl, scribble, hatch, chip, clipLive, jtf, pop, up} from '../../kit.js';
import {card, hand, wobbly} from './_card.js';

// A red marker line drawn across hand-ruled axes, pencil hatching under it, the last point circled in lime.
export const meta = {duration: 3.8};
export const defaults = {title: 'Views per week', unit: 'Illustrative · thousands', max: 100, suffix: 'K', clear: false,
  points: [{label: 'W1', value: 12}, {label: 'W2', value: 18}, {label: 'W3', value: 15}, {label: 'W4', value: 34}, {label: 'W5', value: 41}, {label: 'W6', value: 68}, {label: 'W7', value: 86}]};

export function mount(el, props = defaults) {
  const {st, body, fine, ink, intro, top} = card(el, props), x0 = 130, x1 = 880, base = 830, peak = top + 70, n = props.points.length;
  const pts = props.points.map((d, i) => [x0 + (x1 - x0) * i / Math.max(1, n - 1), base - (base - peak) * Math.min(1, d.value / props.max)]);
  for (let i = 1; i <= 3; i++) { const y = base - (base - peak) * i / 3; fine.append('path').attr('d', `M${x0} ${y}H${x1 + 30}`).attr('stroke', C.dust).attr('stroke-width', 2).attr('stroke-dasharray', '4 12').attr('opacity', .7); txt(fine, x0 - 16, y + 8, String(Math.round(props.max * i / 3)), {size: 22, anchor: 'end', color: C.dust}); }
  const reveal = clipLive(st);
  body.append('path').attr('d', 'M' + pts.map(p => p.join(' ')).join('L') + `L${x1} ${base}L${x0} ${base}Z`).attr('fill', hatch(st, {color: C.bone, gap: 13, width: 2.5})).attr('opacity', .3).attr('clip-path', reveal.url);
  const axes = scrawl(body, s => hand(x0 - 6, peak - 40, x0 - 4, base + 4, s, 4) + hand(x0 - 10, base + 2, x1 + 40, base, s + 1, 4), {color: C.bone, width: 6, seed: 2});
  const line = scrawl(body, s => wobbly(pts, s, 3), {color: ink.accent, width: 11, seed: 5});
  props.points.forEach((d, i) => txt(fine, pts[i][0], base + 46, up(d.label), {size: 23, anchor: 'middle', color: C.paper}));
  const end = pts[n - 1], ring = scrawl(body, s => scribble.circle(end[0], end[1], 34, 30, s), {color: C.lime, width: 6, seed: 9});
  const tag = fine.append('g'); chip(tag.append('g'), `${props.points[n - 1].value}${props.suffix ?? ''}`, {size: 54, role: 'cond', fill: C.bone, sides: 'rl', seedv: 4});
  return {seek(t) {
    const s = intro(t), h = hold(t), q = easeOut(span(h, .65, 1.3));
    axes.draw(span(h, .3, .35), s); line.draw(q, s); reveal.set(x0, 0, (x1 - x0) * q, 1000);
    ring.draw(span(h, 2, .3), s); tag.attr('transform', jtf(Math.min(end[0] - 40, 800), Math.max(end[1] - 90, 300), s, 3, {tilt: -4, scale: pop(t, 2.15)}));
  }};
}
