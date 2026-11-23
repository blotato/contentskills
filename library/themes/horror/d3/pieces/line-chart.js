import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// A single unsteady line drawn across a faint grid, with one point (`mark`) ringed in rose and labelled.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Sightings per year', unit: 'Reports filed · illustrative', points: [3, 4, 3, 6, 5, 9, 8, 14, 22, 19, 31], from: '2014', to: '2024', mark: 8, markLabel: 'THE YEAR IT CHANGED'};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, pts = props.points, n = pts.length, max = Math.max(...pts) * 1.12, X = i => BOX.x0 + 30 + i / (n - 1) * (BOX.w - 60), Y = v => BOX.y1 - 60 - v / max * (BOX.h - 110);
  for (let k = 0; k <= 4; k++) { const y = Y(max * k / 4); hair(g, `M${BOX.x0} ${y}H${BOX.x1}`, C.bone, 1, .14); txt(g, BOX.x0, y - 8, comma(max * k / 4), {size: 20, color: C.fog, spacing: .2}); }
  const d = pts.map((v, i) => i ? rough(X(i - 1), Y(pts[i - 1]), X(i), Y(v), i, 2.5, 18).replace('M', 'L') : `M${X(0)} ${Y(v)}`).join(''), line = hair(g, d, C.bone, 4, .95).attr('stroke-linejoin', 'round');
  const area = g.insert('path', 'path').attr('d', `${d}L${X(n - 1)} ${BOX.y1 - 60}L${X(0)} ${BOX.y1 - 60}Z`).attr('fill', linear(c.st, [[0, C.bone, .12], [1, C.bone, 0]]));
  const a = txt(g, X(0), BOX.y1 - 14, up(props.from), {size: 26, color: C.fog, spacing: .24}), b = txt(g, X(n - 1), BOX.y1 - 14, up(props.to), {size: 26, color: C.fog, spacing: .24, anchor: 'end'});
  const m = props.mark, mx = X(m), my = Y(pts[m]), ring = g.append('circle').attr('cx', mx).attr('cy', my).attr('fill', 'none').attr('stroke', C.rose).attr('stroke-width', 4), drop = hair(g, `M${mx} ${my + 22}V${BOX.y1 - 60}`, C.rose, 2, .6).attr('stroke-dasharray', '6 8');
  const label = txt(g, mx - 24, my - 34, up(props.markLabel), {size: 28, font: F.head, weight: 400, color: C.rose, spacing: .18, anchor: 'end'});
  return {seek(t) {
    c.head(t); const q = easeInOut(span(t, .8, 1.8)); draw(line, q); area.attr('opacity', span(t, 2.2, .8)); a.attr('opacity', .9); b.attr('opacity', flickerOn(t, 2.4, .3, 3) * .9);
    const on = flickerOn(t, .8 + 1.8 * m / (n - 1), .3, 5); ring.attr('r', 16 + 3 * Math.sin(t * 4)).attr('opacity', on); drop.attr('opacity', on * .6); label.attr('opacity', flickerOn(t, 1 + 1.8 * m / (n - 1), .3, 6));
  }};
}
