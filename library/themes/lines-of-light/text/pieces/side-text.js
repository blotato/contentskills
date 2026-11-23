import {C, stage, up, span, ease, io, light, flash, fire, title, mono, fit, capH, measure, pool, leave} from '../../kit.js';

// Text running up (left) or down (right) the edge of the frame, between `top` and `bottom`. A red dot
// fires a line along the edge; the words land beside it and a mono line sits on the far side.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'BEHIND THE SCENES', sub: 'PART 02 / UNCUT', side: 'left', top: 300, bottom: 1560, edge: 40};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, top = props.top ?? 300, bottom = props.bottom ?? 1560, room = bottom - top, left = props.side !== 'right', o = {track: .3};
  const text = up(props.text), size = Math.min(52, fit(text, room - 140, 52, o)), cap = capH(size), edge = props.edge ?? 40, L = measure(text, size, o) + 120;
  // Local x runs along the edge (upward on the left, downward on the right); local y runs into the frame.
  const g = root.group().attr('transform', left ? `translate(${edge} ${bottom - (room - L) / 2}) rotate(-90)` : `translate(${W - edge} ${top + (room - L) / 2}) rotate(90)`);
  const shade = pool(g, L / 2, 60, L * .6, 130, 1);
  const shot = fire(g, [[0, 14], [L, 14]], {dur: .9, hold: 99, r: 10});
  const words = title(g, text, 60, 14 + 30 + cap, size, {...o, anchor: 'start', halo: 6});
  const sub = props.sub ? mono(g, 60, 14 + 30 + cap + 50, up(props.sub), {size: 28, track: .2, opacity: 0, halo: 5, weight: 500}) : null;
  const end = light(g, [[L, 0], [L, 30 + cap + 30]], {width: 2.2}), blue = flash(g, L, 14, {color: 'blue', r: 100});
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    shot.seek(t); shot.line.range(tail, ease(span(t, 0, .9))); end.range(tail, io(span(t, .9, .5)));
    blue.set(t > .9 ? .5 * (1 - ease((t - .9) / .9)) * (1 - x) : 0);
    words.show(ease(span(t, .5, 1)), 1 - x); sub?.attr('opacity', .85 * ease(span(t, 1.2, .6)) * (1 - x)); root.attr('opacity', 1 - x * x);
  }};
}
