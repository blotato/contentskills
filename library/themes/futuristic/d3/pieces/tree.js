import {C, F, series, chamfer, line, text, draw, span, flicker, scramble} from '../../hud.js';
import {card} from './_card.js';

// A hierarchy laid out left to right with circuit-board links: chamfered elbows, solder dots
// at the joints and packets that keep travelling from the root to every leaf.
export const meta = {duration: 4.8, live: true};
export const defaults = {title: 'One pillar, many pieces', unit: 'Content tree', clear: false,
  root: {label: 'Pillar video', children: [{label: 'Clips', children: [{label: 'Shorts'}, {label: 'Reels'}]}, {label: 'Written', children: [{label: 'Thread'}, {label: 'Newsletter'}]}, {label: 'Audio', children: [{label: 'Podcast'}]}]}};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame} = card(el, props), tree = d3.hierarchy(props.root); d3.tree().size([600, 1]).separation((a, b) => a.parent === b.parent ? 1 : 1.25)(tree);
  const depth = tree.height || 1, bw = Math.min(250, 760 / (depth + 1) - 60), bh = 66, X = d => 84 + d.depth * ((832 - bw) / depth), Y = d => 270 + d.x;
  const links = tree.links().map(({source: s, target: e}) => { const x0 = X(s) + bw, y0 = Y(s) + 0, x1 = X(e), y1 = Y(e), mx = x0 + (x1 - x0) * .45, dy = y1 - y0, c = Math.min(16, Math.abs(dy) / 2) * Math.sign(dy);
    const d = Math.abs(dy) < 2 ? `M${x0} ${y0}H${x1}` : `M${x0} ${y0}H${mx - Math.abs(c)}L${mx} ${y0 + c}V${y1 - c}L${mx + Math.abs(c)} ${y1}H${x1}`, path = line(root, d, C.teal, 3);
    const joint = root.append('circle').attr('cx', mx - Math.abs(c)).attr('cy', y0).attr('r', 5).attr('fill', C.teal);
    return {path, joint, len: path.node().getTotalLength(), at: .55 + s.depth * .85, seed: e.x, packet: root.append('rect').attr('width', 14).attr('height', 8).attr('fill', C.amber)}; });
  const nodes = tree.descendants().map(d => { const g = root.append('g').attr('transform', `translate(${X(d)} ${Y(d) - bh / 2})`), color = series[Math.min(d.depth, series.length - 1)], name = String(d.data.label).toUpperCase();
    g.append('path').attr('d', chamfer(0, 0, bw, bh, 14)).attr('fill', C.panel); const edge = line(g, chamfer(0, 0, bw, bh, 14), color, 3);
    g.append('rect').attr('x', -5).attr('y', bh / 2 - 7).attr('width', 10).attr('height', 14).attr('fill', color); if (d.children) g.append('rect').attr('x', bw - 5).attr('y', bh / 2 - 7).attr('width', 10).attr('height', 14).attr('fill', color);
    return {g, edge, name, at: .25 + d.depth * .85, order: d.x / 600, label: text(g, bw / 2, bh / 2 + 10, '', {size: Math.min(30, (bw - 36) / (name.length * .56)), font: F.text, weight: 700, color: C.white, anchor: 'middle', spacing: '.05em'})}; });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    for (const l of links) { draw(l.path, span(t, l.at, .55)); l.joint.attr('opacity', span(t, l.at + .2, .1));
      const u = ((t - l.at - .55) / 1.3 + l.seed * .002) % 1, p = l.path.node().getPointAtLength(l.len * Math.max(0, u)); l.packet.attr('x', p.x - 7).attr('y', p.y - 4).attr('opacity', t > l.at + .55 ? Math.sin(Math.max(0, u) * Math.PI) : 0); }
    for (const n of nodes) { const at = n.at + n.order * .3; n.g.attr('opacity', flicker(t, at)); draw(n.edge, span(t, at, .45)); n.label.text(scramble(n.name, span(t, at + .1, .45), t)); }
  }};
}
