import {card, guide, short, invert, shares, C, up, span, ease, io, light, ring, flash, mono, pulse} from './_card.js';

// A trend drawn as one line of light. A red head runs along it; every data point it passes opens a
// small ring and shows its value, a dashed drop falls to the axis, and the last point lands blue.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'Followers over a year', unit: 'Thousands of followers', clear: false,
  items: [{label: 'Jan', value: 2.1}, {label: 'Mar', value: 3.4}, {label: 'May', value: 3}, {label: 'Jul', value: 5.6}, {label: 'Sep', value: 8.2}, {label: 'Nov', value: 12.4}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, items = props.items ?? [], n = items.length, max = Math.max(1e-9, ...items.map(d => d.value)) * 1.08;
  const x0 = 150, x1 = 860, base = 790, top = 320, DUR = 2.8;
  for (let k = 1; k <= 3; k++) {
    const y = base - (base - top) * k / 3; guide(root, [[x0, y], [x1 + 30, y]], {dash: '2 9', opacity: .5}).draw(1);
    mono(root, x0 - 22, y + 6, short(max * k / 3), {size: 16, anchor: 'end', color: C.dim, opacity: .7});
  }
  const axis = light(root, [[x0 - 20, base], [x1 + 40, base]], {width: 1.4, opacity: .8});
  const pts = items.map((d, i) => [x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : .5), base - (base - top) * d.value / max]);
  const line = light(root, pts, {width: 2.6}), head = pulse(root, line, {color: 'red', r: 9}), at = shares(pts);
  const draw = u => io(u);
  const marks = items.map((d, i) => {
    const [x, y] = pts[i], reach = T + .4 + DUR * invert(draw, at[i]), last = i === n - 1;
    return {reach, last, drop: guide(root, [[x, y + 12], [x, base]], {dash: '3 7', opacity: .6}), r: ring(root, x, y, last ? 13 : 8, {from: -90, width: 2}),
      val: mono(root, x, y - 26, short(d.value), {size: last ? 32 : 22, anchor: 'middle', weight: 500, opacity: 0, halo: c.clear ? 4 : 0}),
      lab: mono(root, x, base + 42, up(d.label), {size: 20, anchor: 'middle', color: C.dim, track: .12, opacity: 0, halo: c.clear ? 4 : 0})};
  });
  const end = pts.at(-1) ?? [500, 500], blue = flash(root, end[0], end[1], {color: 'blue', r: 170});
  return {seek(t) {
    c.seek(t); axis.draw(ease(span(t, T - .3, 1.2)));
    const q = draw(span(t, T + .4, DUR)); line.draw(q); head(q);
    for (const m of marks) {
      const u = t - m.reach; m.r.draw(ease(u / .6)); m.drop.draw(ease(u / .8));
      m.val.attr('opacity', ease(u / .5)); m.lab.attr('opacity', .9 * ease(span(t, T + i0(m), .6)));
    }
    const u = t - T - .4 - DUR; blue.set(u > 0 ? .3 + .6 * Math.exp(-u * 1.5) : 0, 1 + .25 * ease(u));
  }};
  function i0(m) { return marks.indexOf(m) * .12; }
}
