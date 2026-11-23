import {C, stage, up, span, ease, io, light, ring, flash, check, cross, title, mono, fit, capH, pool, leave} from '../../kit.js';

// A tick or a cross in a ring of light. The ring opens from the top; for `mark: 'check'` a white
// tick draws in and a blue flash lands it (a result); for `mark: 'cross'` two red strikes cross it
// out. A label lands below. `x`, `y`: centre; `r`: radius.
export const meta = {duration: 3, live: true};
export const defaults = {mark: 'check', label: 'DONE', note: '', x: 540, y: 400, r: 100};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root} = st, cx = props.x ?? 540, cy = props.y ?? 400, r = props.r ?? 100, isX = props.mark === 'cross';
  const shade = pool(root, cx, cy + r * .5, r * 2.6, r * 2.3, 0), circle = ring(root, cx, cy, r, {from: -90, width: 2.8});
  const mark = isX ? cross(root, cx, cy, r * 1.05, {width: 5, color: 'red', echo: false}) : check(root, cx, cy + r * .06, r * 1.05, {width: 5});
  const flashC = flash(root, cx, cy, {color: isX ? 'red' : 'blue', r: r * 2.4}), o = {track: .34}, text = up(props.label), size = Math.min(48, fit(text, 900, 48, o));
  const label = text ? title(root, text, cx, cy + r + 50 + capH(size), size, {...o, halo: 6}) : null, note = props.note ? mono(root, cx, cy + r + 120 + capH(size), up(props.note), {size: 26, anchor: 'middle', track: .12, opacity: 0, halo: 5, weight: 500}) : null;
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    circle.range(tail, io(span(t, 0, .9))); mark.range(tail, ease(span(t, .7, .5)));
    flashC.set(t > 1.1 ? .55 * (1 - ease((t - 1.1) / .9)) * (1 - x) : 0); label?.show(ease(span(t, 1, .9)), 1 - x); note?.attr('opacity', .9 * ease(span(t, 1.5, .5)) * (1 - x));
  }};
}
