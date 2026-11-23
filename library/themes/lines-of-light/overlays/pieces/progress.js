import {C, stage, up, span, ease, io, light, flash, pulse, title, mono, band, leave} from '../../kit.js';

// A progress meter: a dim track of light with ticks, a bright line filling it to `value` (0..1)
// led by a red pulse, the percentage counting up in mono at the end, and a blue flash when it
// arrives. `x`, `y`: left end of the track; `width` its length.
export const meta = {duration: 3.5, live: true};
export const defaults = {value: .72, label: 'UPLOADING', x: 110, y: 1480, width: 860, seconds: 1.8, suffix: '%'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root} = st, x = props.x ?? 110, y = props.y ?? 1480, w = props.width ?? 860, v = Math.max(0, Math.min(1, props.value ?? .72)), secs = props.seconds ?? 1.8;
  const shade = band(root, y - 120, y + 90, 0), track = light(root, [[x, y], [x + w, y]], {width: 1.2, echo: false}); track.opacity(.45);
  const ticks = Array.from({length: 11}, (_, i) => { const l = light(root, [[x + w * i / 10, y - (i % 5 ? 10 : 18)], [x + w * i / 10, y + (i % 5 ? 10 : 18)]], {width: 1.4, echo: false}); l.opacity(.55); return l; });
  const fill = light(root, [[x, y], [x + w * v, y]], {width: 4}), head = pulse(root, fill, {r: 10}), blue = flash(root, x + w * v, y, {color: 'blue', r: 150});
  const label = title(root, up(props.label), x, y - 46, 26, {anchor: 'start', land: false, color: C.core, track: .45, halo: 5});
  const pct = mono(root, x + w, y - 40, '', {size: 34, anchor: 'end', track: .06, opacity: 0, halo: 5, weight: 500});
  return {seek(t) {
    const xo = leave(t, props.life, .5), tail = ease(xo); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - xo));
    track.range(tail, io(span(t, 0, .6))); ticks.forEach((tk, i) => tk.range(tail, ease(span(t, .1 + i * .03, .3))));
    const q = io(span(t, .5, secs)); fill.range(tail, q); head(xo > 0 ? 0 : q);
    label.show(ease(span(t, .2, .6)), 1 - xo); pct.select('tspan')?.text(Math.round(v * 100 * q) + (props.suffix ?? '%')); pct.attr('opacity', .95 * ease(span(t, .5, .4)) * (1 - xo));
    const end = .5 + secs; blue.set(t > end ? .55 * (1 - ease((t - end) / .9)) * (1 - xo) : 0);
  }};
}
