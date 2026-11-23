import {F, M, stage, text, lines, label, rule, span, glide} from '../../kit.js';
import {page, sc, fitWrap, fade, gone, outOf} from './_local.js';

// A pull quote: a large Didone quotation mark in the accent colour, the quote in serif rising line by line (one word
// *marked* in italic), a short rule and the attribution in tracked capitals. Props: quote, by, role, labels (4), field.
export const meta = {duration: 5, live: true};
export const defaults = {quote: 'Done beats *perfect* every single time', by: 'Note to self', role: 'Pinned since day one', labels: ['Quoted', 'No. 12', '', ''], field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), out = outOf(props);
  const qs = 470 * u, mh = qs * .4, ah = (props.by ? 96 : 30) + (props.role ? 42 : 0);
  const {size, lines: ls} = fitWrap(sc(props.quote), w, sq ? 132 : 172, 8, {}, {maxH: pg.h - 120 * u - mh - ah}), bh = mh + ls.length * size * 1.02 + ah, top = pg.mid - bh / 2;
  const qm = text(st.root, M - qs * .03, top + qs * .77, '“', {font: F.serif, weight: 400, size: qs, color: st.accent});
  const hd = lines(st, st.root, ls, M, top + mh + 6, size), ry = hd.bottom + 44, rl = rule(st.root, M, ry, M + 140, ry, {color: st.accent, width: 3});
  const by = props.by ? label(st.root, M, ry + 56, props.by, {size: 28, color: st.fg}) : null, role = props.role ? label(st.root, M, ry + 98, props.role, {size: 26, color: st.sub, weight: 500}) : null;
  const end = .5 + ls.length * .13;
  return {seek(t) {
    const a = glide(span(t, .15, .5));
    pg.seek(t, 0, out); qm.attr('opacity', fade(t, .15, out)).attr('transform', `translate(0 ${((1 - a) * 30).toFixed(1)})`);
    hd.seek(t, .4, out, .13); rl.range(gone(t, out), glide(span(t, end + .15, .4)));
    by?.attr('opacity', fade(t, end + .3, out)); role?.attr('opacity', fade(t, end + .42, out));
  }};
}
