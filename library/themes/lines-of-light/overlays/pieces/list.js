import {C, stage, up, span, ease, io, light, flash, fire, title, mono, fit, capH, pad, band, leave} from '../../kit.js';

// A list that builds item by item over the footage, on a spine of light: the red dot fires down the
// spine, and at each item's time (`times`, seconds after the start) a triple bar reaches out and the
// item lands beside it with its number. `x`, `y`: top-left of the list.
export const meta = {duration: 5, live: true};
export const defaults = {title: '3 RULES', items: ['EDIT THE DRAFT', 'CHECK EVERY FACT', 'ADD ALT TEXT'], times: [.6, 1.5, 2.4], x: 100, y: 300, pitch: 120};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, x = props.x ?? 100, y = props.y ?? 300, items = [].concat(props.items ?? []).map(up), pitch = props.pitch ?? 120, bx = x + 150;
  const size = Math.min(44, fit(items, W - bx - 70, 44, {track: .2})), top = y + 70, bottom = top + items.length * pitch;
  const shade = band(root, y - 90, bottom + 40, 0);
  const head = title(root, up(props.title), x, y + 10, 30, {anchor: 'start', land: false, color: C.core, track: .45, halo: 5});
  const shot = fire(root, [[x, y + 40], [x, top]], {dur: .4, hold: .6, retract: .5, r: 11}), last = (props.times?.at(-1) ?? 2.4) + .3, spine = light(root, [[x, top], [x, bottom - pitch * .4]], {width: 2.2});
  const rows = items.map((item, i) => { const yy = top + pitch * (i + .5);
    return {at: props.times?.[i] ?? .6 + i * .9, bars: [-7, 0, 7].map((dy, j) => light(root, [[x, yy + dy], [bx - 20, yy + dy]], {width: j === 1 ? 3 : 1.8, echo: j === 1})),
      num: mono(root, bx, yy - size - 14, pad(i + 1), {size: 24, track: .3, opacity: 0, halo: 4, weight: 500}), line: title(root, item, bx, yy + size * .36, size, {anchor: 'start', track: .2, halo: 6}), blue: flash(root, bx - 20, yy, {color: 'blue', r: 90})}; });
  return {seek(t) {
    const x2 = leave(t, props.life, .5), tail = ease(x2); shade.attr('opacity', ease(span(t, 0, .4)) * (1 - x2));
    shot.seek(t); spine.range(tail, io(span(t, .4, last - .4))); head.show(ease(span(t, .1, .7)), 1 - x2);
    rows.forEach(r => { r.bars.forEach((b, j) => b.range(tail, ease(span(t, r.at + j * .05, .6)))); r.blue.set(t > r.at + .5 ? .5 * (1 - ease((t - r.at - .5) / .9)) * (1 - x2) : 0);
      r.num.attr('opacity', .85 * ease(span(t, r.at + .4, .4)) * (1 - x2)); r.line.show(ease(span(t, r.at + .4, .9)), 1 - x2); });
    root.attr('opacity', 1 - x2 * x2);
  }};
}
