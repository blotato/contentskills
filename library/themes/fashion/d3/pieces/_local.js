// Small helpers shared by the diagrams in this folder (not a piece: the underscore keeps it out of piece ids).
import {fade, glide, span, drift} from '../../kit.js';
/** Seconds per unit of entrance time: `speed` 2 makes every entrance twice as fast. */
export const pace = p => 1 / Math.max(.1, p.speed || 1);
/** When each of n items starts: `times` (seconds, e.g. when each is spoken) wins, otherwise a short stagger. */
export const cues = (p, n, base = .3, step = .1) => Array.from({length: n}, (_, i) => p.times?.[i] ?? (base + i * step) * pace(p));
/** The standard arrival: fades up while settling `dy` px into place (k = pace). */
export const arrive = (node, t, start, k = 1, dy = 10) => node.attr('opacity', fade(t, start, .4 * k)).attr('transform', `translate(0 ${((1 - glide(span(t, start, .8 * k))) * dy).toFixed(2)})`);
/** Call first in seek: animates the card header and keeps the whole card on a barely visible push-in. */
export const hold = (st, t) => { st.header(t); const s = drift(t, .012); st.body.attr('transform', `translate(${(500 * (1 - s)).toFixed(3)} ${(500 * (1 - s)).toFixed(3)}) scale(${s.toFixed(5)})`); };
/** A value as text: props.decimals, props.prefix, props.suffix. */
export const fmt = (v, p = {}) => `${p.prefix ?? ''}${Number(v).toLocaleString('en-US', {minimumFractionDigits: p.decimals ?? 0, maximumFractionDigits: p.decimals ?? 0})}${p.suffix ?? ''}`;
/** Opacity of the accent on item i when the accent follows the latest item to arrive (at = cue times). */
export const latest = (at, t, i, k = 1) => fade(t, at[i], .35 * k) * (i < at.length - 1 ? 1 - fade(t, at[i + 1], .35 * k) : 1);
/** Push sorted-by-position values apart so neighbours are at least `gap` apart, kept inside [lo, hi]. Returns new positions in the original order. */
export function spread(ys, gap, lo, hi) {
  const order = ys.map((y, i) => i).sort((a, b) => ys[a] - ys[b]), out = [...ys];
  order.forEach((idx, r) => { if (r) out[idx] = Math.max(out[idx], out[order[r - 1]] + gap); });
  const over = out[order[order.length - 1]] - hi; if (over > 0) for (let r = order.length - 1; r >= 0; r--) { const idx = order[r]; out[idx] = Math.min(out[idx], hi - (order.length - 1 - r) * gap); }
  return out.map(y => Math.max(lo, y));
}
