import {C, stage, up, span, ease, io, light, ring, flash, fire, title, mono, fit, measure, pool, leave} from '../../kit.js';

// A callout pointing at a spot. A red dot beside the label fires a line along an elbow to the
// target; a ring opens round the target where the line arrives and flashes blue, an arrowhead
// draws in, and the label lands. `target`: the spot; `x`, `y`: the label's left baseline.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'THIS ONE', sub: 'THE BUTTON THAT POSTS', x: 110, y: 380, target: [760, 600], r: 46};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, x = props.x ?? 110, y = props.y ?? 380, [tx, ty] = props.target ?? [760, 600], r = props.r ?? 46, o = {track: .3};
  const text = up(props.label), size = Math.min(46, fit(text, W - x - 80, 46, o)), lw = measure(text, size, o);
  const shade = pool(root, x + lw / 2, y + 10, lw * .7 + 140, 150, 0);
  const ex = Math.max(x + lw + 40, tx - 80), a = Math.atan2(ty - (y + 24), tx - ex), hx = tx - Math.cos(a) * r, hy = ty - Math.sin(a) * r;
  const shot = fire(root, [[x - 30, y + 24], [ex, y + 24], [hx, hy]], {dur: .9, hold: 99, r: 11});
  const target = ring(root, tx, ty, r, {from: a * 180 / Math.PI + 180, width: 2.6}), blue = flash(root, tx, ty, {color: 'blue', r: r * 3});
  const ah = 22, arrow = light(root, [[hx - Math.cos(a - .5) * ah, hy - Math.sin(a - .5) * ah], [hx, hy], [hx - Math.cos(a + .5) * ah, hy - Math.sin(a + .5) * ah]], {width: 2.6});
  const label = title(root, text, x, y, size, {...o, anchor: 'start', halo: 6}), sub = props.sub ? mono(root, x, y + 70, up(props.sub), {size: 26, track: .12, opacity: 0, halo: 5, weight: 500}) : null, T = .9;
  return {seek(t) {
    const xo = leave(t, props.life, .5), tail = ease(xo); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - xo));
    shot.seek(t); shot.line.range(tail, ease(span(t, 0, T))); arrow.range(tail, ease(span(t, T, .4))); target.range(tail, io(span(t, T, .9)));
    blue.set(t > T + .2 ? .6 * (1 - ease((t - T - .2) / 1)) * (1 - xo) : 0); label.show(ease(span(t, .3, 1)), 1 - xo); sub?.attr('opacity', .9 * ease(span(t, 1.1, .6)) * (1 - xo));
  }};
}
