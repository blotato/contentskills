import {C, stage, up, span, ease, io, light, flash, fire, title, mono, fit, capH, measure, pool, leave} from '../../kit.js';

// A name strap. A red dot at the left fires a line out under where the name will sit; a short
// vertical opens at its end, the name lands above the line and the role types in mono below.
// `y` is the line's height in the frame.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'ALEX RIVERA', role: 'MAKES THINGS MOVE', y: 1540};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, y = props.y ?? 1540, x0 = 90, name = up(props.name), o = {track: .24};
  const size = fit(name, 760, 62, o), cap = capH(size), w = Math.max(measure(name, size, o), measure(up(props.role ?? ''), 30, {font: '"IBM Plex Mono"', weight: 500, track: .12})) + 70;
  const shade = pool(root, x0 + w / 2, y, w * .75 + 120, 190, 1);
  const shot = fire(root, [[x0, y], [x0 + w, y]], {dur: .7, hold: 99, r: 12});
  const tick = light(root, [[x0 + w, y], [x0 + w, y - cap - 30]], {width: 2.4});
  const text = title(root, name, x0 + 30, y - 28, size, {...o, anchor: 'start', halo: 6});
  const role = mono(root, x0 + 30, y + 52, '', {size: 30, track: .12, opacity: .9, halo: 5, weight: 500}), roleText = up(props.role ?? '');
  const blue = flash(root, x0 + w, y, {color: 'blue', r: 130});
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    shot.seek(t); shot.line.range(tail, ease(span(t, 0, .7))); tick.range(tail, io(span(t, .7, .5)));
    blue.set(t > .7 ? .5 * (1 - ease((t - .7) / .9)) * (1 - x) : 0);
    text.show(ease(span(t, .55, 1)), 1 - x);
    role.select('tspan').text(roleText.slice(0, Math.round(roleText.length * span(t, 1, .9)))); role.attr('opacity', .9 * (1 - x));
    root.attr('opacity', 1 - x * x);
  }};
}
