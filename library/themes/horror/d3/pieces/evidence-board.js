import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// The investigator's wall: typed notes on scraps of aged paper, pinned up, and joined by red
// string that is pulled from note to note. `nodes` are positions 0..1 inside the board; `pace` below 1 builds it faster.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'How it connects', unit: 'Working theory · illustrative', nodes: [{label: 'THE HOUSE', x: .2, y: .2}, {label: 'THE LETTER', x: .76, y: .14}, {label: '3:14 AM', x: .5, y: .5}, {label: 'THE NEIGHBOUR', x: .2, y: .82}, {label: 'THE KEY', x: .8, y: .8}], links: [[0, 2], [1, 2], [2, 3], [2, 4], [0, 3]], center: 2, pace: 1};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, P = d => [BOX.x0 + 110 + d.x * (BOX.w - 220), BOX.y0 + 50 + d.y * (BOX.h - 100)], strings = g.append('g'), notes = g.append('g');
  const links = props.links.map(([a, b], i) => { const [x1, y1] = P(props.nodes[a]), [x2, y2] = P(props.nodes[b]); return hair(strings, `M${x1} ${y1 - 40}Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + 26} ${x2} ${y2 - 40}`, C.blood, 4, 1); });
  const nodes = props.nodes.map((d, i) => { const [x, y] = P(d), w = Math.max(170, measure(up(d.label), 30, {font: F.type, spacing: .04}) + 50), ng = notes.append('g'), hot = i === props.center, page = sheet(ng, c.st, -w / 2, -44, w, 88, {seed: i + 2});
    txt(page, 0, 12, up(d.label), {size: 30, font: F.type, weight: 400, spacing: .04, anchor: 'middle', color: C.ink}); ng.append('circle').attr('cy', -40).attr('r', 9).attr('fill', hot ? C.rose : C.blood).attr('stroke', '#000').attr('stroke-opacity', .5).attr('stroke-width', 2);
    return {g: ng, x, y, rot: (hash(i, 7) - .5) * 9}; });
  return {seek(t) {
    c.head(t); const k = props.pace ?? 1; nodes.forEach((n, i) => { const q = span(t, (.6 + i * .28) * k, .14); n.g.attr('transform', `translate(${n.x} ${n.y}) rotate(${n.rot}) scale(${1 + (1 - easeOut(q)) * .4})`).attr('opacity', t < (.6 + i * .28) * k ? 0 : .3 + .7 * q); });
    links.forEach((l, i) => draw(l, easeInOut(span(t, (2.1 + i * .45) * k, .5 * k))));
  }};
}
