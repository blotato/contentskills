import {comicStage, C, up, fit, capH, glyphs, slam, captionBox, scaleTo, span, spring, clipShape, halftonePath, inked, txt} from '../../kit.js';

/**
 * Shared diagram card: the printed paper panel (or a floating paper sheet when `clear`), the title
 * shouted in inked lettering and the unit line in a yellow caption box. Returns the stage plus
 * intro(t), which slams the title on and pops the unit box. Content goes below y = 250.
 */
export function card(el, props) {
  const stage = comicStage(el, {card: true, clear: props.clear, accent: props.accent ?? 'paper'}), {root, ink} = stage;
  const title = up(props.title), size = fit(title, 830, 86), cap = capH(size);
  const letters = glyphs(root, title, 78, 92 + cap * .5 + 30, size, {color: props.titleColor ?? ink.head, seed: 6, outline: Math.max(3, size * .045), drop: Math.max(4, size * .07)});
  const unit = props.unit ? captionBox(root, 78, 172, props.unit, {size: 24, padX: 16, padY: 11, drop: 5, width: 4, tilt: -1.5}) : null;
  return {...stage, intro(t) {
    letters.forEach(u => slam(u, span(t, .04 + u.i * .028, .4), 0, {from: 1.9, twist: 10}));
    if (unit) scaleTo(unit.g, spring(span(t, .35, .4)), 0);
  }};
}
/**
 * A flat shape with a Ben-Day second tone: fill, dots clipped to the shape, ink outline, hard
 * shadow. `area` [x, y, w, h] is where the dots are laid (cover everything the shape may reach);
 * set(d) changes the outline (the dots stay put and are re-clipped).
 */
export function toned(stage, g, {fill = C.red, dot = C.ink, dotOpacity = .2, area = [0, 0, 1000, 1000], pitch = 22, from = [0, 1], reach = .9, flat = 0, width = 7, drop = 9} = {}) {
  const group = g.append('g'), base = inked(group, '', {fill, width, drop}), clip = clipShape(stage, '');
  group.append('g').attr('clip-path', clip.url).append('path').attr('d', halftonePath(...area, {pitch, from, reach, flat})).attr('fill', dot).attr('opacity', dotOpacity);
  const edge = group.append('path').attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', width).attr('stroke-linejoin', 'round');
  const api = {g: group, set(d) { base.set(d); clip.path.attr('d', d); edge.attr('d', d); return api; }};
  return api;
}
/** A shouted value: Bangers, inked and extruded. Returns the txt group (say() changes it). */
export const shout = (g, x, y, str, {size = 56, color = C.yellow, anchor = 'middle'} = {}) =>
  txt(g, x, y, str, {size, color, role: 'head', anchor, outline: Math.max(5, size * .1), drop: Math.max(3, size * .06)});
/** A label in the plate face. */
export const label = (g, x, y, str, {size = 30, color = C.ink, anchor = 'middle', ...rest} = {}) => txt(g, x, y, up(str), {size, color, role: 'slab', anchor, ...rest});
/** A number easing toward its value: whole numbers stay whole, others keep one decimal. */
export const counted = (value, q) => Number.isInteger(value) ? String(Math.round(value * q)) : (value * q).toFixed(1);
/**
 * A label set on one line if it fits at `min` size or more, otherwise broken into its best two
 * lines. Returns {lines, size}.
 */
export function twoLine(text, width, max, o = {role: 'slab'}, min = 24) {
  const str = up(text), one = fit(str, width, max, o), words = str.split(/\s+/);
  if (one >= min || words.length < 2) return {lines: [str], size: one};
  let best = null;
  for (let k = 1; k < words.length; k++) { const lines = [words.slice(0, k).join(' '), words.slice(k).join(' ')], size = fit(lines, width, max, o); if (!best || size > best.size) best = {lines, size}; }
  return best;
}
