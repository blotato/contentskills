import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// A search map: faint roads and contour scribbles, a search radius spreading from the last known
// position, and a few pins that switch on with typed labels. Positions are 0..1 inside the map.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'Search area', unit: 'Not to scale · illustrative', origin: {x: .46, y: .52, label: 'LAST SEEN'}, radius: .36, pins: [{x: .22, y: .3, label: 'THE CAR'}, {x: .74, y: .36, label: 'THE PHONE'}, {x: .64, y: .8, label: 'THE TORCH'}]};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area.append('g').attr('clip-path', clipBox(c.st, BOX.x0, BOX.y0, BOX.w, BOX.h)), X = x => BOX.x0 + x * BOX.w, Y = y => BOX.y0 + y * BOX.h;
  g.append('rect').attr('x', BOX.x0).attr('y', BOX.y0).attr('width', BOX.w).attr('height', BOX.h).attr('fill', '#000').attr('opacity', .3);
  for (let i = 0; i < 9; i++) hair(g, i % 2 ? rough(BOX.x0, Y(hash(i, 1)), BOX.x1, Y(hash(i, 2)), i, 16, 50) : rough(X(hash(i, 3)), BOX.y0, X(hash(i, 4)), BOX.y1, i, 16, 50), C.fog, i < 3 ? 3 : 1.2, i < 3 ? .3 : .16);
  for (let i = 0; i < 5; i++) g.append('ellipse').attr('cx', X(.2 + hash(i, 5) * .6)).attr('cy', Y(.2 + hash(i, 6) * .6)).attr('rx', 60 + hash(i, 7) * 120).attr('ry', 40 + hash(i, 8) * 80).attr('fill', 'none').attr('stroke', C.fog).attr('stroke-width', 1).attr('opacity', .14).attr('stroke-dasharray', '3 7');
  hair(c.area, `M${BOX.x0} ${BOX.y0}H${BOX.x1}V${BOX.y1}H${BOX.x0}Z`, C.bone, 1.5, .35);
  const o = props.origin, ox = X(o.x), oy = Y(o.y), R = props.radius * BOX.w, sweep = g.append('circle').attr('cx', ox).attr('cy', oy).attr('fill', radial(c.st, [[0, C.rose, 0], [.8, C.rose, .08], [1, C.rose, .22]])), ring = g.append('circle').attr('cx', ox).attr('cy', oy).attr('fill', 'none').attr('stroke', C.rose).attr('stroke-width', 3).attr('stroke-dasharray', '14 10');
  const cross = hair(g, `M${ox - 20} ${oy}H${ox + 20}M${ox} ${oy - 20}V${oy + 20}`, C.rose, 4, 1), ol = txt(g, ox + 28, oy - 18, up(o.label), {size: 28, font: F.head, weight: 400, color: C.rose, spacing: .2});
  const pins = props.pins.map((p, i) => ({dot: g.append('circle').attr('cx', X(p.x)).attr('cy', Y(p.y)).attr('r', 9).attr('fill', C.bone), halo: g.append('circle').attr('cx', X(p.x)).attr('cy', Y(p.y)).attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 2), label: txt(g, X(p.x) + 22, Y(p.y) + 10, '', {size: 26, font: F.type, weight: 400, spacing: .04}), str: up(p.label)}));
  return {seek(t) {
    c.head(t); const q = easeOut(span(t, 1, 2.2)); cross.attr('opacity', flickerOn(t, .6, .3, 1)); ol.attr('opacity', flickerOn(t, .8, .3, 2)); ring.attr('r', R * q).attr('opacity', t > 1 ? .9 : 0).attr('stroke-dashoffset', -t * 14); sweep.attr('r', R * q).attr('opacity', t > 1 ? 1 : 0);
    pins.forEach((p, i) => { const at = 2 + i * .7, on = flickerOn(t, at, .25, i + 4); p.dot.attr('opacity', on); p.halo.attr('r', 14 + ((t - at) % 1.4) * 22).attr('opacity', t > at ? .5 * (1 - ((t - at) % 1.4) / 1.4) : 0); p.label.text(typed(p.str, span(t, at + .15, .4))); });
  }};
}
