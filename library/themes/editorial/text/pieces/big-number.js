import {F, M, stage, g, text, lines, label, folio, rule, fit, capH, count, soft, span, glide} from '../../kit.js';
import {page, sc, fitWrap, fade, gone, outOf} from './_local.js';

// By the numbers: a tracked kicker, one huge Didone figure that counts up as it comes into focus, a rule that draws and
// a serif line under it (*accent* word in italic), then a mono note (say "illustrative" when the figure is a sample).
// Props: value, kicker, label, note, labels (4), field.
export const meta = {duration: 4.5, live: true};
export const defaults = {value: '30', kicker: 'The count', label: 'days, one *habit*', note: 'Illustrative', labels: ['By the numbers', 'No. 01', '', ''], field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), out = outOf(props), no = {font: F.serif, weight: 400}, value = String(props.value ?? '');
  const lab = props.label ? fitWrap(props.label, w, 96 * u, 2) : {size: 0, lines: []}, lh = lab.lines.length * lab.size * 1.02, kh = props.kicker ? 88 : 0, nh = props.note ? 62 : 0;
  const ns = Math.min(fit(value, w, sq ? 440 : 620, no), (pg.h - 110 * u - kh - 96 * u - lh - nh) / .72), ncap = capH(ns, no), bh = kh + ncap + 96 * u + lh + nh, top = pg.mid - bh / 2, base = top + kh + ncap;
  const kick = props.kicker ? label(st.root, M, top + 28, props.kicker, {size: 28, color: st.accent}) : null;
  const ng = g(st), num = text(ng, M - ns * .035, base, value, {...no, size: ns, color: st.fg}), ry = base + 52 * u, rl = rule(st.root, M, ry, W - M, ry, {color: st.fg, width: 2});
  const hd = lab.lines.length ? lines(st, st.root, lab.lines, M, ry + 44 * u, lab.size) : null;
  const note = props.note ? folio(st.root, M, ry + 44 * u + lh + 44, props.note, {size: 28, color: st.sub}) : null;
  return {seek(t) {
    const q = gone(t, out), a = span(t, .2, .55);
    pg.seek(t, 0, out); kick?.attr('opacity', fade(t, .15, out));
    num.text(count(value, glide(span(t, .25, 1.3)))); soft(ng, glide(a) * (1 - q)).attr('transform', `translate(0 ${((1 - glide(a)) * 40).toFixed(1)})`);
    rl.range(q, glide(span(t, .7, .5))); hd?.seek(t, .95, out, .1); note?.attr('opacity', fade(t, 1.4, out));
  }};
}
