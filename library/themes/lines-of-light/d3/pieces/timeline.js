import {card, C, up, span, ease, io, light, ring, flash, mono, title, fit, pulse, invert} from './_card.js';

// Steps down a line of light. The line runs down from the header with a red head; each step's ring
// opens from the top where the line touches it, its kicker and name land beside it, and the last
// step arrives blue.
export const meta = {duration: 7, live: true};
export const defaults = {title: 'How it works', unit: 'Five steps', clear: false,
  items: [{when: 'Step 01', label: 'Pick one idea'}, {when: 'Step 02', label: 'Write the hook'}, {when: 'Step 03', label: 'Record it'}, {when: 'Step 04', label: 'Cut it tight'}, {when: 'Step 05', label: 'Post and repeat'}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, items = (props.items ?? []).slice(0, 7), n = Math.max(1, items.length);
  const x = 190, y0 = 300, y1 = 860, pitch = n > 1 ? (y1 - y0 - 20) / (n - 1) : 0, DUR = 3.2, draw = u => io(u);
  const spine = light(root, [[x, 250], [x, y1 + 10]], {width: 2}), head = pulse(root, spine, {color: 'red', r: 9});
  const size = Math.min(34, ...items.map(d => fit(up(d.label), 620, 34, {track: .22})));
  const steps = items.map((d, i) => {
    const y = y0 + i * pitch, reach = T + DUR * invert(draw, (y - 14 - 250) / (y1 + 10 - 250)), last = i === n - 1;
    return {reach, last, y, r: ring(root, x, y, last ? 18 : 14, {from: -90, width: 2.2}),
      tick: light(root, [[x + 26, y], [x + 62, y]], {width: 1.2, opacity: .7}),
      kick: mono(root, x + 80, y - 18, up(d.when ?? ''), {size: 17, color: C.dim, track: .24, opacity: 0, halo: c.clear ? 4 : 0}),
      name: title(root, up(d.label), x + 80, y + 22, size, {track: .22, anchor: 'start', halo: c.clear ? 5 : 0})};
  });
  const L = steps.at(-1), blue = flash(root, x, L?.y ?? y1, {color: 'blue', r: 150});
  return {seek(t) {
    c.seek(t); const q = draw(span(t, T, DUR)); spine.draw(q); head(q);
    for (const s of steps) { const u = t - s.reach; s.r.draw(ease(u / .6)); s.tick.draw(ease((u - .2) / .4)); s.kick.attr('opacity', .9 * ease((u - .2) / .5)); s.name.show(ease((u - .1) / 1.1)); }
    if (L) { const u = t - L.reach - .4; blue.set(u > 0 ? .3 + .6 * Math.exp(-u * 1.5) : 0, 1 + .3 * ease(u)); }
  }};
}
