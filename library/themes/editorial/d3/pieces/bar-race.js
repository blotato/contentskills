import {card, grow, fade, fmt, fig, tag, box, text, label, smooth, span, mix, clamp, measure, tone, F} from './_card.js';

// A bar-chart race: thick bars grow, then re-sort as the figures change (rows glide past one another to their new
// ranks), and at `flagAt` the leader takes the accent, its name turns italic and a small word lands inside the end
// of its bar. No figures are printed unless `showValues` is set: the default data is a shape, not a measurement, and
// whoever turns figures on is responsible for where they come from (set `note` to match).
// Props: title, unit, items [{label, values: [v at step 0, v at step 1, ...]}], times (when each step is reached, s;
// the first is when the bars grow), showValues, decimals, prefix, suffix, flag, flagAt, colors (fills by item, kit
// colour names; umber by default), note, index, field, clear.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Which reels *worked*', unit: 'Illustrative · relative views', note: 'Illustrative · not real data', index: '14', field: 'paper', clear: false, flag: 'Worked', flagAt: .85, showValues: false, prefix: '', suffix: '', decimals: 0, times: [.15, .45, .7, .9], colors: null,
  items: [{label: 'Reel 01', values: [30, 42, 48, 52]}, {label: 'Reel 02', values: [52, 58, 63, 66]}, {label: 'Reel 03', values: [22, 30, 55, 96]}, {label: 'Reel 04', values: [44, 47, 50, 53]}, {label: 'Reel 05', values: [60, 62, 64, 70]}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, d3 = window.d3, items = props.items, n = items.length, K = Math.max(...items.map(d => d.values.length)), times = props.times ?? Array.from({length: K}, (_, k) => .2 + k * .3);
  const val = (d, k) => d.values[Math.min(k, d.values.length - 1)], max = d3.max(items, d => d3.max(d.values)) || 1, longest = Math.max(...items.map(d => measure(d.label, 100, {font: F.italic}))), size = Math.max(36, Math.min(n > 5 ? 44 : 52, 100 * 470 / Math.max(1, longest))), nameW = Math.min(470, longest * size / 100) + 26;      // names are never run over by the bars: the column takes up to 470 px and the type shrinks to fit it
  const xa = pg.x0 + nameW, room = pg.x1 - xa - (props.showValues ? fmt(max, props).length * 25 + 20 : 0), pitch = Math.min(128, (pg.y1 - pg.y0) / n), bh = Math.max(44, pitch * .68);
  const ranks = Array.from({length: K}, (_, k) => { const order = items.map((_, i) => i).sort((a, b) => val(items[b], k) - val(items[a], k) || a - b), r = []; order.forEach((i, pos) => r[i] = pos); return r; });
  const lead = ranks[K - 1].indexOf(0), axis = box(g, xa - 3, pg.y0, 3, 0, ink.fg);
  const rows = items.map((d, i) => {
    const row = g.append('g'), fill = props.colors?.[i % props.colors.length] ? tone(props.colors[i % props.colors.length]) : ink.rest;
    const bar = box(row, xa, -bh / 2, 0, bh, fill), hot = i === lead ? box(row, xa, -bh / 2, 0, bh, ink.accent, 0) : null;
    const name = text(row, pg.x0, size * .32, d.label, {font: F.head, size, color: ink.fg}), nameHot = i === lead ? text(row, pg.x0, size * .32, d.label, {font: F.italic, size, color: ink.accent, opacity: 0}) : null;
    const value = props.showValues ? fig(row, 0, 13, '', {size: 38, color: ink.fg}) : null;
    const flag = i === lead && props.flag ? label(row, 0, 11, props.flag, {size: 30, weight: 700, track: .14, anchor: 'end', color: ink.bg, opacity: 0}) : null;
    return {d, row, bar, hot, name, nameHot, value, flag, i};
  });
  return {seek(t) {
    pg.seek(t); axis.attr('height', n * pitch * grow(t, pg.T, .4));
    let k = 0; while (k < K - 1 && t >= times[k + 1]) k++;
    const k1 = Math.min(K - 1, k + 1), u = k1 > k ? smooth(span(t, times[k], times[k1] - times[k])) : 0, intro = grow(t, times[0] - .05, .45), f = fade(t, props.flagAt ?? 1.1, .3);
    rows.forEach(r => {
      const v = mix(val(r.d, k), val(r.d, k1), u), pos = mix(ranks[k][r.i], ranks[k1][r.i], u), w = Math.max(0, room * v / max * intro);
      r.row.attr('transform', `translate(0 ${(pg.y0 + (pos + .5) * pitch).toFixed(1)})`).attr('opacity', fade(t, times[0] - .08 + r.i * .03, .25));
      r.bar.attr('width', w); r.hot?.attr('width', w).attr('opacity', f); r.nameHot?.attr('opacity', f); if (r.nameHot) r.name.attr('opacity', 1 - f);
      r.value?.attr('transform', `translate(${(xa + w + 14).toFixed(1)} 0)`).text(fmt(v * intro, props));
      r.flag?.attr('transform', `translate(${(xa + w - 18 - (1 - f) * 16).toFixed(1)} 0)`).attr('opacity', w > 220 ? f : 0);
    });
  }};
}
