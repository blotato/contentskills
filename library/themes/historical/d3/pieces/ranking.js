import {span, settle, up, fit} from '../../kit.js';
import {card, ink, ruled, INK, SOFT, C, F} from './_card.js';

// A ranked ledger: numbered rows with ink bars ruled in from the left, the leader in crimson, and
// each figure entered at the end of its bar.
export const meta = {duration: 4.5};
export const defaults = {title: 'Longest reigns', unit: 'Illustrative · years on the throne', suffix: '', clear: false,
  items: [{label: 'Edmund II', value: 48}, {label: 'Alys', value: 41}, {label: 'Maren', value: 33}, {label: 'Rowan', value: 24}, {label: 'Corin', value: 17}]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), n = props.items.length, y0 = 290, rowH = Math.min(118, 570 / n), max = props.max ?? Math.max(...props.items.map(d => d.value)), x0 = 200, full = 560;
  const rows = props.items.map((d, i) => { const y = y0 + i * rowH, g = body.append('g'), lab = up(d.label), ls = Math.min(rowH * .3, 32), bh = rowH * .3;
    ink(g, 180, y + rowH * .62, String(i + 1), {size: rowH * .56, weight: 700, anchor: 'end', color: i ? INK : C.crimson, spacing: 0, opacity: i ? .85 : 1});
    ink(g, x0, y + rowH * .36, lab, {size: fit(lab, 520, ls)});
    const rect = g.append('rect').attr('x', x0).attr('y', y + rowH * .48).attr('height', bh).attr('fill', i ? INK : C.crimson), value = ink(g, 0, y + rowH * .48 + bh * .5 + rowH * .13, '', {size: rowH * .36, weight: 700, color: i ? INK : C.crimson, spacing: 0});
    if (i < n - 1) ruled(g, 130, y + rowH * .98, 870, y + rowH * .98, {width: 1.2, dash: '3 7', opacity: .6});
    return {d, g, rect, value}; });
  return {seek(t) { intro(t); rows.forEach(({d, g, rect, value}, i) => { const at = .6 + i * .3, q = settle(span(t, at, 1.2)), w = full * d.value / max * q;
    g.attr('opacity', span(t, at, .3)); rect.attr('width', w); value.attr('x', x0 + w + 12).select('tspan').attr('x', x0 + w + 12).text(Math.round(d.value * q).toLocaleString('en-US') + (props.suffix ?? '')); }); }};
}
