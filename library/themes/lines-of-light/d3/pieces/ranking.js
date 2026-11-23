import {card, short, C, up, span, ease, light, ring, flash, mono, title, fit} from './_card.js';

// A ranked list: each row's rank lands in tracked capitals, then a line of light runs out to a length
// set by its value and opens a small ring at its end. The leader's line lands with a blue flash.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'Top formats', unit: 'Average watch time · seconds', clear: false,
  items: [{label: 'Tutorials', value: 48}, {label: 'Behind the scenes', value: 39}, {label: 'Lists', value: 31}, {label: 'Reactions', value: 22}, {label: 'Vlogs', value: 15}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, items = (props.items ?? []).slice(0, 7), n = Math.max(1, items.length), max = Math.max(1e-9, ...items.map(d => d.value));
  const pitch = Math.min(112, 600 / n), y0 = 300 + (600 - pitch * n) / 2, xL = 210, span0 = 600, STEP = .3;
  const rows = items.map((d, i) => {
    const y = y0 + i * pitch, len = Math.max(20, span0 * d.value / max), at = T + .1 + i * STEP, ex = xL + len;
    const rank = title(root, String(i + 1).padStart(2, '0'), 110, y + 22, 30, {track: .1, anchor: 'start'});
    const lab = mono(root, xL, y + 4, up(d.label), {size: Math.min(22, fit(up(d.label), 560, 22, {font: '"IBM Plex Mono"', track: .12})), track: .12, opacity: 0, halo: c.clear ? 4 : 0});
    const bar = light(root, [[xL, y + 26], [ex, y + 26]], {width: i ? 2 : 2.8}), end = ring(root, ex + 9, y + 26, 9, {from: 180, width: 1.8});
    const val = mono(root, ex + 32, y + 33, short(d.value), {size: 22, weight: 500, opacity: 0, halo: c.clear ? 4 : 0});
    return {at, rank, lab, bar, end, val, ex, y};
  });
  const lead = rows[0], blue = lead ? flash(root, lead.ex + 9, lead.y + 26, {color: 'blue', r: 130}) : null;
  return {seek(t) {
    c.seek(t);
    for (const r of rows) {
      r.rank.show(ease(span(t, r.at, 1))); r.lab.attr('opacity', ease(span(t, r.at + .2, .6)));
      const q = ease(span(t, r.at + .3, 1.4)); r.bar.draw(q); r.end.draw(ease(span(t, r.at + 1.1, .6))); r.val.attr('opacity', ease(span(t, r.at + 1.2, .5)));
    }
    if (lead) { const u = t - lead.at - 1.4; blue.set(u > 0 ? .25 + .6 * Math.exp(-u * 1.6) : 0, 1 + .3 * ease(u)); }
  }};
}
