// Shared plumbing for this theme's footage overlays (not a piece: the underscore keeps it out of piece ids).
import {C, F, torn, typed, measure, capH, span, settle, leave, presence, uid} from '../../kit.js';

/** Dark ink for writing on paper sheets. */
export const INK = '#15181d';
/** Fade the overlay through its life; returns the leave amount (0 while up, 1 when gone). */
export function live(st, t, props) { st.root.attr('opacity', presence(t, props.life)); return leave(t, props.life); }
/** The slow slide every overlay keeps while it is up, plus the sink as it leaves: a transform at (x, y). */
export const float = (t, x, px = 0, py = 0, {dx = 5, dy = -1.5, sink = 34, rot = 0} = {}) => `translate(${px + dx * t} ${py + dy * t + sink * x}) rotate(${rot})`;
/**
 * A typed line on a dark strip, for small references that must read on any footage. Origin at its
 * left-middle. Returns {g, w, h, set(q)}: the strip wipes on, then the text types.
 */
export function strip(g, str, {size = 28, font = F.type, color = C.bone, fill = C.glass, weight = 400, spacing = .04, seed = 1, anchor = 'start'} = {}) {
  str = String(str ?? ''); const o = {font, weight, spacing}, cap = capH(size, o), px = size * .5, w = measure(str, size, o) + px * 2, h = cap + size * .76, s = g.append('g'), id = uid('sp');
  const x0 = anchor === 'end' ? -w : 0, clip = s.append('clipPath').attr('id', id).append('rect').attr('x', x0 - 6).attr('y', -h).attr('height', h * 2).attr('width', w + 12);
  s.append('path').attr('d', torn(x0, -h / 2, w, h, {seed: seed + str.length, rough: 2.5, step: 8, sides: 'rl'})).attr('fill', fill).attr('clip-path', `url(#${id})`);
  const ty = typed(s, x0 + px, cap / 2, str, {size, font, color, weight, spacing});
  return {g: s, w, h, set(q) { const cw = (w + 12) * settle(span(q, 0, .35)); clip.attr('width', cw).attr('x', anchor === 'end' ? x0 + w + 6 - cw : x0 - 6); ty.set(span(q, .15, .85)); s.attr('opacity', q <= 0 ? 0 : 1); }};
}
