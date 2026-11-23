import {card, grow, fade, num, fig, text, rule, fit, F} from './_card.js';

// A numbered process set like a contents page: a Didone numeral in the accent, the step in the serif, an optional
// mono detail at the right edge (a duration, a page), and a hairline under each row. Rows arrive one after another;
// with `times` (seconds, e.g. when each step is spoken) each waits for its cue.
// Props: title, unit, items ['step', ...] or [{label, detail}], times, note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'How a reel gets *made*', unit: 'The process · four steps', note: false, index: '09', field: 'paper', clear: false, times: null,
  items: [{label: 'Record one take', detail: '01'}, {label: 'Send it over', detail: '02'}, {label: 'Approve the storyboard', detail: '03'}, {label: 'Post the reel', detail: '04'}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, items = props.items.map(d => typeof d === 'string' ? {label: d} : d), n = items.length, anyDetail = items.some(d => d.detail && !/^\d\d$/.test(d.detail));
  const pitch = Math.min(170, (pg.y1 - pg.y0) / n), ns = Math.min(104, pitch * .66), xl = pg.x0 + ns * 1.5, room = pg.x1 - xl - (anyDetail ? 170 : 0), size = Math.min(70, pitch * .46, fit(items.map(d => d.label), room, 70));
  const rows = items.map((d, i) => {
    const y = pg.y0 + i * pitch, by = y + pitch * .5 + ns * .34, grp = g.append('g');
    num(grp, pg.x0, by, String(i + 1).padStart(2, '0'), {size: ns, color: ink.accent});
    text(grp, xl, by - ns * .04, d.label, {font: F.head, size, color: ink.fg});
    if (anyDetail && d.detail) fig(grp, pg.x1, by - ns * .06, d.detail, {size: 36, anchor: 'end', color: ink.sub});
    return {grp, line: rule(g, pg.x0, y + pitch, pg.x1, y + pitch, {width: 2, color: ink.fg, opacity: i === n - 1 ? 1 : .3})};
  });
  return {seek(t) {
    pg.seek(t);
    rows.forEach((r, i) => { const at = props.times?.[i] ?? pg.T + i * .1, a = fade(t, at, .3); r.grp.attr('opacity', a).attr('transform', `translate(0 ${((1 - grow(t, at, .4)) * 18).toFixed(1)})`); r.line.draw(grow(t, at + .04, .4)); });
  }};
}
