import {span, settle, up, fit} from '../../kit.js';
import {card, ink, ruled, hatch, INK, SOFT, C, F} from './_card.js';

// Ledger bars in dark ink on the paper, the tallest in crimson; each grows slowly from the ruled
// baseline and its figure counts up above it.
export const meta = {duration: 4.5};
export const defaults = {title: 'Goods through the port', unit: 'Illustrative · thousand tons', max: 50, clear: false,
  items: [{label: 'Grain', value: 42}, {label: 'Timber', value: 31}, {label: 'Wool', value: 22}, {label: 'Salt', value: 14}, {label: 'Tin', value: 8}]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), n = props.items.length, x0 = 150, x1 = 860, slot = (x1 - x0) / n, w = slot * .56, base = 790, top = 370;
  const max = props.max ?? Math.max(...props.items.map(d => d.value)), best = Math.max(...props.items.map(d => d.value));
  for (let k = 1; k <= 4; k++) ruled(body, x0 - 20, base - (base - top) * k / 4, x1 + 10, base - (base - top) * k / 4, {width: 1.2, dash: '3 7', opacity: .6});
  ruled(body, x0 - 26, base, x1 + 16, base, {width: 3.5});
  const bars = props.items.map((d, i) => {
    const x = x0 + i * slot + (slot - w) / 2, hot = d.value === best, g = body.append('g');
    const rect = g.append('rect').attr('x', x).attr('width', w).attr('fill', hot ? C.crimson : INK), sh = g.append('g').attr('opacity', .35);
    const lab = up(d.label); ink(body, x + w / 2, base + 46, lab, {size: Math.max(17, fit(lab, slot - 10, 30)), anchor: 'middle'});
    const value = ink(body, x + w / 2, 0, '', {size: 46, weight: 700, anchor: 'middle', color: hot ? C.crimson : INK, spacing: 0});
    return {d, rect, value};
  });
  return {seek(t) {
    intro(t);
    bars.forEach(({d, rect, value}, i) => { const at = .7 + i * .22, q = settle(span(t, at, 1.3)), h = (base - top) * d.value / max * q;
      rect.attr('y', base - h).attr('height', h); value.attr('y', base - h - 16).attr('opacity', span(t, at, .3)).select('tspan').text(Math.round(d.value * q)); });
  }};
}
