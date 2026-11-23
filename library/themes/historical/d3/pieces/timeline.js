import {span, settle, up, fit, typed} from '../../kit.js';
import {card, ink, ruled, drawOn, INK, SOFT, C, F} from './_card.js';

// Events down a ruled line with tick marks: the line draws itself downward and each date and
// event is entered as the pen reaches it. `stops` are {label, note}; the note is the date.
export const meta = {duration: 5.5};
export const defaults = {title: 'How it unfolded', unit: 'Illustrative dates', clear: false,
  stops: [{label: 'THE CHARTER IS SIGNED', note: 'YEAR 1'}, {label: 'FIRST SHIPS ARRIVE', note: 'YEAR 4'}, {label: 'THE GREAT FIRE', note: 'YEAR 9'}, {label: 'A NEW CITY RISES', note: 'YEAR 15'}]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), n = props.stops.length, x = 330, y0 = 300, y1 = 860, step = (y1 - y0 - 60) / Math.max(1, n - 1 || 1), pitch = Math.min(step, 180);
  let ticks = ''; for (let y = y0; y <= y1; y += 20) ticks += `M${x - ((y - y0) % 100 ? 6 : 12)} ${y}h${(y - y0) % 100 ? 6 : 12}`;
  body.append('path').attr('d', ticks).attr('stroke', INK).attr('stroke-width', 1.4).attr('opacity', .5);
  const line = drawOn(ruled(body, x, y0, x, y1, {width: 4}));
  const rows = props.stops.map((s, i) => {
    const y = y0 + 30 + i * (n > 1 ? (y1 - y0 - 60) / (n - 1) : 0), g = body.append('g'), note = up(s.note ?? ''), lab = up(s.label), last = i === n - 1;
    ink(g, x - 34, y + 17, note, {size: fit(note, 190, 46, {weight: 700}), weight: 700, anchor: 'end', color: C.crimson, spacing: .02});
    const dot = g.append('circle').attr('cx', x).attr('cy', y).attr('fill', last ? C.crimson : INK), ring = g.append('circle').attr('cx', x).attr('cy', y).attr('r', 19).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 2);
    const lead = ruled(g, x + 22, y, x + 52, y, {width: 2}), size = fit(lab, 455, 40), label = ink(g, x + 66, y + size * .36, lab, {size});
    const detail = s.detail ? typed(g, x + 66, y + size * .36 + 34, s.detail, {size: 21, color: SOFT}) : null;
    return {g, y, dot, ring, label, detail};
  });
  return {seek(t) {
    intro(t); const span0 = .7, len = Math.max(1.6, n * .75); line(span(t, span0, len));
    rows.forEach(({g, y, dot, ring, label, detail}) => { const at = span0 + len * (y - y0) / (y1 - y0), q = span(t, at, .6), e = settle(q);
      g.attr('opacity', span(t, at, .25)); dot.attr('r', 11 * e); ring.attr('opacity', e * .7).attr('r', 30 - 11 * e); label.attr('transform', `translate(${-14 * (1 - e)} 0)`); detail?.set(span(t, at + .3, .7)); });
  }};
}
