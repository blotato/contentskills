import {M, stage, lines, label, rule, span, glide} from '../../kit.js';
import {page, sc, mark, fitWrap, fade, gone, outOf} from './_local.js';

// An opinion page: a tracked tag, then one sentence in large serif that rises line by line, the word that matters in
// accent italic (*marked*, or named in `emphasis`), a rule and a foot line. Props: statement, emphasis, tag, foot, labels (4), field.
export const meta = {duration: 5, live: true};
export const defaults = {statement: 'Good ideas get better the moment you *ship* them', emphasis: [], tag: 'Field note 07', labels: ['Opinion', 'No. 07', '', ''], foot: 'Ship it, then fix it', field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), out = outOf(props);
  const th = props.tag ? 70 : 0, fh = props.foot ? 96 : 40, str = mark(sc(props.statement), props.emphasis);
  const {size, lines: ls} = fitWrap(str, w, sq ? 150 : 178, 8, {}, {maxH: pg.h - 130 * u - th - fh}), top = pg.mid - (th + ls.length * size * 1.02 + fh) / 2 + 10;
  const tag = props.tag ? label(st.root, M, top + 28, props.tag, {size: 28, color: st.accent}) : null;
  const hd = lines(st, st.root, ls, M, top + th, size), ry = hd.bottom + 40, rl = rule(st.root, M, ry, W - M, ry, {color: st.fg, width: 2});
  const foot = props.foot ? label(st.root, M, ry + 52, props.foot, {size: 28, color: st.sub, weight: 500}) : null, end = .45 + ls.length * .13;
  return {seek(t) {
    pg.seek(t, 0, out); tag?.attr('opacity', fade(t, .25, out)); hd.seek(t, .4, out, .13);
    rl.range(gone(t, out), glide(span(t, end + .2, .5))); foot?.attr('opacity', fade(t, end + .45, out));
  }};
}
