import {span, settle, up, fit, clamp} from '../../kit.js';
import {card, ink, ruled, INK, SOFT, PAPER, C, F} from './_card.js';

// Shares of a whole as an inked ring: the segments sweep round in turn (solid ink, crimson, then
// hatched and dotted greys, as a printed chart would), each with a ruled key line and its figure.
export const meta = {duration: 5};
export const defaults = {title: 'Who owned the land', unit: 'Illustrative · share of acres', suffix: '%', clear: false, center: 'ACRES',
  items: [{label: 'The crown', value: 45}, {label: 'The church', value: 25}, {label: 'Great houses', value: 18}, {label: 'Everyone else', value: 12}]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), d3 = window.d3, cx = 350, cy = 570, R = 215, r = 118, total = props.items.reduce((s, d) => s + d.value, 0) || 1, fills = [INK, C.crimson, '#4a5560', '#8c8672', '#b3ab93', '#3d5878'];
  const arc = d3.arc().innerRadius(r).outerRadius(R), g = body.append('g').attr('transform', `translate(${cx} ${cy})`); let a = 0;
  g.append('circle').attr('r', R + 12).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 1.5).attr('opacity', .5); g.append('circle').attr('r', r - 10).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 1.5).attr('stroke-dasharray', '2 6').attr('opacity', .5);
  const n = props.items.length, rowH = Math.min(104, 480 / n), ly0 = cy - n * rowH / 2;
  const segs = props.items.map((d, i) => { const a0 = a, a1 = a += d.value / total * Math.PI * 2, path = g.append('path').attr('fill', fills[i % fills.length]).attr('stroke', PAPER).attr('stroke-width', 3);
    const y = ly0 + i * rowH, lg = body.append('g'), lab = up(d.label); const k = Math.min(1, rowH / 104); lg.append('rect').attr('x', 618).attr('y', y + rowH * .2).attr('width', 26 * k).attr('height', 26 * k).attr('fill', fills[i % fills.length]).attr('stroke', INK).attr('stroke-width', 1.5);
    ink(lg, 658, y + rowH * .2 + 23 * k, lab, {size: fit(lab, 215, 27 * k)}); const val = ink(lg, 658, y + rowH * .2 + 72 * k, '', {size: 44 * k, weight: 700, color: i === 1 ? C.crimson : INK, spacing: 0});
    return {d, a0, a1, path, lg, val}; });
  const mid = props.center ? ink(body, cx, cy + 12, up(props.center), {size: fit(up(props.center), r * 1.4, 34), anchor: 'middle', color: SOFT, font: F.type, weight: 400, spacing: .08}) : null;
  return {seek(t) {
    intro(t); const sweep = settle(span(t, .7, 2.6)) * Math.PI * 2;
    segs.forEach(({d, a0, a1, path, lg, val}, i) => { const end = clamp(sweep, a0, a1); path.attr('d', end > a0 + .001 ? arc({startAngle: a0, endAngle: end}) : null);
      const q = clamp((sweep - a0) / (a1 - a0)); lg.attr('opacity', clamp(q * 4)); val.select('tspan').text(Math.round(d.value * q) + (props.suffix ?? '')); });
    mid?.attr('opacity', span(t, 1.2, .5));
  }};
}
