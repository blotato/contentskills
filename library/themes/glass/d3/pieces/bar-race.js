import {C, card, txt, label, fit, pad2, comma, fade, glide, span, swell, mix, clamp, easeInOut, clipBox} from '../../kit.js';
import {hold} from './_local.js';
import {loadImages, spring} from '../../overlays/pieces/_ui.js';

// A bar-chart race: thick coloured bars spring out, then re-sort as the figures change — bars slide
// past one another to their new ranks, the rank numerals roll — and at `flagAt` the leader pulls ahead,
// takes the accent while the rest step back, and a flag lands on the end of its bar.
//   items: [{label, values: [v at step 0, v at step 1, ...], thumb (optional picture address from the server root)}]
//   times: when each step is reached (seconds; the first is when the bars spring out)
//   showValues: true prints each bar's figure at its tip, counting as the bars move (with `prefix`, `suffix`, `decimals`).
//   By default no figures are shown and the note says so: the default data is a shape, not a measurement. Whoever turns
//   figures on is responsible for where they come from (set `note` accordingly, or clear it).
//   labels: 'above' sets each label on its own line over a slimmer bar (for titles); 'inside' (default) sets it in the bar.
// axis: the name of what is measured; flag: the word that lands on the leader; colors: fills by item (kit colour names).
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Which reels worked', unit: 'Illustrative · relative views', note: 'Illustrative · not real data', axis: 'Views', flag: 'Worked', flagAt: 1.5, clear: false, field: 'bone', accent: 'poppy',
  showValues: false, prefix: '', suffix: '', decimals: 0, labels: 'inside', times: [.1, .65, 1.05, 1.45], colors: ['cobalt', 'ink', 'sun', 'cobalt', 'ink', 'sun'],
  items: [{label: 'Reel 01', values: [30, 42, 48, 52]}, {label: 'Reel 02', values: [52, 58, 63, 66]}, {label: 'Reel 03', values: [22, 30, 55, 96]}, {label: 'Reel 04', values: [44, 47, 50, 53]}, {label: 'Reel 05', values: [60, 62, 64, 70]}, {label: 'Reel 06', values: [16, 22, 27, 31]}]};

