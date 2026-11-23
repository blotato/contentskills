import {card, txt, label, dot, fit, up, fade, glide, span} from '../../kit.js';
import {cues, pace, hold, arrive, latest} from './_local.js';

// Dates down a vertical hairline, credits-style: the date in thin tall numerals on the left, the
// event and a line of small print on the right. The accent dot follows the latest entry (or `highlight`).
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'A season in four dates', unit: 'Illustrative · calendar', clear: false, field: 'bone', accent: 'poppy', highlight: null, speed: 1, times: null,
  items: [{date: '02', label: 'First sketches', note: 'Paper and pencil'}, {date: '09', label: 'Fabric arrives', note: 'Wool, silk, cotton'}, {date: '17', label: 'Fittings', note: 'Two rounds'}, {date: '24', label: 'The show', note: 'One evening'}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, items = props.items, n = items.length, k = pace(props), at = cues(props, n, .3, .13);
  const top = 270, pitch = Math.min(150, 620 / n), y0 = top + (620 - pitch * n) / 2, lx = 290, size = Math.min(84, pitch * .56, ...items.map(d => fit(String(d.date), 170, 84, {role: 'num'})));
  const line = g.append('rect').attr('x', lx - .75).attr('y', y0 + pitch * .2).attr('width', 1.5).attr('fill', ink.line).attr('opacity', .5), span0 = pitch * (n - 1) + pitch * .6;
  const rows = items.map((d, i) => {
    const y = y0 + pitch * (i + .5), row = g.append('g'), ts = Math.min(30, pitch * .24, fit(up(d.label), 570, 30, {role: 'wide'}));
    txt(row, lx - 44, y + size * .37, d.date, {size, role: 'num', color: ink.head, anchor: 'end'});
    txt(row, lx + 44, y + (d.note ? -2 : ts * .36), up(d.label), {size: ts, role: 'wide', color: ink.head});
    if (d.note) label(row, lx + 45, y + 32, d.note, {size: Math.min(15, fit(up(d.note), 570, 15, {role: 'label'})), color: ink.dim});
    return {row, base: dot(g, lx, y, 4, ink.line), hot: dot(g, lx, y, 8, ink.accent)};
  });
  return {seek(t) {
    hold(st, t);
    line.attr('height', span0 * Math.max(...at.map((a, i) => glide(span(t, a, .8 * k)) * (i + 1) / n)));
    rows.forEach(({row, base, hot}, i) => { arrive(row, t, at[i], k); base.attr('opacity', fade(t, at[i], .3 * k));
      hot.attr('opacity', props.highlight == null ? latest(at, t, i, k) : i === props.highlight ? fade(t, at[i], .35 * k) : 0); });
  }};
}
