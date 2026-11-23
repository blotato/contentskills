import {C, F, stage, card, text, lines, label, rule, wrap, span, ease, glide, leave} from '../../kit.js';

// A pull quote on a paper card: a large Didone quotation mark in the accent, the quote in serif lines that rise one
// after another (*italic* marks the accent words), a hairline and a tracked attribution.
// Props: quote, by, x, y (top), w, size, field.
export const meta = {duration: 4, live: true};
export const defaults = {quote: 'Then I just *talked* to it.', by: 'On editing', x: 90, y: 250, w: 900, size: 96, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 90, y = props.y ?? 250, w = props.w ?? 900, size = props.size ?? 96, pad = 48;
  const arr = wrap(props.quote, size, w - pad * 2 - 110), h = 70 + arr.length * size * 1.02 + (props.by ? 96 : 40);
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  const mark = text(cd.body, x + pad - 6, y + 150, '“', {font: F.serif, weight: 600, size: 200, color: f.accent});
  const q = lines(st, cd.body, arr, x + pad + 110, y + 50, size, {color: f.fg, accent: f.accent});
  const ry = y + h - 76, rl = props.by ? rule(cd.body, x + pad + 110, ry, x + w - pad, ry, {color: f.fg}) : null, by = props.by ? label(cd.body, x + pad + 110, ry + 44, props.by, {size: 28, color: f.sub}) : null;
  const life = props.life ?? meta.duration;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); mark.attr('opacity', ease(span(t, .1, .3)));
    q.seek(t, .16, null, .1, .45); rl?.draw(glide(span(t, .4, .4))); by?.attr('opacity', ease(span(t, .55, .3)));
  }};
}
