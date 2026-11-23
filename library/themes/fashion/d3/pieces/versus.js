import {card, txt, label, dot, fit, up, fade, glide, span} from '../../kit.js';
import {cues, pace, hold, arrive, fmt} from './_local.js';

// Two columns either side of a vertical hairline: a name in small print, one figure in thin tall
// numerals, then credits-style rows comparing them. The accent dot sits over the `winner`
// (the larger figure unless set). times: [left, right, row 1, row 2, ...].
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Two ways to wear it', unit: 'Illustrative · score out of 10', clear: false, field: 'bone', accent: 'poppy', winner: null, decimals: 1, prefix: '', suffix: '', speed: 1, times: null,
  a: {name: 'Tailored', value: 8.4, note: 'Sharp and structured'}, b: {name: 'Relaxed', value: 7.1, note: 'Soft and easy'},
  rows: [{label: 'Effort', a: 'High', b: 'Low'}, {label: 'Season', a: 'Cool', b: 'Warm'}, {label: 'Layers', a: 'Three', b: 'One'}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, rows = (props.rows ?? []).slice(0, 4), k = pace(props), at = cues(props, 2 + rows.length, .3, .12);
  const sides = [props.a, props.b], num = d => typeof d.value === 'number', str = d => num(d) ? fmt(d.value, props) : String(d.value ?? '');
  const win = props.winner ?? (sides.every(num) && props.a.value !== props.b.value ? (props.a.value > props.b.value ? 0 : 1) : -1), low = rows.length ? 0 : 90;
  const size = Math.min(...sides.map(d => fit(str(d), 330, 190, {role: 'num'}))), mid = g.append('rect').attr('x', 499.25).attr('y', 290 + low).attr('width', 1.5).attr('fill', ink.line).attr('opacity', .5);
  const cols = sides.map((d, i) => {
    const cx = i ? 705 : 295, col = g.append('g');
    label(col, cx, 322 + low, d.name, {size: Math.min(22, fit(up(d.name), 340, 22, {role: 'label'})), color: ink.head, anchor: 'middle'});
    const value = txt(col, cx, 420 + low + size * .62, '', {size, role: 'num', color: ink.head, anchor: 'middle'});
    if (d.note) label(col, cx, 590 + low, d.note, {size: Math.min(15, fit(up(d.note), 350, 15, {role: 'label'})), color: ink.dim, anchor: 'middle'});
    return {d, col, value, mark: dot(g, cx, 276 + low, 7, ink.accent)};
  });
  const lines = rows.map((r, i) => {
    const y = 648 + i * 64, row = g.append('g'), cell = (x, s) => txt(row, x, y + 41, up(s), {size: Math.min(22, fit(up(s), 255, 22, {role: 'bold'})), role: 'bold', color: ink.head, anchor: 'middle'});
    const hair = g.append('rect').attr('y', y - .75).attr('height', 1.5).attr('fill', ink.line).attr('opacity', .3);
    cell(295, r.a); cell(705, r.b); label(row, 500, y + 39, r.label, {size: Math.min(14, fit(up(r.label), 130, 14, {role: 'label'})), color: ink.dim, anchor: 'middle'});
    return {row, hair};
  });
  return {seek(t) {
    hold(st, t); mid.attr('height', 320 * glide(span(t, .15 * k, .9 * k)));
    cols.forEach(({d, col, value, mark}, i) => { arrive(col, t, at[i], k); const e = glide(span(t, at[i], .9 * k)); value.text(num(d) ? fmt(d.value * e, props) : str(d)); mark.attr('opacity', i === win ? fade(t, Math.max(at[0], at[1]) + .35 * k, .4 * k) : 0); });
    lines.forEach(({row, hair}, i) => { const q = glide(span(t, at[2 + i], .8 * k)); hair.attr('x', 500 - 410 * q).attr('width', 820 * q); row.attr('opacity', fade(t, at[2 + i] + .05 * k, .4 * k)); });
  }};
}
