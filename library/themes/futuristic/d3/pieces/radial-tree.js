import {C, F, series, chamfer, line, ring, text, draw, span, flicker, spring, typed, scramble} from '../../hud.js';
import {card} from './_card.js';

// A radial tree: branches leave a central hub along spokes and arcs, ring by ring. Once built,
// packets keep running from the hub to every leaf and a sweep goes round lighting each leaf as
// it passes.
export const meta = {duration: 7, live: true};
export const defaults = {title: 'Everything one channel feeds', unit: 'Content map', clear: false,
  root: {label: 'Channel', children: [{label: 'Video', children: [{label: 'Shorts'}, {label: 'Tutorials'}, {label: 'Vlogs'}]}, {label: 'Writing', children: [{label: 'Threads'}, {label: 'Newsletter'}]},
    {label: 'Audio', children: [{label: 'Podcast'}, {label: 'Clips'}]}, {label: 'Products', children: [{label: 'Course'}, {label: 'Templates'}, {label: 'Coaching'}]}]}};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), cx = 500, cy = 590, R = 250, W = Math.PI * 2, tree = d3.hierarchy(props.root); d3.cluster().size([W, 1]).separation((a, b) => a.parent === b.parent ? 1 : 1.6)(tree);
  const depth = tree.height || 1, rad = d => d.depth / depth * R, P = (a, r) => [cx + Math.sin(a) * r, cy - Math.cos(a) * r], leaves = tree.leaves();
  const rings = d3.range(1, depth + 1).map(k => ring(root, cx, cy, k / depth * R, C.grid, 2)), dashes = d3.range(1, depth + 1).map(k => ring(root, cx, cy, k / depth * R + 14, C.teal, 2, k % 2 ? '4 14' : '50 26'));
  const grad = defs.append('linearGradient').attr('id', id + '-sweep'); grad.append('stop').attr('offset', 0).attr('stop-color', C.cyan).attr('stop-opacity', 0); grad.append('stop').attr('offset', 1).attr('stop-color', C.cyan).attr('stop-opacity', .3);
  const wedge = root.append('path').attr('d', d3.arc().innerRadius(62).outerRadius(R + 14).startAngle(-.6).endAngle(0)()).attr('fill', `url(#${id}-sweep)`), beam = line(root, `M0 -62V${-(R + 14)}`, C.cyan, 2);
  const links = tree.links().map(({source: s, target: e}, k) => { const r0 = rad(s), r1 = rad(e), rm = (r0 + r1) / 2, [x1, y1] = P(e.x, r1); let d;
    if (!s.depth) { const [x0, y0] = P(e.x, 58); d = `M${x0} ${y0}L${x1} ${y1}`; }
    else { const [x0, y0] = P(s.x, r0 + 22), [xa, ya] = P(s.x, rm), [xb, yb] = P(e.x, rm); d = `M${x0} ${y0}L${xa} ${ya}A${rm} ${rm} 0 0 ${e.x > s.x ? 1 : 0} ${xb} ${yb}L${x1} ${y1}`; }
    const path = line(root, d, s.depth ? C.teal : C.cyan, 3);
    return {path, len: path.node().getTotalLength(), at: .7 + s.depth * 1.1 + k * .04, k, packet: root.append('circle').attr('r', 6).attr('fill', C.amber)}; });
  const nodes = tree.descendants().filter(d => d.depth).map((d, k) => { const [x, y] = P(d.x, rad(d)), g = root.append('g'), color = series[Math.min(d.depth, 3)], name = String(d.data.label).toUpperCase(), leaf = !d.children, side = Math.sin(d.x);
    let label, halo = null;
    if (leaf) { halo = ring(g, x, y, 12, color, 2); g.append('rect').attr('x', x - 8).attr('y', y - 8).attr('width', 16).attr('height', 16).attr('fill', color).attr('transform', `rotate(45 ${x} ${y})`);
      const [lx, ly] = P(d.x, R + 34); label = text(g, lx, ly + 9, '', {size: 26, font: F.text, weight: 700, color: C.white, anchor: Math.abs(side) < .2 ? 'middle' : side > 0 ? 'start' : 'end', spacing: '.05em'}); }
    else { const w = name.length * 15 + 34; g.append('path').attr('d', chamfer(x - w / 2, y - 22, w, 44, 10)).attr('fill', C.panel); line(g, chamfer(x - w / 2, y - 22, w, 44, 10), color, 2.5);
      label = text(g, x, y + 9, '', {size: 24, font: F.text, weight: 700, color: C.white, anchor: 'middle', spacing: '.05em'}); }
    return {d, g, label, halo, name, leaf, color, at: .7 + (d.depth - 1) * 1.1 + .45 + k * .04}; });
  const hub = root.append('g'), hex = Array.from({length: 6}, (_, i) => `${i ? 'L' : 'M'}${Math.cos(i / 6 * W) * 58} ${Math.sin(i / 6 * W) * 58}`).join('') + 'Z'; hub.append('path').attr('d', hex).attr('fill', C.panel); line(hub, hex, C.cyan, 4);
  const core = String(props.root.label).toUpperCase(); text(hub, 0, 9, core, {size: Math.min(28, 96 / (core.length * .62)), font: F.text, weight: 700, color: C.white, anchor: 'middle', spacing: '.02em'});
  const built = .7 + depth * 1.1 + .8, foot = text(root, 84, 932, '', {size: 22, color: C.dim, spacing: '.18em'}), spot = text(root, 916, 932, '', {size: 24, color: C.amber, anchor: 'end', spacing: '.14em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); hub.attr('transform', `translate(${cx} ${cy}) scale(${spring(span(t, .15, .6))})`);
    rings.forEach((r, k) => r.attr('opacity', span(t, .3 + k * .25, .3))); dashes.forEach((r, k) => r.attr('opacity', span(t, .4 + k * .25, .3) * .8).attr('transform', `rotate(${(k % 2 ? -1 : 1) * t * 9} ${cx} ${cy})`));
    for (const l of links) { draw(l.path, span(t, l.at, .5)); const u = ((t - l.at - .5) / 1.5 + l.k * .13) % 1, p = l.path.node().getPointAtLength(l.len * Math.max(0, u)); l.packet.attr('cx', p.x).attr('cy', p.y).attr('opacity', t > l.at + .5 ? Math.sin(Math.max(0, u) * Math.PI) : 0); }
    const angle = ((t - built) / 5 % 1) * W, sweeping = t > built; wedge.attr('transform', `translate(${cx} ${cy}) rotate(${angle * 180 / Math.PI})`).attr('opacity', sweeping ? 1 : 0); beam.attr('transform', `translate(${cx} ${cy}) rotate(${angle * 180 / Math.PI})`).attr('opacity', sweeping ? .8 : 0);
    let hot = null;
    for (const n of nodes) { n.g.attr('opacity', flicker(t, n.at)); n.label.text(scramble(n.name, span(t, n.at + .05, .4), t));
      if (n.leaf) { const since = sweeping ? ((angle - n.d.x + W) % W) / W : 1, lit = since < .12; if (lit) hot = n; n.label.attr('fill', lit ? n.color : C.white); n.halo.attr('r', 12 + (since < .3 ? since / .3 * 26 : 0)).attr('opacity', since < .3 ? 1 - since / .3 : .8); } }
    foot.text(typed(`${leaves.length} ENDPOINTS · ${depth} LEVELS`, span(t, built - .4, .5))); spot.text(hot ? `> ${hot.d.parent.data.label} / ${hot.d.data.label}`.toUpperCase() : '');
  }};
}
