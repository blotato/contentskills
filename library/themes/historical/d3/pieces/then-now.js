import {span, settle, up, print, bar, fit, typed} from '../../kit.js';
import {card, ink, ruled, INK, SOFT, C, F} from './_card.js';

// Then and now: two prints side by side on the sheet, an older sepia one and a later silver one,
// each with its label bar, a typewritten caption and a figure that counts up.
// a and b are {label, caption, value, prefix, suffix, scene}.
export const meta = {duration: 5.5};
export const defaults = {title: 'The same street', unit: 'Illustrative · people living here', clear: false,
  a: {label: 'THEN', caption: 'A MARKET TOWN', value: 4, suffix: 'K', scene: 'landscape'}, b: {label: 'NOW', caption: 'A CITY', value: 310, suffix: 'K', scene: 'city'}};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), sides = [props.a, props.b].map((d, i) => {
    const cx = i ? 700 : 300, g = body.append('g'), pg = g.append('g'), pr = print(pg, 300, 250, {scene: d.scene ?? (i ? 'city' : 'landscape'), tone: i ? 'silver' : 'sepia', seed: 5 + i * 4, border: 16, fill: '#efe9dc', image: d.image ?? null});
    const lb = bar(g, d.label ?? (i ? 'NOW' : 'THEN'), {size: 36, fill: i ? 'crimson' : 'char', seed: 3 + i}); lb.g.attr('transform', `translate(${cx - 166} ${300})`);
    const fmt = v => (d.prefix ?? '') + Math.round(v).toLocaleString('en-US') + (d.suffix ?? ''), full = fmt(d.value), size = fit(full, 320, 120, {weight: 700});
    const value = ink(g, cx, 740, full, {size, weight: 700, anchor: 'middle', color: i ? C.crimson : INK, spacing: 0});
    const cap = d.caption ? typed(g, cx, 800, up(d.caption), {size: fit(up(d.caption), 340, 28, {font: F.type, weight: 400, spacing: .06}), color: SOFT, anchor: 'middle', spacing: .06}) : null;
    return {d, cx, g, pg, pr, lb, value, cap, fmt, i};
  });
  const mid = ruled(body, 500, 300, 500, 830, {width: 1.5, dash: '4 8', opacity: .5});
  return {seek(t) {
    intro(t); const u = t / meta.duration;
    sides.forEach(({d, cx, pg, pr, lb, value, cap, fmt, i}) => { const at = .6 + i * 1.3, q = settle(span(t, at, .9));
      pr.pan(u, {dx: i ? -30 : 30}); pg.attr('opacity', span(t, at, .4)).attr('transform', `translate(${cx} ${470 + (1 - q) * 18}) rotate(${(i ? 1.6 : -2) + (i ? .4 : -.4) * u})`);
      lb.reveal(span(t, at + .3, .7)); value.attr('opacity', span(t, at + .5, .3)).select('tspan').text(fmt(d.value * settle(span(t, at + .5, 1.2)))); cap?.set(span(t, at + .8, .7)); });
    mid.attr('opacity', .5 * span(t, .5, .5));
  }};
}
