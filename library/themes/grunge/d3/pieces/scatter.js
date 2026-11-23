import {C, span, hold, txt, scrawl, scribble, chip, jtf, pop, up} from '../../kit.js';
import {card, hand} from './_card.js';

// Crosses marked on hand-ruled axes, a red trend line dragged through them, one point circled in lime and tagged.
export const meta = {duration: 4};
export const defaults = {title: 'Effort vs reach', unit: 'Illustrative · each cross is one video', xLabel: 'Hours spent', yLabel: 'Views', highlight: 7, tag: 'The lazy one', trend: true, clear: false,
  points: [[10, 14], [18, 22], [24, 18], [32, 35], [40, 30], [48, 46], [55, 41], [14, 88], [63, 58], [72, 52], [80, 70], [90, 76]]};

export function mount(el, props = defaults) {
  const {body, fine, ink, intro, top} = card(el, props), x0 = 140, x1 = 900, base = 820, peak = top + 50, pts = props.points.map(([x, y]) => [x0 + (x1 - x0) * x / 100, base - (base - peak) * y / 100]);
  const axes = scrawl(body, s => hand(x0 - 6, peak - 30, x0 - 4, base + 4, s, 4) + hand(x0 - 10, base + 2, x1 + 30, base, s + 1, 4), {color: C.bone, width: 6, seed: 2});
  txt(fine, (x0 + x1) / 2, base + 60, up(props.xLabel) + '  →', {size: 24, anchor: 'middle', color: C.paper});
  txt(fine, 0, 0, up(props.yLabel) + '  →', {size: 24, anchor: 'middle', color: C.paper}).attr('transform', `translate(${x0 - 40} ${(base + peak) / 2}) rotate(-90)`);
  const hi = props.highlight, rest = pts.filter((_, i) => i !== hi), mx = rest.reduce((a, p) => a + p[0], 0) / rest.length, my = rest.reduce((a, p) => a + p[1], 0) / rest.length, slope = rest.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / Math.max(1, rest.reduce((a, p) => a + (p[0] - mx) ** 2, 0));
  const trend = props.trend ? scrawl(body, s => hand(x0 + 20, my + slope * (x0 + 20 - mx), x1 - 10, my + slope * (x1 - 10 - mx), s, 8), {color: ink.accent, width: 9, seed: 8}) : null;
  const marks = pts.map((p, i) => scrawl(body, s => scribble.cross(p[0], p[1], 15, s), {color: C.bone, width: 7, seed: i * 3 + 1}));
  const hp = pts[hi], ring = hp ? scrawl(body, s => scribble.circle(hp[0], hp[1], 44, 40, s), {color: C.lime, width: 6, seed: 5}) : null;
  const tag = fine.append('g'); if (hp && props.tag) chip(tag.append('g'), up(props.tag), {size: 28, role: 'type', fill: C.bone, sides: 'rl', seedv: 3});
  return {seek(t) {
    const s = intro(t), h = hold(t), n = pts.length, step = Math.min(.12, 1.4 / n); axes.draw(span(h, .3, .35), s);
    marks.forEach((m, i) => m.draw(span(h, .65 + i * step, .12), s));
    const end = .65 + n * step; trend?.draw(span(h, end + .1, .45), s); ring?.draw(span(h, end + .6, .3), s);
    if (hp) tag.attr('transform', jtf(Math.min(Math.max(hp[0] + 150, 260), 760), hp[1] + (hp[1] < peak + 80 ? 80 : -70), s, 4, {tilt: -3, scale: pop(t, end + .8)}));
  }};
}
