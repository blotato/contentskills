import {C, stage, up, span, ease, io, light, ring, rays, flash, dot, title, mono, fit, capH, arcPts, pool, leave} from '../../kit.js';

// A dial of light with sixty ticks. The ring opens from the top, the ticks draw out both ways, and
// a red hand sweeps `turns` times round (the time passing) leaving a trail; when it stops a blue
// flash lands the value in the middle. `x`, `y`: centre; `r`: radius. Defaults sit top-right.
export const meta = {duration: 4, live: true};
export const defaults = {value: '13', label: 'YEARS IN THE MAKING', x: 790, y: 470, r: 150, turns: 1.5, seconds: 2};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root} = st, cx = props.x ?? 790, cy = props.y ?? 470, r = props.r ?? 150, turns = props.turns ?? 1.5, secs = props.seconds ?? 2;
  const shade = pool(root, cx, cy + r * .3, r * 1.9, r * 1.9, 0), dial = ring(root, cx, cy, r, {from: -90, width: 2.6});
  const ticks = rays(root, cx, cy, r + 10, r + 26, 60, -90, 270, {width: 1.4, fade: 0, echo: false}); ticks.forEach((tk, i) => { tk.opacity(i % 5 ? .45 : 1); tk.d = Math.min(i, 60 - i) / 30; });
  const hand = light(root, [[cx, cy], [cx, cy - r * .82]], {width: 3, color: 'red', echo: false}), hub = dot(root, cx, cy, {color: 'red', r: 8});
  const trail = light(root, arcPts(cx, cy, r * .9, -90, 270, 120), {width: 1.6, color: 'red', echo: false, halo: false});
  const size = Math.min(fit(up(props.value), r * 1.2, r * .6, {track: .08}), r * .6), val = title(root, up(props.value), cx, cy + capH(size) / 2, size, {track: .08, halo: 5});
  const label = props.label ? mono(root, cx, cy + r + 76, up(props.label), {size: 24, anchor: 'middle', track: .14, opacity: 0, halo: 5, weight: 500}) : null;
  const blue = flash(root, cx, cy, {color: 'blue', r: r * 1.4}), end = .9 + secs;
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    dial.range(tail, io(span(t, 0, 1.1))); ticks.forEach(tk => tk.range(tail, ease(span(t, .3 + tk.d * .8, .4))));
    const q = io(span(t, .9, secs)), a = q * turns * 360, on = t > .8 && t < end + .6 ? 1 - ease(span(t, end, .6)) : 0;
    hand.set([[cx, cy], [cx + Math.sin(a * Math.PI / 180) * r * .82, cy - Math.cos(a * Math.PI / 180) * r * .82]]).draw(1).opacity(on * (1 - x)); hub.set(ease(span(t, .7, .3)) * (1 - x));
    const tq = (q * turns) % 1 || (q >= 1 ? 1 : 0); trail.range(Math.max(0, tq - .3), tq).opacity(.7 * on * (1 - x));
    val.show(ease(span(t, end - .1, .9)), 1 - x); blue.set(t > end ? .55 * (1 - ease((t - end) / 1)) * (1 - x) : 0);
    label?.attr('opacity', .9 * ease(span(t, end + .3, .6)) * (1 - x));
  }};
}
