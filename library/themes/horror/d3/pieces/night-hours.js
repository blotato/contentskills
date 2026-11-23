import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// Twenty-four hours round a dial as thin spokes whose length is the count for that hour; the
// small hours stand out in rose. A hand sweeps round once as the spokes grow.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'When it happens', unit: 'Reports by hour · illustrative', hours: [14, 9, 12, 31, 22, 8, 3, 2, 1, 1, 2, 1, 1, 2, 1, 2, 3, 3, 4, 5, 6, 8, 10, 12], from: 1, to: 4, label: 'MOST OF IT BETWEEN ONE AND FOUR'};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, cx = 500, cy = 545, r0 = 96, r1 = 256, max = Math.max(...props.hours), A = h => h / 24 * Math.PI * 2;
  g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r0).attr('fill', '#000').attr('fill-opacity', .3).attr('stroke', C.bone).attr('stroke-width', 2).attr('stroke-opacity', .5); g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r1 + 12).attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 1).attr('opacity', .2).attr('stroke-dasharray', '2 8');
  [0, 6, 12, 18].forEach(h => txt(g, cx + Math.sin(A(h)) * (r1 + 50), cy - Math.cos(A(h)) * (r1 + 50) + 12, ['MIDNIGHT', '6 AM', 'NOON', '6 PM'][h / 6], {size: 22, color: C.fog, spacing: .26, anchor: 'middle'}));
  const spokes = props.hours.map((v, h) => ({v, h, hot: h >= props.from && h <= props.to, node: g.append('path').attr('stroke-linecap', 'butt').attr('stroke-width', 16)}));
  const hand = hair(g, '', C.bone, 2, .7), mid = letters(g, `${pad(props.from)}–${pad(props.to)}`, cx + 4, cy + 20, 58, {spacing: .08, marks: false, color: C.rose, seed: 2}), label = txt(g, 500, BOX.y1 + 20, up(props.label), {size: 26, font: F.head, weight: 400, spacing: .24, anchor: 'middle'});
  return {seek(t) {
    c.head(t); const sweep = easeInOut(span(t, .7, 2.6)) * 24; hand.attr('d', `M${cx + Math.sin(A(sweep)) * r0} ${cy - Math.cos(A(sweep)) * r0}L${cx + Math.sin(A(sweep)) * (r1 + 12)} ${cy - Math.cos(A(sweep)) * (r1 + 12)}`).attr('opacity', sweep > 0 && sweep < 24 ? .7 : 0);
    spokes.forEach(s => { const q = easeOut(span(sweep, s.h, 1.5)), len = (r1 - r0 - 14) * s.v / max * q, a = A(s.h + .5), ra = r0 + 12; s.node.attr('d', `M${cx + Math.sin(a) * ra} ${cy - Math.cos(a) * ra}L${cx + Math.sin(a) * (ra + len)} ${cy - Math.cos(a) * (ra + len)}`).attr('stroke', s.hot ? C.rose : C.bone).attr('opacity', q > 0 ? (s.hot ? lamp(t, s.h, .4, 2) : .7) : 0); });
    mid.show(t, {at: 3.3, spread: .3}); label.attr('opacity', flickerOn(t, 3.8, .3, 5));
  }};
}
