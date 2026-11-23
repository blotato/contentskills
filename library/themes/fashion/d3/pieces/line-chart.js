import {card, txt, label, rule, stroke, dot, ring, draw, fit, wrap, up, fade, glide, span, mix} from '../../kit.js';
import {pace, hold, fmt} from './_local.js';

// One hairline rising across the card with the accent dot riding its tip; the latest value sits
// beside the end point in thin tall numerals. times: [line starts, value appears].
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Slow and steady', unit: 'Illustrative · index', clear: false, field: 'bone', accent: 'poppy', min: null, max: null,
  decimals: 0, prefix: '', suffix: '', speed: 1, times: null, note: 'Latest',
  values: [12, 15, 14, 19, 22, 21, 27, 31], labels: ['Week 1', 'Week 8']};

export function mount(el, props = defaults) {
  const d3 = window.d3, st = card(el, props), {ink} = st, g = st.body, v = props.values, n = v.length, k = pace(props), t0 = props.times?.[0] ?? .3 * k, t1 = props.times?.[1] ?? t0 + .75 * k;
  const x0 = 90, x1 = 750, y0 = 800, y1 = 360, lo = props.min ?? Math.min(...v) - (Math.max(...v) - Math.min(...v)) * .25, hi = props.max ?? Math.max(...v);
  const px = i => mix(x0, x1, n > 1 ? i / (n - 1) : 1), py = d => mix(y0, y1, hi > lo ? (d - lo) / (hi - lo) : .5), pts = v.map((d, i) => [px(i), py(d)]);
  const floor = rule(g, x0, y0, 820, ink.line, 1.5), drop = g.append('rect').attr('x', x1 - .75).attr('width', 1.5).attr('fill', ink.line).attr('opacity', .3);
  const path = stroke(g, d3.line().curve(d3.curveMonotoneX)(pts), ink.line, 2.5), length = path.node().getTotalLength();
  const start = ring(g, pts[0][0], pts[0][1], 5, ink.line, 1.5), tip = dot(g, 0, 0, 8, ink.accent), end = pts[n - 1];
  const str = fmt(v[n - 1], props), size = fit(str, 135, 88, {role: 'num'}), value = txt(g, x1 + 30, end[1] + size * .36, str, {size, role: 'num', color: ink.head});
  const note = txt(g, x1 + 32, end[1] + size * .36 + 34, wrap(up(props.note ?? ''), 14, 132, {role: 'label'}).slice(0, 3).join('\n'), {size: 14, role: 'label', color: ink.dim, leading: 1.6});
  const L = props.labels ?? [], names = L.map((s, i) => label(g, mix(x0, x1, L.length > 1 ? i / (L.length - 1) : 0), y0 + 46, s, {size: 16, color: ink.dim, anchor: i === 0 ? 'start' : i === L.length - 1 ? 'end' : 'middle'}));
  return {seek(t) {
    hold(st, t); floor.set(glide(span(t, .15 * k, .8 * k))); floor.node.attr('opacity', .5);
    const q = glide(span(t, t0, 1.1 * k)), p = path.node().getPointAtLength(length * q);
    draw(path, q); tip.attr('cx', p.x).attr('cy', p.y).attr('opacity', fade(t, t0, .25 * k)); start.attr('opacity', fade(t, t0, .3 * k) * .7);
    const e = glide(span(t, t1, .7 * k)); drop.attr('y', end[1]).attr('height', (y0 - end[1]) * e);
    value.attr('opacity', fade(t, t1, .4 * k)); note.attr('opacity', fade(t, t1 + .15 * k, .4 * k));
    names.forEach((nm, i) => nm.attr('opacity', fade(t, (.3 + i * .08) * k, .4 * k)));
  }};
}
