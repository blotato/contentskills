import {card, short, C, up, span, ease, io, light, ring, flash, mono, dot, bez, pulse, fit} from './_card.js';

// Cause and results: a red source on the left sends curves of light out to each result, a red pulse
// riding each one; a ring opens round every result where its curve arrives, flashing blue. Line weight
// follows the value.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'One post, four results', unit: 'Illustrative · what one video led to', clear: false, source: 'One video',
  items: [{label: 'New followers', value: 1200}, {label: 'Site visits', value: 640}, {label: 'Email sign-ups', value: 180}, {label: 'Sales', value: 24}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, items = (props.items ?? []).slice(0, 6), n = Math.max(1, items.length), max = Math.max(1e-9, ...items.map(d => d.value));
  const sx = 200, sy = 570, rx = 600, pitch = Math.min(150, 560 / n), y0 = sy - pitch * (n - 1) / 2;
  const src = dot(root, sx, sy, {color: 'red', r: 16}), srcRing = ring(root, sx, sy, 34, {from: 0, width: 2});
  const srcLab = mono(root, sx, sy - 62, up(props.source ?? ''), {size: 20, anchor: 'middle', track: .18, opacity: 0, halo: c.clear ? 4 : 0});
  const size = Math.min(19, ...items.map(d => fit(up(d.label), 250, 19, {font: '"IBM Plex Mono"', track: .14})));
  const outs = items.map((d, i) => {
    const y = y0 + i * pitch, pts = bez([sx + 34, sy], [sx + 230, sy], [rx - 230, y], [rx - 18, y], 60), at = T + .5 + i * .25;
    const line = light(root, pts, {width: 1 + 2.2 * Math.sqrt(d.value / max)});
    return {y, at, line, run: pulse(root, line, {color: 'red', r: 8}), r: ring(root, rx, y, 18, {from: 180, width: 2}), blue: flash(root, rx, y, {color: 'blue', r: 110}),
      val: mono(root, rx + 44, y + 2, short(d.value), {size: 32, weight: 500, opacity: 0, halo: c.clear ? 4 : 0}),
      lab: mono(root, rx + 44, y + 30, up(d.label), {size, color: C.dim, track: .14, opacity: 0, halo: c.clear ? 4 : 0})};
  });
  return {seek(t) {
    c.seek(t); src.set(ease(span(t, T - .2, .4))); srcRing.draw(ease(span(t, T, .7))); srcLab.attr('opacity', ease(span(t, T + .1, .6)));
    for (const o of outs) {
      const q = io(span(t, o.at, 1.6)); o.line.draw(q); o.run(q);
      const u = t - o.at - 1.6; o.r.draw(ease(u / .6)); o.blue.set(u > 0 ? .2 + .6 * Math.exp(-u * 1.8) : 0, .9 + .3 * ease(u));
      o.val.attr('opacity', ease((u - .1) / .5)); o.lab.attr('opacity', .9 * ease((u - .2) / .5));
    }
  }};
}
