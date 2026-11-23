import {C, F, line, text, draw, span, easeOut, flicker, typed, hash, blink} from '../../hud.js';
import {card} from './_card.js';

// A calendar heat grid: one cell per day, a column per week. The empty grid boots in a diagonal
// wave, a cursor sweeps across filling each week and raising its total underneath, then the
// longest unbroken run is traced cell by cell and the summary figures count up. The figures are
// worked out from `values` (one number per day, oldest first, starting on `firstDay`).
export const meta = {duration: 7.5, live: true};
const sample = Array.from({length: 26 * 7}, (_, i) => { const week = Math.floor(i / 7), day = i % 7, r = hash(i, 8), busy = week > 9 ? .78 : week > 3 ? .55 : .3; return r > busy || (day > 4 && r > .35) ? 0 : 1 + Math.floor(hash(i, 9) * (week > 14 ? 4 : 2.2)); });
export const defaults = {title: 'Posting streak', unit: 'Illustrative · posts per day over 26 weeks', months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'], days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], noun: 'POSTS', clear: false, values: sample};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame} = card(el, props), V = props.values, weeks = Math.ceil(V.length / 7), pitch = Math.min(40, 790 / weeks), size = pitch - 5, x0 = 916 - weeks * pitch, y0 = 316, max = d3.max(V) || 1, sweep = [1, 3.4];
  const tone = v => v <= 0 ? C.grid : v >= max ? C.amber : v / max > .5 ? C.cyan : C.teal;
  props.days.forEach((d, j) => { if (j % 2 === 0) text(root, x0 - 18, y0 + j * pitch + size * .75, d, {size: 20, color: C.dim, anchor: 'end', spacing: '0'}); });
  const months = props.months.map((m, i) => text(root, x0 + i / props.months.length * weeks * pitch, y0 - 16, m, {size: 20, color: C.dim, spacing: '.12em'}));
  const cells = V.map((v, i) => { const w = Math.floor(i / 7), d = i % 7, x = x0 + w * pitch, y = y0 + d * pitch;
    return {i, w, d, v, slot: root.append('rect').attr('x', x).attr('y', y).attr('width', size).attr('height', size).attr('fill', 'none').attr('stroke', C.grid).attr('stroke-width', 1.5),
      fill: root.append('rect').attr('x', x).attr('y', y).attr('width', size).attr('height', size).attr('fill', tone(v)).attr('opacity', 0)}; });
  // Longest run of consecutive active days.
  let best = [0, 0], run = 0; V.forEach((v, i) => { run = v > 0 ? run + 1 : 0; if (run > best[1]) best = [i - run + 1, run]; });
  const trace = d3.range(best[0], best[0] + best[1]).map(i => root.append('rect').attr('x', x0 + Math.floor(i / 7) * pitch - 2).attr('y', y0 + (i % 7) * pitch - 2).attr('width', size + 4).attr('height', size + 4).attr('fill', 'none').attr('stroke', C.white).attr('stroke-width', 3));
  const base = y0 + 7 * pitch + 150, totals = d3.range(weeks).map(w => d3.sum(V.slice(w * 7, w * 7 + 7))), tmax = d3.max(totals) || 1; line(root, `M${x0} ${base + 4}H${x0 + weeks * pitch - 5}`, C.dim, 2);
  const bars = totals.map((v, w) => ({v, w, node: root.append('rect').attr('x', x0 + w * pitch).attr('width', size).attr('fill', v === tmax ? C.amber : C.cyan)})), barTag = text(root, x0, base - 118, 'PER WEEK', {size: 20, color: C.dim, spacing: '.16em'});
  const cursor = line(root, `M0 ${y0 - 8}V${base + 4}`, C.white, 2), legend = root.append('g'); text(legend, 916 - 5 * 30 - 76, 250, 'LESS', {size: 18, color: C.dim, spacing: '.1em'}).attr('text-anchor', 'end'); text(legend, 916, 250, 'MORE', {size: 18, color: C.dim, anchor: 'end', spacing: '.1em'});
  [0, .3, .6, .8, 1].forEach((f, k) => legend.append('rect').attr('x', 916 - 62 - (5 - k) * 30).attr('y', 232).attr('width', 22).attr('height', 22).attr('fill', tone(f * max)).attr('stroke', C.grid));
  const stats = [{label: 'ACTIVE DAYS', value: V.filter(v => v > 0).length, color: C.cyan}, {label: 'LONGEST RUN', value: best[1], color: C.white}, {label: `TOTAL ${props.noun}`, value: d3.sum(V), color: C.amber}].map((s, k) => { const g = root.append('g').attr('transform', `translate(${96 + k * 285} ${base + 54})`);
    line(g, 'M0 0V104', s.color, 5); text(g, 22, 22, s.label, {size: 22, color: C.dim, spacing: '.14em'}); return {...s, g, k, num: text(g, 20, 98, '', {size: 70, font: F.display, weight: 800, color: s.color, spacing: '0'})}; });
  return {seek(t) {
    draw(frame, span(t, 0, .5)); months.forEach((m, i) => m.attr('opacity', flicker(t, .4 + i * .08))); legend.attr('opacity', flicker(t, .5)); barTag.attr('opacity', flicker(t, sweep[0]));
    const q = span(t, sweep[0], sweep[1] - sweep[0]), again = ((t - sweep[1] - 1) / 3.5) % 1, col = q < 1 ? q * weeks : t > sweep[1] + 1 ? again * weeks : -9, cx = x0 + col * pitch;
    cursor.attr('transform', `translate(${cx} 0)`).attr('opacity', col >= 0 ? .85 : 0);
    for (const c of cells) { const filled = q >= 1 || c.w < q * weeks, near = Math.exp(-Math.abs(col - c.w - .5) / 1.2);
      c.slot.attr('opacity', span(t, .3 + (c.w + c.d) * .018, .15)); c.fill.attr('opacity', filled && c.v > 0 ? Math.min(1, .78 + near * .5) : 0).attr('fill', filled && near > .75 && q < 1 ? C.white : tone(c.v)); }
    for (const b of bars) { const h = b.v / tmax * 96 * easeOut(span(t, sweep[0] + b.w / weeks * (sweep[1] - sweep[0]), .5)); b.node.attr('y', base - h).attr('height', h); }
    const march = (t - sweep[1] - .2) / .06; trace.forEach((r, k) => r.attr('opacity', march > k ? (march - k < 3 ? 1 : .55 + .45 * Math.abs(Math.sin(t * 2.4 - k * .4))) : 0));
    for (const s of stats) { const at = sweep[1] - .6 + s.k * .3; s.g.attr('opacity', flicker(t, at)); s.num.text(Math.round(s.value * easeOut(span(t, at, 1)))); }
    cells.at(-1).slot.attr('stroke', q >= 1 && blink(t, 2) ? C.white : C.grid);
  }};
}
