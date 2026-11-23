import {C, stage, up, span, ease, io, light, flash, fire, title, mono, fit, capH, measure, pool, leave} from '../../kit.js';

// The theme's signature beat over footage: a red dot fires a line along a path (down, then across)
// to a label; on arrival a short rule opens under the label and it lands, with a mono sub-line.
// `from` is the dot, `x`, `y` the label's left baseline.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'STEP 01', sub: 'WRITE THE CAPTION', from: [110, 290], x: 200, y: 420, dur: .9};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, [fx, fy] = props.from ?? [110, 290], x = props.x ?? 200, y = props.y ?? 420, o = {track: .3};
  const text = up(props.label), size = Math.min(60, fit(text, W - x - 80, 60, o)), cap = capH(size), w = Math.max(measure(text, size, o), measure(up(props.sub ?? ''), 28, {font: '"IBM Plex Mono"', weight: 500, track: .12}));
  const shade = pool(root, x + w / 2, y + 10, w * .7 + 140, 170, 0);
  const shot = fire(root, [[fx, fy], [fx, y + 24], [x - 30, y + 24]], {dur: props.dur ?? .9, hold: 99, r: 13});
  const rule = light(root, [[x - 30, y + 24], [x + w, y + 24]], {width: 2.4});
  const label = title(root, text, x, y - 6, size, {...o, anchor: 'start', halo: 6});
  const sub = props.sub ? mono(root, x, y + 76, up(props.sub), {size: 28, track: .12, opacity: 0, halo: 5, weight: 500}) : null;
  const blue = flash(root, x - 30, y + 24, {color: 'blue', r: 120}), T = shot.arrive;
  return {seek(t) {
    const x2 = leave(t, props.life, .5), tail = ease(x2); shade.attr('opacity', ease(span(t, T - .3, .5)) * (1 - x2));
    shot.seek(t); shot.line.range(tail, ease(span(t, 0, T))); rule.range(tail, io(span(t, T, .9)));
    blue.set(t > T ? .55 * (1 - ease((t - T) / .9)) * (1 - x2) : 0); label.show(ease(span(t, T + .1, 1)), 1 - x2);
    sub?.attr('opacity', .9 * ease(span(t, T + .8, .6)) * (1 - x2)); root.attr('opacity', 1 - x2 * x2);
  }};
}
