import {C, span, hold, easeOut, txt, brush, hatch, clipLive, up} from '../../kit.js';
import {card} from './_card.js';

// Brush strokes dragged along hatched tracks: one loaded stroke per measure, the first in red.
export const meta = {duration: 3.6};
export const defaults = {title: 'How done is it', unit: 'Illustrative · percent', suffix: '%', clear: false,
  items: [{label: 'Script', value: 100}, {label: 'Edit', value: 72}, {label: 'Thumbnail', value: 35}, {label: 'Courage to post', value: 8}]};

export function mount(el, props = defaults) {
  const {st, body, fine, ink, intro, top} = card(el, props), items = props.items.slice(0, 5), n = items.length, pitch = Math.min(170, (925 - top) / n), bh = Math.min(64, pitch * .4), x0 = 84, w = 832, track = hatch(st, {color: C.dust, gap: 12, width: 3});
  const rows = items.map((d, i) => {
    const y = top + 14 + i * pitch + pitch - bh - 22, reveal = clipLive(st);
    body.append('rect').attr('x', x0).attr('y', y + bh * .18).attr('width', w).attr('height', bh * .64).attr('fill', track).attr('opacity', .55);
    body.append('path').attr('d', brush(x0, y, Math.max(40, w * Math.min(100, d.value) / 100), bh, {seed: i * 5 + 2, dry: 4})).attr('fill', i ? C.bone : ink.accent).attr('fill-rule', 'evenodd').attr('clip-path', reveal.url);
    txt(fine, x0, y - 16, up(d.label), {size: 25, color: C.paper});
    return {d, y, reveal, value: txt(fine, x0 + w, y - 12, '', {size: 58, role: 'cond', anchor: 'end', color: i ? C.bone : ink.accent})};
  });
  return {seek(t) {
    intro(t); const h = hold(t);
    rows.forEach(({d, y, reveal, value}, i) => { const at = .5 + i * .2, q = easeOut(span(h, at, .7)); reveal.set(x0 - 60, y - 40, (w * Math.min(100, d.value) / 100 + 120) * q, bh + 80); value.text(`${Math.round(d.value * q)}${props.suffix ?? ''}`).attr('opacity', h >= at ? 1 : 0); });
  }};
}
