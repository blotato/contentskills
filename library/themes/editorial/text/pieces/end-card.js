import {F, M, stage, g, lines, label, folio, rule, fit, capH, measure, span, glide, ease} from '../../kit.js';
import {page, scAll, fade, gone, outOf} from './_local.js';

// The last page: the closing lines rise centred (one word *marked* in italic), a short rule draws, the action in
// tracked capitals, the handle in mono inside a hairline box that draws itself, and a quiet sign-off at the foot.
// Props: lines, action, handle, strip, labels (4), field.
export const meta = {duration: 5, live: true};
export const defaults = {lines: ['Follow', 'for *more*'], action: 'New video every week', handle: '@yourname', strip: 'See you next time', labels: ['The end', 'Fin.', '', ''], field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), out = outOf(props), arr = scAll(props.lines), cx = W / 2;
  const ah = props.action ? 84 : 0, hh = props.handle ? 124 : 0, sh = props.strip ? 70 : 0, lead = .98;
  const size = Math.min(fit(arr, w, sq ? 210 : 280), (pg.h - 150 * u - 60 - ah - hh - sh) / (arr.length * lead + .1)), bh = capH(size) + (arr.length - 1) * size * lead + size * .24, top = pg.mid - (bh + 60 + ah + hh + sh) / 2;
  const hd = lines(st, st.root, arr, cx, top, size, {anchor: 'middle', leading: lead}), ry = top + bh + 44, rl = rule(st.root, cx - 80, ry, cx + 80, ry, {color: st.accent, width: 3});
  const act = props.action ? label(st.root, cx, ry + 68, props.action, {size: 28, color: st.fg, anchor: 'middle'}) : null;
  const hy = ry + 16 + ah + 30, hs = 36, hw = props.handle ? measure(props.handle, hs, {font: F.mono, weight: 500, track: .06}) + 88 : 0, per = 2 * (hw + 84), box = g(st);
  const frame = props.handle ? box.append('rect').attr('x', cx - hw / 2).attr('y', hy).attr('width', hw).attr('height', 84).attr('fill', 'none').attr('stroke', st.fg).attr('stroke-width', 2).attr('stroke-dasharray', `${per} ${per}`) : null;
  const hl = props.handle ? folio(box, cx, hy + 54, props.handle, {size: hs, color: st.fg, anchor: 'middle', caps: false}) : null;
  const strip = props.strip ? label(st.root, cx, hy + (hh ? 84 : 0) + 76, props.strip, {size: 26, color: st.sub, weight: 500, anchor: 'middle'}) : null, end = .4 + arr.length * .12;
  return {seek(t) {
    const q = gone(t, out); pg.seek(t, 0, out); hd.seek(t, .25, out, .12);
    rl.range(.5 - .5 * glide(span(t, end + .15, .4)) * (1 - q), .5 + .5 * glide(span(t, end + .15, .4)) * (1 - q)); act?.attr('opacity', fade(t, end + .3, out));
    frame?.attr('stroke-dashoffset', (per * (1 - glide(span(t, end + .45, .7)))).toFixed(1)).attr('opacity', 1 - q); hl?.attr('opacity', fade(t, end + .7, out));
    strip?.attr('opacity', fade(t, end + 1, out));
  }};
}
