// Shared diagram card for the Lines of Light d3 pieces (the underscore keeps it out of piece ids).
// A 1000x1000 card: near-black with teal haze (or nothing but a soft dark pool when `clear`), the
// scene's red dot top-left firing a red line down to a header rule, which draws across in white
// light; the title lands (orange -> red -> white) above it and a dim mono unit line sits under it.
// Pieces start their body at `card.T` (seconds), once the header is in. Everything set from seek(t).
import {C, stage, up, span, ease, light, fire, title, mono, fit, pool, dot, flash, ring, hash} from '../../kit.js';
export * from '../../kit.js';

export const BODY = {x0: 90, x1: 910, y0: 250, y1: 880};

export function card(el, props, {source = [.5, .55], note = true} = {}) {
  const clear = Boolean(props.clear), st = stage(el, {mode: 'card', clear, source}), {root} = st;
  if (clear) pool(root, 500, 520, 620, 620, .95);
  const o = {track: .26}, head = up(props.title ?? ''), size = fit(head, 740, 40, o);
  const shot = fire(root, [[90, 96], [90, 178], [132, 178]], {dur: .6, hold: 99, r: 11});
  const rule = light(root, [[132, 178], [910, 178]], {width: 1.6, opacity: .7});
  const name = title(root, head, 140, 128, size, {...o, anchor: 'start', halo: clear ? 5 : 0});
  const unit = props.unit ? mono(root, 140, 218, up(props.unit), {size: 19, color: C.dim, track: .2, opacity: 0, halo: clear ? 4 : 0}) : null;
  const foot = note && props.note !== false ? mono(root, 910, 948, up(props.note ?? 'Illustrative data'), {size: 15, color: C.dim, anchor: 'end', track: .22, opacity: 0, halo: clear ? 4 : 0}) : null;
  const T = 1.25;
  return {st, root, T, clear,
    seek(t) {
      st.tick(t); shot.seek(t); rule.draw(ease(span(t, .6, 1.4)));
      name.show(ease(span(t, .55, 1.2))); unit?.attr('opacity', .85 * ease(span(t, 1, .8))); foot?.attr('opacity', .7 * ease(span(t, 2, 1)));
    }};
}

/** Short number formatting for labels: 12400 -> 12.4K. */
export const short = v => { const a = Math.abs(v); return a >= 1e9 ? +(v / 1e9).toFixed(1) + 'B' : a >= 1e6 ? +(v / 1e6).toFixed(1) + 'M' : a >= 1e4 ? +(v / 1e3).toFixed(1) + 'K' : String(Math.round(v * 10) / 10); };
/** A faint guide line (no echoes, no halo): grids, axes, baselines that are not the subject. */
export const guide = (lg, pts, o = {}) => light(lg, pts, {width: 1, color: C.mute, echo: false, halo: false, opacity: .55, ...o});
/** Count up from 0 to v with the draw-on ease; keeps decimals the value has. */
export const count = (v, q) => { const d = String(v).includes('.') ? String(v).split('.')[1].length : 0; return (v * ease(q)).toFixed(d); };
/** Solve f(x) = y for x in 0..1 (f rising): when an eased draw reaches a share y of its length. */
export const invert = (f, y) => { let a = 0, b = 1; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (f(m) < y) a = m; else b = m; } return (a + b) / 2; };
/** Running shares of length at each vertex of a polyline (0 at the first, 1 at the last). */
export const shares = pts => { const out = [0]; let s = 0; for (let i = 1; i < pts.length; i++) out.push(s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return out.map(v => v / (s || 1)); };
