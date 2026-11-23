// Shared by the interface pieces in this folder (not a piece: the underscore keeps it out of piece ids).
// The theme's take on "mock UI": flat bone or near-black cards with square corners and a soft shadow,
// hairline fields, tiny tracked-out small print, one poppy accent that marks whatever was just pressed,
// and an ink pointer that glides (never bounces) to what it clicks. Everything is a pure function of t.
import {C, txt, label, measure, clamp, span, mix, glide, fade, easeInOut, tickPath} from '../../kit.js';

/** Inks for a card: 'bone' (ink type on bone), 'ink' (white type on near-black) or 'clear' (white type straight on footage). */
export const inks = (theme = 'bone') => theme === 'bone'
  ? {card: C.bone, head: C.ink, dim: '#6F6F75', line: C.ink, faint: .16, field: '#FFFFFF', on: C.white}
  : {card: theme === 'clear' ? 'none' : C.ink, head: C.white, dim: '#B4B2AD', line: C.white, faint: .26, field: '#1B1B1F', on: C.white};
/** A flat card (square corners) lifted off the picture. Returns the rect. */
export const plate = (g, st, x, y, w, h, theme = 'bone', {lift = true, r = 0} = {}) => g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', r).attr('fill', inks(theme).card).attr('filter', lift && theme !== 'clear' ? st.lift : null);
/** A hairline box (a field, a key, a chip). */
export const field = (g, x, y, w, h, ink, {r = 8, fill = 'none', width = 2, opacity = .5} = {}) => g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', r).attr('fill', fill).attr('stroke', ink.line).attr('stroke-width', width).attr('stroke-opacity', opacity);

/** The text caret: on for the first half of each beat. */
export const caretOn = t => Math.floor(t * 2.6) % 2 === 0;
/** How many characters of `str` are typed at t, typing from `start` for `seconds`, with a slightly uneven hand. */
export const typedCount = (str, t, start, seconds) => Math.min([...str].length, Math.floor(clamp((t - start) / Math.max(.01, seconds)) * [...str].length + 1e-6));
/** A line that types itself with a caret after it. Returns {node, set(t, start, seconds, done)}; `done` hides the caret. */
export function typeLine(g, x, y, str, {size = 44, color = C.ink, role = 'text', caret = C.poppy, ...rest} = {}) {
  const node = txt(g, x, y, '', {size, color, role, ...rest}), bar = g.append('rect').attr('y', y - size * .82).attr('width', Math.max(3, size * .07)).attr('height', size * 1.02).attr('fill', caret);
  return {node, bar, set(t, start = 0, seconds = 1, done = false) {
    const n = typedCount(str, t, start, seconds), shown = [...str].slice(0, n).join(''), typing = t >= start && n < [...str].length;
    node.text(shown); bar.attr('x', x + measure(shown, size, {role, ...rest}) + size * .08).attr('opacity', done ? 0 : typing || caretOn(t) ? 1 : 0);
    return n;
  }};
}

/** Position on a path of timed points [{t, x, y}], gliding from each to the next (arrives early, then rests). */
export function along(keys, t) {
  let a = keys[0], b = keys[0];
  for (const k of keys) { if (k.t <= t) a = b = k; else { b = k; break; } }
  if (a === b) return {x: a.x, y: a.y};
  const q = glide(span(t, Math.max(a.t, b.t - (b.move ?? .34)), Math.min(b.move ?? .34, b.t - a.t)));
  return {x: mix(a.x, b.x, q), y: mix(a.y, b.y, q)};
}
/**
 * The pointer: an ink arrow with a white edge. set(t, keys, clicks) puts its tip on the path (see along())
 * and, at each time in `clicks`, dips it and sends a thin poppy ring out from the tip.
 */
export function pointer(g, st, {size = 1.7, accent = C.poppy} = {}) {
  const out = g.append('g'), rings = out.append('g'), arrow = out.append('g').attr('filter', st.soft).append('path').attr('d', 'M0 0L0 33L9 25L15 39L21 36L15 23L27 23Z').attr('fill', C.ink).attr('stroke', C.white).attr('stroke-width', 2.4).attr('stroke-linejoin', 'round');
  const pool = [0, 1, 2, 3, 4, 5].map(() => rings.append('circle').attr('fill', 'none').attr('stroke', accent).attr('stroke-width', 3));
  return {g: out, set(t, keys, clicks = [], opacity = 1) {
    const p = along(keys, t); let press = 0;
    pool.forEach((ring, i) => { const at = clicks[i], q = at == null ? -1 : (t - at) / .42; ring.attr('cx', p.x).attr('cy', p.y).attr('r', 8 + 46 * glide(clamp(q))).attr('opacity', q >= 0 && q < 1 ? (1 - q) * opacity : 0); if (at != null) press = Math.max(press, 1 - clamp(Math.abs(t - at - .03) / .09)); });
    arrow.attr('transform', `translate(${p.x} ${p.y}) scale(${size * (1 - .14 * press)})`).attr('opacity', fade(t, keys[0].t - .05, .2) * opacity);
    return p;
  }};
}
/** 0..1 "pressed" pulse around a click time, for a button that dips. */
export const pressed = (t, at) => at == null ? 0 : 1 - clamp(Math.abs(t - at - .03) / .1);
/** A tick that draws itself. Returns the path; set its dash with kit.draw(). */
export const check = (g, x, y, s, color = C.poppy, width = 4) => g.append('path').attr('d', tickPath(x, y, s)).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-linecap', 'square');
/** Small print that fits a width. */
export const small = (g, x, y, str, ink, o = {}) => label(g, x, y, str, {size: 24, color: ink.dim, ...o});
export {easeInOut};
/**
 * Pictures for a piece, ready before it draws: resolves with one data URL per address (null where a picture is missing),
 * so mount() can await it and seek() never depends on the network. Addresses are from the server root, e.g.
 * '/projects/<name>/storyboard-frames/01-hook.jpg'. `w` x `h` is the size they are stored at (cropped to fill).
 */
export const loadImages = (urls = [], w = 360, h = 640) => Promise.all(urls.map(url => !url ? null : new Promise(done => {
  const img = new Image(); img.onerror = () => done(null);
  img.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const k = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * k, dh = img.naturalHeight * k;
    c.getContext('2d').drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh); done(c.toDataURL('image/jpeg', .9)); };
  img.src = url;
})));
/** Overshoot-and-settle, for things that are dealt, dropped or sprung into place (the one place this theme lets motion pass its mark). */
export const spring = x => { x = Math.max(0, Math.min(1, x)); const c = 2.2; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
