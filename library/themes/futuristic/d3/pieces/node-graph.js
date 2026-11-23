import {C, F, series, chamfer, line, text, draw, span} from '../../hud.js';
import {card} from './_card.js';

// Steps in a process as linked nodes; links draw in order and carry travelling pulses.
export const meta = {duration: 4.2};
export const defaults = {title: 'One video, many posts', unit: 'Distribution network', clear: false,
  nodes: [{id: 'idea', label: 'Idea', x: .12, y: .5}, {id: 'script', label: 'Script', x: .38, y: .5}, {id: 'video', label: 'Video', x: .64, y: .5},
    {id: 'tiktok', label: 'TikTok', x: .88, y: .26}, {id: 'reels', label: 'Reels', x: .88, y: .5}, {id: 'shorts', label: 'Shorts', x: .88, y: .74}],
  links: [['idea', 'script'], ['script', 'video'], ['video', 'tiktok'], ['video', 'reels'], ['video', 'shorts']]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), at = n => ({x: 70 + n.x * 860, y: 250 + n.y * 620}), byId = Object.fromEntries(props.nodes.map(n => [n.id, n]));
  // A node appears after the longest chain of links leading to it.
  const depth = id => { const inbound = props.links.filter(l => l[1] === id); return inbound.length ? 1 + Math.max(...inbound.map(l => depth(l[0]))) : 0; };
  const links = props.links.map(([a, b]) => { const p = at(byId[a]), q = at(byId[b]), mid = (p.x + q.x) / 2;
    const path = line(root, `M${p.x} ${p.y}H${mid}V${q.y}H${q.x}`, C.teal, 3);
    return {path, length: path.node().getTotalLength(), pulse: root.append('rect').attr('width', 14).attr('height', 14).attr('fill', C.amber), start: .5 + depth(a) * .7}; });
  const nodes = props.nodes.map((n, i) => { const p = at(n), w = Math.max(130, n.label.length * 21 + 50), g = root.append('g').attr('transform', `translate(${p.x - w / 2} ${p.y - 36})`), color = series[Math.min(depth(n.id), 3)];
    g.append('path').attr('d', chamfer(0, 0, w, 72, 14)).attr('fill', C.panel); line(g, chamfer(0, 0, w, 72, 14), color, 3);
    text(g, w / 2, 47, n.label.toUpperCase(), {size: 28, font: F.text, weight: 700, color: C.white, anchor: 'middle'}); return {g, start: .2 + depth(n.id) * .7}; });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    for (const l of links) { draw(l.path, span(t, l.start, .5)); const travel = ((t - l.start - .5) / 1.1) % 1, p = l.path.node().getPointAtLength(l.length * Math.max(0, travel)); l.pulse.attr('x', p.x - 7).attr('y', p.y - 7).attr('opacity', t > l.start + .5 ? 1 : 0); }
    for (const n of nodes) { const q = span(t, n.start, .3); n.g.attr('opacity', q <= 0 ? 0 : q < 1 && Math.floor(q * 6) % 2 ? .3 : 1); }
  }};
}
