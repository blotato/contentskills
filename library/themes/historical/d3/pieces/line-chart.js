import {span, settle, up, fit, clamp} from '../../kit.js';
import {card, ink, ruled, drawOn, INK, SOFT, PAPER, C, F} from './_card.js';

// A pen line plotted across ruled paper: it draws itself from the first point to the last, the
// points are inked as it passes, and the final figure is entered in crimson.
export const meta = {duration: 5};
export const defaults = {title: 'A city grows', unit: 'Illustrative · thousand residents', suffix: 'K', clear: false,
  points: [{label: 'YR 1', value: 12}, {label: 'YR 10', value: 18}, {label: 'YR 20', value: 16}, {label: 'YR 30', value: 29}, {label: 'YR 40', value: 41}, {label: 'YR 50', value: 64}]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), d3 = window.d3, n = props.points.length, x0 = 160, x1 = 820, base = 790, top = 370, max = (props.max ?? Math.max(...props.points.map(p => p.value))) * 1.08;
  const px = i => x0 + (x1 - x0) * i / Math.max(1, n - 1), py = v => base - (base - top) * v / max, pts = props.points.map((p, i) => [px(i), py(p.value)]);
  for (let k = 0; k <= 4; k++) { const y = base - (base - top) * k / 4; ruled(body, x0 - 30, y, x1 + 40, y, {width: k ? 1.2 : 3.5, dash: k ? '3 7' : null, opacity: k ? .6 : 1}); }
  const skip = Math.ceil(n / 7);
  props.points.forEach((p, i) => { ruled(body, px(i), base, px(i), base + 12, {width: 2.5}); if (i % skip === 0 || i === n - 1) ink(body, px(i), base + 48, up(p.label), {size: Math.min(28, fit(up(p.label), (x1 - x0) / Math.min(n, 7) * skip - 10, 28)), anchor: 'middle'}); });
  const area = body.append('path').attr('d', d3.area().x(d => d[0]).y0(base).y1(d => d[1])(pts)).attr('fill', INK).attr('opacity', 0), id = 'lc' + Math.round(pts[0][1] * 7 + n);
  const line = body.append('path').attr('d', d3.line()(pts)).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 5).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round'), draw = drawOn(line);
  const seg = [0]; pts.forEach((p, i) => { if (i) seg.push(seg[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])); });
  const dots = pts.map(([x, y], i) => body.append('circle').attr('cx', x).attr('cy', y).attr('fill', i === n - 1 ? C.crimson : PAPER).attr('stroke', i === n - 1 ? C.crimson : INK).attr('stroke-width', 4));
  const last = props.points[n - 1], fmt = v => (props.prefix ?? '') + Math.round(v).toLocaleString('en-US') + (props.suffix ?? ''), end = ink(body, Math.min(pts[n - 1][0], 850), pts[n - 1][1] - 30, fmt(last.value), {size: 60, weight: 700, color: C.crimson, anchor: 'end', spacing: 0});
  const first = ink(body, pts[0][0] - 4, pts[0][1] - 24, fmt(props.points[0].value), {size: 34, weight: 500, anchor: 'start', spacing: 0});
  return {seek(t) {
    intro(t); const q = settle(span(t, .8, 2.4)); draw(q); area.attr('opacity', .07 * span(t, 3, .8));
    dots.forEach((d, i) => d.attr('r', 9 * settle(clamp((q * seg[n - 1] - seg[i] + 20) / 60))));
    first.attr('opacity', span(t, .8, .4)); end.attr('opacity', span(t, 2.9, .4)).select('tspan').text(fmt(last.value * settle(span(t, 2.7, 1))));
  }};
}
