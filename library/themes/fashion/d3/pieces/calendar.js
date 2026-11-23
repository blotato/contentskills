import {card, txt, label, dot, ring, rule, fit, measure, up, fade, glide, span, pad2} from '../../kit.js';
import {cues, pace, hold, arrive} from './_local.js';

// A calendar strip between two hairlines: weekdays as small print over dates in thin tall
// numerals; marked days carry a dot (the first one the accent) and are listed below like credits.
// times: [the strip, event 1, event 2, ...].
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'The week ahead', unit: 'Illustrative · March', clear: false, field: 'bone', accent: 'poppy', speed: 1, times: null,
  days: [{day: 'Mon', date: 12}, {day: 'Tue', date: 13}, {day: 'Wed', date: 14}, {day: 'Thu', date: 15}, {day: 'Fri', date: 16}, {day: 'Sat', date: 17}, {day: 'Sun', date: 18}],
  events: [{at: 2, label: 'Fitting', note: '10 o’clock'}, {at: 4, label: 'Shoot day', note: 'On location'}, {at: 6, label: 'Show', note: 'Evening'}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, days = props.days, n = days.length, events = (props.events ?? []).slice(0, 3), k = pace(props), at = cues(props, 1 + events.length, .3, .22);
  const x0 = 90, w = 820, slot = w / n, top = 270, size = Math.min(104, slot * .66), low = top + 96 + size * .86 + 70, marked = new Map(events.map((e, j) => [e.at, j]));
  const a = rule(g, x0, top, w, ink.line, 1.5), b = rule(g, x0, low, w, ink.line, 1.5);
  const cols = days.map((d, i) => {
    const cx = x0 + slot * (i + .5), col = g.append('g'), on = marked.has(i);
    label(col, cx, top + 52, d.day, {size: Math.min(15, slot * .16), color: on ? ink.head : ink.dim, anchor: 'middle'});
    txt(col, cx, top + 96 + size * .78, String(d.date), {size, role: 'num', color: ink.head, anchor: 'middle'}).attr('opacity', on || !events.length ? 1 : .45);
    return {col, mark: !on ? null : marked.get(i) === 0 ? dot(g, cx, low - 32, 7, ink.accent) : ring(g, cx, low - 32, 6, ink.line, 1.5), j: marked.get(i)};
  });
  const rows = events.map((e, j) => {
    const y = low + 78 + j * 78, row = g.append('g'), d = days[e.at] ?? {};
    txt(row, x0, y, typeof d.date === 'number' ? pad2(d.date) : String(d.date ?? ''), {size: 40, role: 'num', color: ink.head});
    const ls = Math.min(27, fit(up(e.label), 400, 27, {role: 'wide'}));
    txt(row, x0 + 86, y, up(e.label), {size: ls, role: 'wide', color: ink.head});
    label(row, 910, y - 2, e.note ?? '', {size: Math.min(15, fit(up(e.note || ' '), 300, 15, {role: 'label'})), color: ink.dim, anchor: 'end'});
    if (j === 0) dot(row, x0 + 86 + 16 + measure(up(e.label), ls, {role: 'wide'}), y - 10, 5, ink.accent);
    return {row, hair: g.append('rect').attr('x', x0).attr('y', y + 24).attr('height', 1.5).attr('fill', ink.line).attr('opacity', .3)};
  });
  return {seek(t) {
    hold(st, t); a.set(glide(span(t, at[0] - .1 * k, .9 * k))); b.set(glide(span(t, at[0], .9 * k))); a.node.attr('opacity', .5); b.node.attr('opacity', .5);
    cols.forEach(({col, mark, j}, i) => { arrive(col, t, at[0] + i * .05 * k, k, 8); mark?.attr('opacity', fade(t, at[1 + j], .35 * k)); });
    rows.forEach(({row, hair}, j) => { arrive(row, t, at[1 + j], k); hair.attr('width', 820 * glide(span(t, at[1 + j], .8 * k))); });
  }};
}
