import {F, M, stage, line, lines, label, rule, fit, capH, span, glide} from '../../kit.js';
import {page, sc, fitWrap, fade, gone, outOf} from './_local.js';

// A chapter opener: a tracked kicker, a huge Didone numeral in the accent colour rising from a rule that draws, the
// chapter title in serif under it (one word *marked* in italic) and a small note. Props: number, kicker, title, note, labels (4), field.
export const meta = {duration: 4.5, live: true};
export const defaults = {number: '02', kicker: 'Chapter', title: 'The *build*', note: 'Where the idea\nbecomes a thing', labels: ['Section', 'Pt. 02', '', ''], field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), out = outOf(props), no = {font: F.serif, weight: 400}, number = String(props.number ?? '');
  const tt = fitWrap(sc(props.title), w, sq ? 150 : 190, 3), tH = tt.lines.length * tt.size * 1.02, nl = props.note ? String(props.note).split('\n').length : 0, nh = nl ? 30 + nl * 40 : 0, kh = props.kicker ? 70 : 0;
  const ns = Math.min(fit(number, w * .8, sq ? 400 : 580, no), (pg.h - 110 * u - kh - 100 * u - tH - nh) / .72), ncap = capH(ns, no), bh = kh + ncap + 100 * u + tH + nh, top = pg.mid - bh / 2, base = top + kh + ncap;
  const kick = props.kicker ? label(st.root, M, top + 28, props.kicker, {size: 28, color: st.fg}) : null;
  const num = line(st, st.root, number, M - ns * .035, base, ns, {...no, color: st.accent}), ry = base + 50 * u, rl = rule(st.root, M, ry, W - M, ry, {color: st.fg, width: 2});
  const hd = lines(st, st.root, tt.lines, M, ry + 50 * u, tt.size), note = props.note ? label(st.root, M, hd.bottom + 56, props.note, {size: 28, color: st.sub, weight: 500}) : null;
  return {seek(t) {
    pg.seek(t, 0, out); kick?.attr('opacity', fade(t, .15, out)); rl.range(gone(t, out), glide(span(t, .2, .5)));
    num.set(span(t, .3, .55), span(t, out ?? 1e9, .25)); hd.seek(t, .7, out, .12); note?.attr('opacity', fade(t, 1.1 + tt.lines.length * .12, out));
  }};
}
