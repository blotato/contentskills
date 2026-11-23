import {M, stage, line, label, rule, fit, capH, span, glide} from '../../kit.js';
import {page, sc, fade, gone, outOf, labelW} from './_local.js';

// A two-deck headline: the top word in upright serif on the left, a hairline with a small caption between, and the
// bottom word in accent italic set to the right. Props: top, bottom, caption, note, labels (4), field.
export const meta = {duration: 4.5, live: true};
export const defaults = {top: 'Think', bottom: 'bigger', caption: 'Start before\nyou feel ready', note: 'The first draft can be bad', labels: ['Part two', 'Mindset', 'Notes', 'Pg. 04'], field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), out = outOf(props);
  const a = sc(props.top).replace(/\*/g, ''), b = `*${sc(props.bottom, false).replace(/\*/g, '')}*`, gap = (sq ? 150 : 170), nh = props.note ? 80 : 0;
  const size = Math.min(fit([a, b], w, sq ? 290 : 380), (pg.h - 120 * u - gap - nh) / 1.95), cap = capH(size), bh = 2 * cap + size * .5 + gap + nh, top = pg.mid - bh / 2;
  const la = line(st, st.root, a, M, top + cap, size), ry = top + cap + size * .25 + gap / 2, cw = props.caption ? labelW(props.caption, 26) + 36 : 0;
  const rl = rule(st.root, M, ry, W - M - cw, ry, {color: st.fg, width: 2}), nl = String(props.caption ?? '').split('\n').length;
  const cp = props.caption ? label(st.root, W - M, ry + 9 - (nl - 1) * 18, props.caption, {size: 26, color: st.fg, anchor: 'end'}) : null;
  const yb = ry + gap / 2 + cap, lb = line(st, st.root, b, W - M, yb, size, {anchor: 'end'});
  const note = props.note ? label(st.root, W - M, yb + size * .25 + 54, props.note, {size: 28, color: st.sub, weight: 500, anchor: 'end'}) : null;
  return {seek(t) {
    pg.seek(t, 0, out);
    la.set(span(t, .25, .5), span(t, out ?? 1e9, .25)); rl.range(gone(t, out), glide(span(t, .5, .5))); cp?.attr('opacity', fade(t, .75, out));
    lb.set(span(t, .8, .5), span(t, (out ?? 1e9) + .04, .25)); note?.attr('opacity', fade(t, 1.25, out));
  }};
}
