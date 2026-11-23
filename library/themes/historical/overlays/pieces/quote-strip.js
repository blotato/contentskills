import {C, F, stage, sheet, glyphs, arrive, flow, capH, bar, brush, txt, tone, span, settle} from '../../kit.js';
import {live, float} from './_overlay.js';

// A quotation across the top of the picture: a torn charcoal slip with a crimson rule down its left
// edge, the words set in old book italic arriving one by one, and who said it on a bar beneath.
// `y` is the top of the slip; `width` its width.
export const meta = {duration: 5.5, live: true};
export const defaults = {quote: 'We kept walking because stopping felt worse', by: 'FROM A LETTER HOME', x: 540, y: 150, width: 920, color: 'crimson', step: .16};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), w = props.width, o = {font: F.italic, weight: 400, spacing: .005};
  const {size, lines, pitch} = flow(props.quote, w - 150, 300, 66, 34, o, 1.2), cap = capH(size, o), h = lines.length * pitch + 84;
  const slip = g.append('g'); sheet(slip, -w / 2, 0, w, h, {fill: C.char, seed: 6, rough: 6, wear: .3});
  const stroke = brush(g.append('g').attr('transform', `translate(${-w / 2 + 52} 0) rotate(90)`), 26, -8, h - 52, 16, {seed: 3, color: C.crimson});
  txt(slip, w / 2 - 40, 150, '”', {size: 190, font: F.serif, weight: 400, color: C.crimson, anchor: 'end', opacity: .55, spacing: 0});
  let k = 0; const words = lines.flatMap((line, i) => glyphs(g, line, -w / 2 + 92, 42 + cap + i * pitch + (pitch - cap) * .3, size, {by: 'word', ...o}).map(u => ({...u, k: k++})));
  const by = props.by ? bar(g, props.by, {size: 34, fill: tone(props.color), seed: 4, spacing: .08}) : null; by?.g.attr('transform', `translate(${w / 2 - by.w - 40} ${h + by.h / 2 - 12})`);
  return {seek(t) {
    const x = live(st, t, props), e = settle(span(t, 0, .9)); g.attr('transform', float(t, x, props.x ?? 540, props.y, {dx: 3}));
    slip.attr('opacity', span(t, 0, .45)).attr('transform', `translate(0 ${16 * (1 - e)})`); stroke.reveal(settle(span(t, .2, .8)));
    words.forEach(u => arrive(u, span(t, .5 + u.k * props.step, .7), 0, {from: 1.06, rise: 14})); by?.reveal(span(t, .9 + words.length * props.step, .8));
  }};
}
