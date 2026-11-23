// Helpers shared by the editorial text effects that the kit does not have (yet). Candidates for kit.js are marked KIT.
import {C, M, clamp, span, mix, ease, furniture, measure, wrap, veil, tone} from '../../kit.js';

/** KIT. Other themes write headlines in capitals; a serif here is sentence case. Mixed-case text passes through. */
export function sc(s, first = true) {
  s = String(s ?? ''); if (s.replace(/[^A-Za-z]/g, '').length < 2 || s !== s.toUpperCase()) return s;
  const l = s.toLowerCase().replace(/\bi\b/g, 'I'); return first ? l.replace(/[a-z]/, c => c.toUpperCase()) : l;
}
/** Sentence case for a stack of lines: only the first line gets the capital. */
export function scAll(arr) { arr = [].concat(arr ?? []).map(String); return arr.every(s => s === s.toUpperCase()) ? arr.map((s, i) => sc(s, i === 0)) : arr; }
/** KIT. Mark the first of `words` found in str as the *italic accent* (no-op when str already has a mark). */
export function mark(str, words) {
  str = String(str ?? ''); if (str.includes('*')) return str;
  for (const w of [].concat(words ?? []).map(String).filter(Boolean)) {
    const m = str.match(new RegExp(`(^|[^A-Za-z0-9])(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![A-Za-z0-9])`, 'i'));
    if (m) { const i = m.index + m[1].length; return `${str.slice(0, i)}*${m[2]}*${str.slice(i + m[2].length)}`; }
  }
  return str;
}
/** KIT. The largest size (<= max) at which str wraps into at most maxLines lines of `width` (and maxH tall). */
export function fitWrap(str, width, max, maxLines = 3, o = {}, {min = 34, maxH = Infinity, leading = 1.02} = {}) {
  let size = max, ls;
  for (;; size *= .95) { ls = wrap(str, size, width, o); if (size <= min || (ls.length <= maxLines && ls.length * size * leading <= maxH && ls.every(l => measure(l, size, o) <= width))) break; }
  return {size, lines: ls};
}
/** KIT. The page furniture of a title card: a running head (labels 0, 1) and a running foot (labels 2, 3). */
export function page(st, labels = [], {footColor = null, headColor = null} = {}) {
  const q = clamp((st.H - 1080) / 840), yT = mix(112, 236, q), yB = st.H - mix(112, 300, q), L = [].concat(labels ?? []);
  const a = L[0] || L[1] ? furniture(st, st.root, {left: L[0], right: L[1], y: yT, color: headColor}) : null;
  const b = L[2] || L[3] ? furniture(st, st.root, {left: L[2], right: L[3], y: yB, above: false, color: footColor}) : null;
  return {top: yT, bottom: yB, mid: (yT + yB) / 2, h: yB - yT, seek(t, at = 0, out = null) { const qo = out == null ? 0 : span(t, out, .28); a?.(span(t, at, .5), qo); b?.(span(t, at + .12, .5), qo); }};
}
/** Title cards hold their last state unless the storyboard gives them a life. */
export const outOf = (props, len = .35) => props?.life ? Math.max(.6, props.life - len) : null;
/** Fade in at `at`; out at `out` (null = stay). */
export const fade = (t, at, out = null, len = .35) => ease(span(t, at, len)) * (out == null ? 1 : 1 - ease(span(t, out, .25)));
/** KIT. A quiet ground for type on footage: a paper (or ink) veil on the side of the frame the block sits in. */
export function ground(st, parent, {y, h, mode = 'paper', color = 'ink'} = {}) {
  const none = mode === 'none', dark = mode === 'ink' || (none && tone(color) === C.paper), col = dark ? 'ink' : 'paper';
  const node = none ? null : y + h / 2 < 960 ? veil(st, parent, {top: Math.min(.62, (y + h + 190) / 1920), color: col, strength: .92})
    : veil(st, parent, {top: 0, bottom: Math.min(.62, (1920 - y + 190) / 1920), color: col, strength: .92});
  return {node, dark, fg: dark ? C.paper : C.ink, acc: dark ? C.blush : C.wine, sub: dark ? C.fog : C.umber, shadow: none ? (dark ? 'shade' : 'halo') : null};
}
export {M};
/** 0..1 exit progress from `out` (null = never). */
export const gone = (t, out, len = .25) => out == null ? 0 : ease(span(t, out, len));
/** Width of a kit label (small tracked capitals). */
export const labelW = (str, size = 28, o = {}) => Math.max(0, ...String(str ?? '').split('\n').map(s => measure(s.toUpperCase().replace(/\*/g, ''), size, {font: '"Inter Tight"', weight: 600, track: .2, ...o})));
