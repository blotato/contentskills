import {card, guide, short, C, up, span, ease, io, light, openBox, flash, mono, fit} from './_card.js';

// Bars of light. The baseline draws across from the red dot's line; each bar opens upward from the
// point where the baseline reaches it (both sides climb and meet across the top), its value counting
// up above it. The tallest bar lands with a blue flash. Values are relative; labels carry the data.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'Views per week', unit: 'Thousands of views', clear: false,
  items: [{label: 'W1', value: 12}, {label: 'W2', value: 18}, {label: 'W3', value: 15}, {label: 'W4', value: 27}, {label: 'W5', value: 34}, {label: 'W6', value: 46}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, items = props.items ?? [], n = Math.max(1, items.length), max = Math.max(1e-9, ...items.map(d => d.value));
  const x0 = 120, x1 = 880, base = 800, top = 330, slot = (x1 - x0) / n, bw = Math.min(84, slot * .46), best = items.findIndex(d => d.value === max), BASE = 1.6;
  for (let k = 1; k <= 3; k++) guide(root, [[x0, base - (base - top) * k / 3], [x1, base - (base - top) * k / 3]], {dash: '2 10', opacity: .35}).draw(1);
  const baseline = light(root, [[x0 - 30, base], [x1 + 20, base]], {width: 1.8});
  const labelSize = Math.min(22, fit(items.map(d => up(d.label)).sort((a, b) => b.length - a.length)[0] ?? 'X', slot * .9, 22, {font: '"IBM Plex Mono"', track: .1}));
  const bars = items.map((d, i) => {
    const cx = x0 + slot * (i + .5), h = Math.max(6, (base - top) * d.value / max), f = (cx - x0 + 30) / (x1 - x0 + 50);
    const at = T + BASE * (1 - Math.pow(1 - f, .25)) + .05;   // when the eased baseline reaches this bar
    const box = openBox(root, cx - bw / 2, base - h, bw, h, {from: 'bottom', width: 2.2});
    const val = mono(root, cx, base - h - 22, '', {size: 26, anchor: 'middle', weight: 500, opacity: 0, halo: c.clear ? 4 : 0});
    const lab = mono(root, cx, base + 44, up(d.label), {size: labelSize, anchor: 'middle', color: C.dim, track: .1, opacity: 0, halo: c.clear ? 4 : 0});
    return {d, cx, h, at, box, val, lab};
  });
  const b = bars[best], blue = b ? flash(root, b.cx, base - b.h, {color: 'blue', r: 160}) : null;
  return {seek(t) {
    c.seek(t); baseline.draw(ease(span(t, T, BASE)));
    for (const s of bars) {
      const q = io(span(t, s.at, 1.3)); s.box.draw(q);
      s.val.attr('opacity', ease(span(t, s.at + .3, .6))).attr('y', base - s.h * q - 22).text(short(s.d.value * ease(span(t, s.at, 1.3))));
      s.lab.attr('opacity', .9 * ease(span(t, s.at - .1, .5)));
    }
    if (b) { const u = t - b.at - 1.3; blue.set(u > 0 ? .3 + .55 * Math.exp(-u * 1.6) : 0, 1 + .3 * ease(u)); }
  }};
}