export async function mount(el, props = defaults) {
  const pics = await loadImages(props.items.map(d => d.thumb ?? null), 128, 128), st = card(el, props), {ink} = st, g = st.body, d3 = window.d3, items = props.items, n = items.length, K = Math.max(...items.map(d => d.values.length)), times = props.times;
  const val = (d, k) => d.values[Math.min(k, d.values.length - 1)], max = d3.max(items, d => d3.max(d.values)), x0 = 300, x1 = 890, above = props.labels === 'above', x = d3.scaleLinear().domain([0, max]).range([0, x1 - x0 - (props.showValues ? 150 : 0)]), top = 262, rowH = Math.min(132, 590 / n), bh = rowH * (above ? .52 : .78), by = above ? rowH * .16 : 0;
  const ranks = Array.from({length: K}, (_, k) => { const order = items.map((d, i) => i).sort((a, b) => val(items[b], k) - val(items[a], k) || a - b), r = []; order.forEach((i, pos) => r[i] = pos); return r; });
  const fills = {cobalt: C.cobalt, sun: C.sun, poppy: C.poppy, ink: ink.head, white: C.white, smoke: C.smoke}, lead = ranks[K - 1].indexOf(0), light = ink.head === C.ink;
  // grid and axis: drawn on, no figures unless showValues
  const grid = [0, .25, .5, .75, 1].map(q => g.append('rect').attr('x', x0 + (x1 - x0) * q - 1).attr('y', top - 8).attr('width', 2).attr('fill', ink.line).attr('opacity', q ? .14 : .5));
  const axis = label(g, x1, top - 24, props.axis + '  →', {size: 22, color: ink.head, anchor: 'end'}), note = label(g, 90, top + n * rowH + 44, props.note, {size: 24, color: ink.head});
  const rows = items.map((d, i) => {
    const row = g.append('g'), bar = row.append('rect').attr('x', x0).attr('y', by - bh / 2).attr('height', bh).attr('fill', fills[props.colors[i % props.colors.length]] ?? ink.head);
    const hot = row.append('rect').attr('x', x0).attr('y', by - bh / 2).attr('height', bh).attr('fill', ink.accent).attr('opacity', 0);
    const tile = row.append('g').attr('transform', `translate(${x0 - bh - 14} ${by - bh / 2})`); tile.append('rect').attr('width', bh).attr('height', bh).attr('fill', light ? '#D6D1C7' : '#1C2540');
    if (pics[i]) tile.append('image').attr('href', pics[i]).attr('width', bh).attr('height', bh).attr('preserveAspectRatio', 'xMidYMid slice');
    else tile.append('path').attr('d', `M${bh * .38} ${bh * .28}L${bh * .7} ${bh * .5}L${bh * .38} ${bh * .72}Z`).attr('fill', ink.head).attr('opacity', .7);
    const rank = txt(row, 90, bh * .3, '', {size: bh * .92, role: 'num', color: ink.head}).style('font-variant-numeric', 'tabular-nums'), roll = clipBox(st, 80, -bh * .62, 110, bh * 1.24); rank.attr('clip-path', null);
    const rg = row.append('g').attr('clip-path', roll); rank.remove(); const ra = txt(rg, 90, 0, '', {size: bh * .92, role: 'num', color: ink.head}), rb = txt(rg, 90, 0, '', {size: bh * .92, role: 'num', color: ink.head});
    const name = label(row, x0 - bh - 30, bh * .16, d.label, {size: Math.min(22, fit(String(d.label).toUpperCase(), 150, 22 * 1.18, {role: 'label'}) / 1.18), color: ink.head, anchor: 'end'}).attr('display', 'none');
    const tagG = row.append('g'), tag = above ? txt(tagG, 0, by - bh / 2 - 14, d.label, {size: Math.min(34, fit(d.label, x1 - x0, 34, {role: 'bold'})), role: 'bold', color: ink.head}) : label(tagG, 0, bh * .17, d.label, {size: 30, color: C.white}), figG = row.append('g'), figure = txt(figG, 0, by + bh * .32, '', {size: bh * (above ? .9 : .62), role: 'num', color: ink.head}).style('font-variant-numeric', 'tabular-nums');
    return {d, i, row, bar, hot, ra, rb, tag, tagG, figure, figG, fill: bar.attr('fill')};
  });
  const flagG = g.append('g'), ft = String(props.flag).toUpperCase(), fw = 60 + ft.length * 40; flagG.append('rect').attr('x', 0).attr('y', -44).attr('width', fw).attr('height', 88).attr('fill', C.ink);
  txt(flagG, fw / 2, 20, ft, {size: 54, role: 'wide', color: C.white, anchor: 'middle'});
  return {seek(t) {
    hold(st, t);
    grid.forEach((r, i) => r.attr('height', (n * rowH + 16) * glide(span(t, .05 + i * .05, .4)))); axis.attr('opacity', fade(t, .3, .3)); note.attr('opacity', fade(t, .2, .3));
    // which step we are between, and how far
    let k = 0; while (k < K - 2 && t >= times[k + 1]) k++;
    const q = K > 1 ? clamp((t - times[k]) / Math.max(.01, times[k + 1] - times[k])) : 1, e = easeInOut(q), won = clamp((t - props.flagAt) / .2), pull = spring(span(t, props.flagAt, .34));
    rows.forEach(({d, i, row, bar, hot, ra, rb, tag, tagG, figure, figG, fill}) => {
      const born = spring(span(t, times[0] + ranks[0][i] * .05, .42)), v = (t < times[1] ? val(d, 0) : mix(val(d, k), val(d, Math.min(K - 1, k + 1)), k === 0 && t < times[1] ? 0 : e)), isLead = i === lead;
      const from = t < times[1] ? ranks[0][i] : ranks[k][i], to = t < times[1] ? ranks[0][i] : ranks[Math.min(K - 1, k + 1)][i], pos = mix(from, to, swell(q)), lift = from !== to ? Math.sin(Math.PI * q) * (to < from ? -1 : 1) * 10 : 0;
      const wv = Math.max(4, x(v) * Math.max(0, born) * (isLead ? 1 + .05 * pull * (won > 0 ? 1 : 0) : 1));
      row.attr('transform', `translate(${lift} ${top + rowH * (pos + .5)})`).attr('opacity', clamp((t - times[0] - ranks[0][i] * .05 + .04) / .1) * (isLead ? 1 : 1 - .5 * won));
      bar.attr('width', wv); hot.attr('width', wv).attr('opacity', isLead ? won : 0);
      const shownFrom = from + 1, shownTo = to + 1, rq = from === to ? 0 : swell(clamp(q * 1.4 - .2)), dir = to < from ? 1 : -1;       // the rank numeral rolls to its new value
      ra.text(pad2(shownFrom)).attr('y', bh * .3 + dir * rq * bh * 1.2); rb.text(pad2(shownTo)).attr('y', bh * .3 - dir * (1 - rq) * bh * 1.2).attr('opacity', from === to ? 0 : 1);
      const inside = !above && wv > 250; tagG.attr('transform', `translate(${above ? x0 : inside ? x0 + 20 : x0 + wv + 16} 0)`); tag.attr('fill', above ? ink.head : inside ? ((fill === C.sun || fill === C.white) && !(isLead && won > .5) ? C.ink : C.white) : ink.head).attr('opacity', fade(t, times[0] + ranks[0][i] * .05 + .15, .15));
      figure.text(props.showValues ? props.prefix + (props.decimals ? v.toFixed(props.decimals) : comma(v)) + props.suffix : '').attr('opacity', fade(t, times[0] + .3, .2)); figG.attr('transform', `translate(${x0 + wv + (above || inside ? 16 : 170)} 0)`); figure.attr('fill', isLead && won > .5 ? ink.accent : ink.head);
      if (isLead) { const fs = Math.min(1, (bh - 8) / 88), fx = x0 + wv - fw * fs - 6; flagG.attr('transform', `translate(${fx + fw * fs / 2} ${top + rowH * (pos + .5) + by}) scale(${won > 0 ? fs * mix(1.9, 1, Math.min(1.12, pull)) : 0}) translate(${-fw / 2} 0)`).attr('opacity', won); }
    });
    flagG.raise();
  }};
}
