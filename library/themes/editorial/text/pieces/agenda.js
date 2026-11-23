import {M, stage, line, lines, label, folio, rule, fit, capH, pad, span, glide, ease} from '../../kit.js';
import {page, sc, fade, gone, outOf} from './_local.js';

// A contents page: the title rises over a rule, then each item arrives in turn: a mono number, the item in serif
// rising from its hairline, and the hairline drawing under it. The newest item's number is in the accent colour.
// Props: title, kicker, items (up to 7; *accent* marks allowed), step (seconds between items) or times [seconds], labels (4), field.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'The plan', kicker: 'Four moves', items: ['Find the hook', 'Write it short', 'Cut the fluff', 'Post it today'], labels: ['Contents', 'Today', '', ''], step: .45, times: null, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), out = outOf(props), items = [].concat(props.items ?? []).slice(0, 7).map(s => sc(s)), n = items.length;
  const ts = fit(sc(props.title), w * .68, sq ? 130 : 176), th = capH(ts) + ts * .22 + 26, rh = Math.min(sq ? 118 : 168, (pg.h - 110 * u - th) / Math.max(1, n)), top = pg.mid - (th + n * rh) / 2 + 6;
  const hd = lines(st, st.root, [sc(props.title)], M, top, ts), ry = top + th, r0 = rule(st.root, M, ry, W - M, ry, {color: st.fg, width: 3});
  const kick = props.kicker ? label(st.root, W - M, ry - 26, props.kicker, {size: 26, color: st.sub, anchor: 'end'}) : null;
  const is = Math.min(rh * .6, fit(items, w - 130, 110)), icap = capH(is), at = i => props.times?.[i] ?? .7 + i * (props.step ?? .45);
  const rows = items.map((s, i) => { const y = ry + i * rh, by = y + rh / 2 + icap / 2;
    return {no: folio(st.root, M, by - icap / 2 + 11, pad(i + 1), {size: 30, color: st.fg}), tx: line(st, st.root, s, M + 126, by, is), rl: rule(st.root, M, y + rh, W - M, y + rh, {color: st.fg, width: 1.5, opacity: .45})}; });
  return {seek(t) {
    const q = gone(t, out); pg.seek(t, 0, out); hd.seek(t, .15, out); r0.range(q, glide(span(t, .3, .5))); kick?.attr('opacity', fade(t, .5, out));
    rows.forEach((r, i) => { const now = t >= at(i) && (i === n - 1 || t < at(i + 1));
      r.no.attr('opacity', fade(t, at(i), out, .3)).attr('fill', now ? st.accent : st.fg); r.tx.set(span(t, at(i) + .05, .45), span(t, (out ?? 1e9) + i * .02, .25)); r.rl.range(q, glide(span(t, at(i) + .12, .45))); });
  }};
}
