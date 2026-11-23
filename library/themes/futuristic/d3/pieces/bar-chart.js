import {C, F, series, line, text, draw, span, easeOut} from '../../hud.js';
import {card} from './_card.js';

// Bars made of stacked segments that light up from the baseline, with values counting up.
export const meta = {duration: 3.2};
export const defaults = {title: 'Where creators earn', unit: 'Illustrative · percent', max: 50, clear: false,
  items: [{label: 'Sponsors', value: 42}, {label: 'Products', value: 31}, {label: 'Ads', value: 14}, {label: 'Affiliates', value: 9}, {label: 'Tips', value: 4}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), n = props.items.length, slot = 800 / n, w = slot * .58, base = 830, top = 300, cells = 16, step = (base - top) / cells;
  line(root, `M90 ${base + 8}H910`, C.dim, 2);
  const bars = props.items.map((d, i) => {
    const x = 100 + i * slot + (slot - w) / 2, color = series[i % series.length];
    const segs = Array.from({length: cells}, (_, k) => root.append('rect').attr('x', x).attr('y', base - (k + 1) * step + 4).attr('width', w).attr('height', step - 6).attr('fill', color));
    text(root, x + w / 2, base + 56, d.label.toUpperCase(), {size: 22, color: C.white, anchor: 'middle', spacing: '.06em'});
    return {d, segs, value: text(root, x + w / 2, 0, '', {size: 44, font: F.display, weight: 800, color, anchor: 'middle', spacing: '0'})};
  });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    bars.forEach(({d, segs, value}, i) => {
      const q = easeOut(span(t, .3 + i * .2, 1.1)), lit = d.value * q / props.max * cells;
      segs.forEach((s, k) => s.attr('opacity', k < Math.floor(lit) ? 1 : k < lit ? .5 : .08));
      value.attr('y', top - 16).attr('opacity', span(t, .3 + i * .2, .2)).text(Math.round(d.value * q));
    });
  }};
}
