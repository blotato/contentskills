import {C, series, up, fit, capH, measure, burst, plate, txt, inkOn, scaleTo, span, spring, easeOut, hash, mix} from '../../kit.js';
import {card, shout, twoLine} from './_card.js';

// One idea feeding many places: a burst in the middle with slabs popping out around it, each tied
// back by an ink line that shoots out from the hub. Dots keep running along the lines.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'One video, many posts', unit: 'Illustrative · where one idea goes', hub: 'IDEA', clear: false, colors: series,
  nodes: ['Short clip', 'Carousel', 'Newsletter', 'Thread', 'Podcast cut']};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, N = props.nodes, n = N.length, cx = 500, cy = 600, colors = props.colors ?? series, o = {role: 'slab'};
  const links = root.append('g'), spots = N.map((text, i) => { const a = -Math.PI / 2 + (i + .5) / n * Math.PI * 2; return {text: up(text), i, x: cx + Math.cos(a) * 310, y: cy + Math.sin(a) * 255}; });
  const lines = spots.map(s => ({back: links.append('path').attr('stroke', C.ink).attr('stroke-width', 9).attr('stroke-linecap', 'round'), dot: links.append('circle').attr('r', 11).attr('fill', C.yellow).attr('stroke', C.ink).attr('stroke-width', 5)}));
  const plates = spots.map(s => {
    const {lines, size} = twoLine(s.text, 250, 40, o, 28), cap = capH(size, o), pitch = size * 1.05, w = Math.max(...lines.map(l => measure(l, size, o))) + 64, h = cap + (lines.length - 1) * pitch + 46, fill = colors[s.i % colors.length];
    const x = Math.max(70 + w / 2 + 4, Math.min(930 - w / 2 - 12, s.x)), g = root.append('g').attr('transform', `translate(${x} ${s.y})`).append('g');
    plate(g, {fill, cut: 22, drop: 8}).box(-w / 2, -h / 2, w, h); txt(g, -4, -h / 2 + 23 + cap - 1, lines.join('\n'), {size, role: 'slab', color: inkOn(fill), anchor: 'middle', leading: 1.05});
    s.x = x; return g;
  });
  const hub = burst(root.append('g').attr('transform', `translate(${cx} ${cy})`), 150, {fill: C.yellow, inner: C.white, points: 13, seed: 2}), word = up(props.hub); shout(hub.g, -4, capH(fit(word, 150, 80)) / 2, word, {size: fit(word, 150, 80), color: C.red});
  return {seek(t) {
    stage.intro(t);
    hub.boil(t); scaleTo(hub.g, spring(span(t, .4, .5)) * (1 + .03 * Math.sin(t * 4)), -6);
    spots.forEach((s, i) => {
      const at = .9 + i * .28, q = easeOut(span(t, at, .3)), u = (t * .5 + hash(i, 2)) % 1;
      lines[i].back.attr('d', q > 0 ? `M${cx} ${cy}L${mix(cx, s.x, q)} ${mix(cy, s.y, q)}` : '');
      lines[i].dot.attr('cx', mix(cx, s.x, u)).attr('cy', mix(cy, s.y, u)).attr('opacity', t > at + .5 && u > .28 && u < .8 ? 1 : 0);
      scaleTo(plates[i], spring(span(t, at + .2, .45)), (hash(i, 6) - .5) * 5 + Math.sin(t * 2 + i) * .8);
    });
  }};
}
