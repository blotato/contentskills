import {card, guide, C, up, span, ease, io, light, ring, flash, mono, dot, bez, noise, along} from './_card.js';

// A map-like trace, not a real map: a made-up coastline draws itself across the card in light over a
// faint grid, then a red dot at the first place fires arcs that hop from place to place; each place's
// ring opens as an arc lands, and the last one lands blue. `points`: [{label, x, y}] in 0..1 of the map.
export const meta = {duration: 7, live: true};
export const defaults = {title: 'The route', unit: 'Three stops, one week', clear: false, seed: 3,
  points: [{label: 'Start', x: .14, y: .3}, {label: 'Stop two', x: .52, y: .5}, {label: 'Finish', x: .86, y: .74}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, seed = props.seed ?? 3, X = [90, 910], Y = [260, 880], mx = u => X[0] + (X[1] - X[0]) * u, my = v => Y[0] + (Y[1] - Y[0]) * v;
  for (let k = 0; k <= 6; k++) { guide(root, [[mx(k / 6), Y[0]], [mx(k / 6), Y[1]]], {dash: '1 9', opacity: .35}).draw(1); }
  for (let k = 0; k <= 5; k++) { guide(root, [[X[0], my(k / 5)], [X[1], my(k / 5)]], {dash: '1 9', opacity: .35}).draw(1); }
  // The coast runs from the top edge down to the right edge, leaving land up and to the left of it.
  const coast = Array.from({length: 140}, (_, i) => {
    const u = i / 139, wob = (noise(u * 9, seed) - .5) * .16 + (noise(u * 27, seed + 4) - .5) * .05;
    const bx = .35 + u * .65, by = Math.pow(u, 1.3) * .95;
    return [mx(Math.min(1, bx + wob * .6 + .18 * Math.sin(u * 3.1))), my(Math.min(1, by + .1 + wob))];
  });
  const shore = light(root, coast, {width: 1.8}), shelf = light(root, coast.map(([x, y]) => [x + 26, y + 20]), {width: 1, color: C.mute, echo: false, halo: false, opacity: .6, dash: '4 8'});
  const P = (props.points ?? []).map(p => [mx(p.x), my(p.y), p.label]), HOP = 1.1, START = T + 1.5;
  const places = P.map(([x, y, label], i) => ({x, y, r: ring(root, x, y, i ? 14 : 18, {from: -90, width: 2}), at: i ? START + .6 + (i - 1) * (HOP + .2) + HOP : START,
    lab: mono(root, x + 26, y - 18, up(label), {size: 20, track: .16, opacity: 0, halo: c.clear ? 4 : 0})}));
  const hops = P.slice(1).map(([x, y], i) => { const [ax, ay] = P[i], lift = Math.hypot(x - ax, y - ay) * .35; const pts = bez([ax, ay], [ax + (x - ax) * .25, ay - lift], [x - (x - ax) * .25, y - lift], [x, y], 40); return {pts, line: light(root, pts, {width: 2.2, color: 'red', echo: false}), at: START + .6 + i * (HOP + .2)}; });
  const origin = P[0] ? dot(root, P[0][0], P[0][1], {color: 'red', r: 12}) : null, head = dot(root, 0, 0, {color: 'red', r: 8});
  const last = places.at(-1), blue = last ? flash(root, last.x, last.y, {color: 'blue', r: 150}) : null;
  return {seek(t) {
    c.seek(t); shore.draw(io(span(t, T - .3, 2.2))); shelf.draw(io(span(t, T, 2.2)));
    origin?.set(ease(span(t, START - .3, .4)));
    for (const p of places) { const u = t - p.at; p.r.draw(ease(u / .7)); p.lab.attr('opacity', ease((u - .2) / .5)); }
    let tip = null; for (const h of hops) { const q = io(span(t, h.at, HOP)); h.line.draw(q); if (q > 0 && q < 1) tip = along(h.pts, q); }
    if (tip) head.at(tip[0], tip[1]).set(1); else head.set(0);
    if (last && hops.length) { const u = t - last.at; blue.set(u > 0 ? .3 + .6 * Math.exp(-u * 1.5) : 0, 1 + .3 * ease(u)); }
  }};
}
