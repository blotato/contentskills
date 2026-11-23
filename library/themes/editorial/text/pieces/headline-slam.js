import {F, M, stage, lines, letters, label, folio, rule, fit, capH, up, span, glide} from '../../kit.js';
import {page, scAll, fade, gone, outOf} from './_local.js';

// A magazine cover: the masthead in Didone capitals fades up letter by letter, a rule draws under it with the issue
// labels, then the cover line rises line by line (one word *marked* is italic in the accent colour), a kicker above it
// and a note below. Props: masthead, lines, kicker, note, labels [issue left, issue right, foot left, foot right], foot, field.
export const meta = {duration: 4.5, live: true};
export const defaults = {masthead: 'Edition', lines: ['The quiet', '*edit*'], kicker: 'The cover story', note: 'A film in three parts', labels: ['Vol. 01', 'No. 26', 'Editorial', 'Pg. 01'], foot: '', field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, arr = scAll(props.lines), L = [].concat(props.labels ?? []), ft = [].concat(props.foot ?? []);
  const pg = page(st, ['', '', L[2] || ft[0], L[3] || ft[1]]), out = outOf(props);
  const mo = {font: F.serif, weight: 500, track: .04}, mast = up(props.masthead ?? ''), ms = mast ? fit(mast, w, sq ? 140 : 190, mo) : 0, y0 = pg.top - (sq ? 44 : 10), my = y0 + capH(ms, mo);
  const mh = mast ? letters(st.root, mast, W / 2, my, ms, {...mo, color: st.fg}) : null, ry = mast ? my + 36 * u : y0;
  const r1 = rule(st.root, M, ry, W - M, ry, {color: st.fg, width: 3}), r2 = rule(st.root, M, ry + 66, W - M, ry + 66, {color: st.fg, width: 1.5});
  const la = L[0] ? label(st.root, M, ry + 43, L[0], {size: 26, color: st.fg}) : null, lb = L[1] ? folio(st.root, W - M, ry + 43, L[1], {size: 26, color: st.fg, anchor: 'end'}) : null;
  const kh = props.kicker ? 62 : 0, nh = props.note ? 96 : 0, a0 = ry + 66 + 40, a1 = pg.bottom - 40, lead = .98;
  const size = Math.min(fit(arr, w, sq ? 210 : 310), (a1 - a0 - kh - nh) / (arr.length * lead + .1)), bh = capH(size) + (arr.length - 1) * size * lead + size * .24;
  const top = a0 + (a1 - a0 - kh - bh - nh) * (sq ? .5 : .56);
  const kick = props.kicker ? label(st.root, M, top + 28, props.kicker, {size: 28, color: st.accent}) : null;
  const hd = lines(st, st.root, arr, M, top + kh, size, {leading: lead}), ny = top + kh + bh + 34;
  const nr = props.note ? rule(st.root, M, ny, M + 120, ny, {color: st.fg, width: 2}) : null, note = props.note ? label(st.root, M, ny + 50, props.note, {size: 28, color: st.sub, weight: 500}) : null;
  return {seek(t) {
    const q = gone(t, out);
    mh?.seek(t, {at: 0, step: .05, dur: .34, out});
    r1.range(q, glide(span(t, .15, .5))); r2.range(q, glide(span(t, .3, .5)));
    la?.attr('opacity', fade(t, .35, out)); lb?.attr('opacity', fade(t, .42, out));
    kick?.attr('opacity', fade(t, .55, out)); hd.seek(t, .65, out, .12);
    nr?.range(q, glide(span(t, 1 + arr.length * .12, .4))); note?.attr('opacity', fade(t, 1.1 + arr.length * .12, out));
    pg.seek(t, .5, out);
  }};
}
