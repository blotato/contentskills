import {C, F, stage, bar, torn, txt, fit, capH, tone, span, settle} from '../../kit.js';
import {live, float} from './_overlay.js';

// A list that enters one line at a time, like index cards being filed: a crimson title bar, then
// each item on a dark strip beside its number. Use `times` (seconds after the overlay starts) to
// bring each row in on the word that names it. (x, y) is the top-left.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'What survives', items: ['THE LETTERS', 'THE PHOTOGRAPHS', 'THE LEDGER'], times: null, x: 70, y: 170, w: 660, color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), {w} = props, pitch = 92, rh = 76;
  const title = bar(g, props.title, {size: Math.min(56, fit(String(props.title).toUpperCase(), w - 60, 56, {weight: 700})), fill: tone(props.color), weight: 700}); title.g.attr('transform', `translate(0 ${title.h / 2})`);
  const y0 = title.h + 18, rows = props.items.map((item, i) => {
    const r = g.append('g'), inner = r.append('g'), o = {weight: 500, spacing: .05}, size = fit(String(item).toUpperCase(), w - 150, 44, o);
    inner.append('path').attr('d', torn(34, -rh / 2, w - 34, rh, {seed: i + 3, rough: 3, step: 12, sides: 'rl'})).attr('fill', C.glass);
    inner.append('path').attr('d', torn(0, -rh / 2 - 4, 84, rh + 8, {seed: i + 9, rough: 2.5, step: 10})).attr('fill', C.char); inner.append('path').attr('d', `M8 ${rh / 2 - 6}h68`).attr('stroke', C.crimson).attr('stroke-width', 5);
    txt(inner, 42, 16, String(i + 1).padStart(2, '0'), {size: 44, anchor: 'middle', weight: 700, spacing: 0});
    const label = txt(inner, 112, capH(size, o) / 2, String(item).toUpperCase(), {size, ...o});
    return {r, inner, label};
  });
  return {seek(t) {
    const x = live(st, t, props); g.attr('transform', float(t, x, props.x, props.y, {dx: 4})); title.reveal(span(t, 0, .8));
    rows.forEach(({r, inner, label}, i) => { const at = props.times?.[i] ?? .7 + i * .6, q = span(t, at, .7), e = settle(q);
      r.attr('transform', `translate(${20 + i * 14 - 26 * (1 - e)} ${y0 + rh / 2 + i * pitch})`).attr('opacity', span(t, at, .25)); label.attr('opacity', span(q, .3, .6)); });
  }};
}
