// The data page shared by the editorial diagrams (not a piece: the underscore keeps it out of piece ids).
// A 1000x1000 magazine data page: a small tracked kicker over a rule that draws, the chart title in the condensed
// serif rising from behind that rule (ONE *italic accent* word), the chart in the body, and a foot rule with the
// source line and a mono folio. Marks are filled and thick, one accent for the datum that matters (wine on light
// grounds, blush on dark), ink / umber / fog for the rest. Nothing on the page is set under 30 px.
// With `clear: true` the page has no ground and everything wears the kit's paper halo (ink shade on dark grounds),
// so it reads straight on footage. Everything is drawn with the kit; all motion is set from seek(t).
import {C, F, stage, lines, label, folio, rule, text, fit, wrap, measure, tone, span, glide, ease, clamp} from '../../kit.js';
export * from '../../kit.js';

export const X0 = 68, X1 = 932, FOOT = 900;

/** Arrival of a mark (0..1 on the kit's glide) and of a label (0..1, cubic out). */
export const grow = (t, at, dur = .5) => glide(span(t, at, dur));
export const fade = (t, at, dur = .3) => ease(span(t, at, dur));
/** A value as text: props.decimals, props.prefix, props.suffix. */
export const fmt = (v, p = {}) => `${p.prefix ?? ''}${Number(v).toLocaleString('en-US', {minimumFractionDigits: p.decimals ?? 0, maximumFractionDigits: p.decimals ?? 0})}${p.suffix ?? ''}`;
/** The decimals a list of values needs (0..2), unless props.decimals says. */
export const decimalsOf = (values, p = {}) => p.decimals ?? Math.min(2, Math.max(0, ...values.map(v => (String(v).split('.')[1] ?? '').length)));
/** A big numeral in the Didone. */
export const num = (parent, x, y, str, {size = 130, weight = 500, anchor = 'start', color = C.ink, opacity = 1} = {}) =>
  text(parent, x, y, str, {font: F.serif, size, weight, anchor, color, opacity}).style('font-variant-numeric', 'lining-nums tabular-nums');
/** Mono figures as written (no capitals forced), for values with units. */
export const fig = (parent, x, y, str, o = {}) => folio(parent, x, y, str, {caps: false, size: 34, track: .02, ...o});
/** Small tracked capitals that tighten their tracking (down to .04em) to stay inside `width`. */
export function tag(parent, x, y, str, width, o = {}) {
  const size = o.size ?? 30, weight = o.weight ?? 600, s = String(str ?? '').toUpperCase(), n = Math.max(1, [...s].length);
  const bare = measure(s, size, {font: F.sans, weight}), track = clamp((width - bare) / (n * size), .02, o.track ?? .16);
  return label(parent, x, y, s, {...o, size, weight, track});
}
/** A label cut to the capitals that fit `width` at `size` (at least 3 letters), for names under narrow bars. */
export function short(str, width, size = 30) { let s = String(str ?? '').toUpperCase(); while (s.length > 3 && measure(s, size, {font: F.sans, weight: 600}) + s.length * size * .02 > width) s = s.slice(0, -1); return s; }
/** A filled rectangle. */
export const box = (parent, x, y, w, h, color, opacity = 1) => (parent.root ?? parent).append('rect').attr('x', x).attr('y', y).attr('width', Math.max(0, w)).attr('height', Math.max(0, h)).attr('fill', color).attr('opacity', opacity);
/** A filled dot. */
export const dot = (parent, x, y, r, color) => (parent.root ?? parent).append('circle').attr('cx', x).attr('cy', y).attr('r', r).attr('fill', color);
/** Push values apart so neighbours are at least `gap` apart, inside [lo, hi]; returns positions in the original order. */
/** The page's kicker and source line for a chart that can read the project: the piece's own words when it draws real
 *  project data (unless the storyboard wrote its own), and plainly illustrative when asked for a project that is not there. */
export function sourced(props, defaults, real, {unit, note = 'Counted from this video'} = {}) {
  if (real) return {...props, unit: props.unit === defaults.unit ? unit : props.unit, note: props.note === defaults.note ? note : props.note};
  return props.use === 'project' ? {...props, unit: defaults.unit, note: 'Illustrative data · no project given'} : props;
}
export function spread(ys, gap, lo, hi) {
  const order = ys.map((_, i) => i).sort((a, b) => ys[a] - ys[b]), out = [...ys];
  for (let pass = 0; pass < 8; pass++) {
    order.forEach((i, k) => { if (k && out[i] - out[order[k - 1]] < gap) out[i] = out[order[k - 1]] + gap; });
    const over = out[order[order.length - 1]] - hi; if (over > 0) order.forEach(i => out[i] -= over);
    [...order].reverse().forEach((i, k, arr) => { if (k && out[arr[k - 1]] - out[i] < gap) out[i] = out[arr[k - 1]] - gap; });
    const under = lo - out[order[0]]; if (under > 0) order.forEach(i => out[i] += under);
  }
  return out;
}

/**
 * The page. Returns {st, body (draw here), ink {fg, accent, sub, rest, faint, bg}, x0, x1, y0 (top of the body),
 * y1 (bottom of the body), T (when the body may start arriving), seek(t)}. Call seek(t) first in the piece's seek.
 */
export function card(el, props = {}, {titleSize = 84} = {}) {
  const d3 = window.d3, clear = Boolean(props.clear), st = stage(el, {mode: 'card', field: props.field, clear}), f = st.field, root = st.root;
  if (clear) root.attr('filter', st.url(f.dark ? 'shade' : 'halo'));
  const tint = q => d3.interpolateRgb(f.bg, f.fg)(q);
  const ink = {fg: f.fg, accent: props.accent ? tone(props.accent) : f.accent, sub: clear ? f.fg : f.sub, rest: f.dark ? C.fog : C.umber, faint: tint(f.dark ? .26 : .2), bg: f.bg, dark: f.dark};
  const W = X1 - X0, kicker = props.unit ? tag(root, X0, 100, props.unit, W - 90, {size: 30, color: ink.sub, opacity: 0}) : null;
  const page = props.index === false ? null : folio(root, X1, 100, props.index ?? '01', {size: 30, anchor: 'end', color: ink.sub, opacity: 0});
  const top = rule(root, X0, 124, X1, 124, {width: 3, color: ink.fg});
  let size = Math.min(titleSize, fit(props.title ?? '', W, titleSize)), arr = [props.title ?? ''];
  if (size < titleSize * .8) { size = titleSize * .82; arr = wrap(props.title, size, W).slice(0, 2); size = Math.min(size, fit(arr, W, size)); }
  const title = props.title ? lines(st, root, arr, X0, 150, size, {color: ink.fg, accent: ink.accent}) : null;
  const note = props.note === false ? null : tag(root, X0, 950, props.note ?? 'Illustrative data', W - 20, {size: 30, weight: 500, track: .12, color: ink.sub, opacity: 0});
  const foot = note ? rule(root, X0, FOOT + 8, X1, FOOT + 8, {width: 2, color: ink.fg, opacity: .45}) : null;
  const body = root.append('g');
  return {st, root, body, ink, clear, x0: X0, x1: X1, w: W, y0: (title ? title.bottom : 140) + 26, y1: note ? FOOT - 24 : 950, T: .18,
    seek(t) {
      top.draw(grow(t, 0, .4)); foot?.draw(grow(t, .1, .45));
      kicker?.attr('opacity', fade(t, .04, .25)); page?.attr('opacity', fade(t, .12, .25));
      title?.seek(t, .06, null, .07, .45);
      note?.attr('opacity', fade(t, .3, .3));
    }};
}
