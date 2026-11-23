import {C, stage, up, span, ease, io, light, strike, flash, title, mono, fit, capH, measure, pool, leave} from '../../kit.js';

// Struck out. A word lands under a line of light; at `at` seconds a red strike crosses it (the
// cause), the word dims, and the replacement lands below in a blue flash (the result).
// `y`: centre of the struck word.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'FALL 2025', result: 'NOV 19', note: 'THE THIRD DATE STUCK', at: 1.6, y: 360};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, y = props.y ?? 360, at = props.at ?? 1.6, o = {track: .3}, A = up(props.text), B = up(props.result ?? '');
  const size = Math.min(84, fit([A, B], 860, 84, o)), cap = capH(size), aw = measure(A, size, o), y2 = y + cap + 110;
  const shade = pool(root, W / 2, (y + y2) / 2, 600, (y2 - y) / 2 + 220, 0);
  const above = [light(root, [[W / 2, y - cap / 2 - 36], [W / 2 - aw / 2 - 30, y - cap / 2 - 36]], {width: 2.2}), light(root, [[W / 2, y - cap / 2 - 36], [W / 2 + aw / 2 + 30, y - cap / 2 - 36]], {width: 2.2})];
  const first = title(root, A, W / 2, y + cap / 2, size, {...o, halo: 6}), cut = strike(root, W / 2 - aw / 2 - 30, y + cap * .4, W / 2 + aw / 2 + 30, y - cap * .5, {width: 6});
  const second = B ? title(root, B, W / 2, y2 + cap / 2, size, {...o, halo: 6}) : null, blue = flash(root, W / 2, y2, {color: 'blue', r: 280});
  const note = props.note ? mono(root, W / 2, y2 + cap / 2 + 70, '↳ ' + up(props.note), {size: 26, anchor: 'middle', track: .14, opacity: 0, halo: 5, weight: 500}) : null;
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    above.forEach(l => l.range(tail, io(span(t, 0, .8)))); first.show(ease(span(t, .2, .9)), (1 - x) * (1 - .55 * ease(span(t, at + .2, .4))));
    cut.range(tail, ease(span(t, at, .22))); blue.set(t > at + .4 ? .5 * (1 - ease((t - at - .4) / 1)) * (1 - x) : 0);
    second?.show(ease(span(t, at + .4, .9)), 1 - x); note?.attr('opacity', .9 * ease(span(t, at + 1, .6)) * (1 - x));
  }};
}
