import {span, settle, up, fit, measure} from '../../kit.js';
import {card, ink, ruled, INK, SOFT, C, F, inks} from './_card.js';

// Overlapping eras on a year axis: each band is ruled in from its first year to its last, one row
// each, so what ran alongside what can be read off. `eras` are {label, start, end}; `mark` (a label) is crimson.
export const meta = {duration: 5.5};
export const defaults = {title: 'Who ruled when', unit: 'Illustrative years · invented houses', from: 1200, to: 1500, clear: false, mark: 'The Interregnum',
  eras: [{label: 'House Arden', start: 1200, end: 1310}, {label: 'The Interregnum', start: 1295, end: 1340}, {label: 'House Maren', start: 1330, end: 1445}, {label: 'The League', start: 1380, end: 1500}]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), x0 = 140, x1 = 870, y0 = 300, base = 800, n = props.eras.length, rowH = Math.min(110, (base - y0 - 20) / n), bh = rowH * .56;
  const lo = props.from ?? Math.min(...props.eras.map(e => e.start)), hi = props.to ?? Math.max(...props.eras.map(e => e.end)), sx = v => x0 + (x1 - x0) * (v - lo) / (hi - lo);
  const stepY = [10, 20, 25, 50, 100, 200, 250, 500, 1000].find(s => (hi - lo) / s <= 6) ?? 1000;
  ruled(body, x0 - 14, base, x1 + 14, base, {width: 3.5});
  for (let v = Math.ceil(lo / stepY) * stepY; v <= hi; v += stepY) { ruled(body, sx(v), y0 - 10, sx(v), base, {width: 1.2, dash: '3 7', opacity: .6}); ruled(body, sx(v), base, sx(v), base + 14, {width: 2.5}); ink(body, sx(v), base + 50, String(v), {size: 28, anchor: 'middle', spacing: .02}); }
  const rows = props.eras.map((e, i) => { const y = y0 + i * rowH + (rowH - bh) / 2, xa = sx(Math.max(lo, e.start)), w = sx(Math.min(hi, e.end)) - xa, hot = e.label === props.mark, fill = hot ? C.crimson : i % 2 ? '#3d4753' : INK, lab = up(e.label), size = Math.min(bh * .52, 30), inside = measure(lab, size) + 24 < w;
    const g = body.append('g'), rect = g.append('rect').attr('x', xa).attr('y', y).attr('height', bh).attr('fill', fill), right = xa + w + 14 + measure(lab, size) < x1 + 20;
    const text = ink(g, inside ? xa + 14 : right ? xa + w + 14 : xa - 14, y + bh / 2 + size * .36, lab, {size, color: inside ? C.bone : hot ? C.crimson : INK, anchor: inside || right ? 'start' : 'end'});
    const yrs = ink(g, xa, y - 8, `${e.start} – ${e.end}`, {size: 21, font: F.type, weight: 400, color: SOFT, spacing: .04});
    return {rect, text, yrs, w, i}; });
  return {seek(t) { intro(t); rows.forEach(({rect, text, yrs, w, i}) => { const at = .7 + i * .55; rect.attr('width', w * settle(span(t, at, 1.1))); text.attr('opacity', span(t, at + .45, .4)); yrs.attr('opacity', span(t, at + .2, .4)); }); }};
}
