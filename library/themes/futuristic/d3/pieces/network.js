import {C, F, series, brackets, line, ring, text, draw, span, mix, flicker, spring, typed, hash, pad} from '../../hud.js';
import {card} from './_card.js';

// A force-style network. The layout is solved once at mount with a fixed number of simulation
// steps (no timers, no randomness), so it is the same every time. Nodes fly out of their parent
// in waves from the first node, cross-links switch on afterwards, then everything drifts gently
// while packets run along the links and a reticle steps through the best-connected nodes.
export const meta = {duration: 7, live: true};
export const defaults = {title: 'Who connects to whom', unit: 'Illustrative · creator network', clear: false,
  nodes: [{id: 'You', group: 0}, {id: 'TikTok', group: 1}, {id: 'Reels', group: 1}, {id: 'Shorts', group: 1}, {id: 'Email', group: 1}, {id: 'Podcast', group: 1},
    {id: 'Fans', group: 2}, {id: 'Brands', group: 2}, {id: 'Peers', group: 2}, {id: 'Search', group: 2}, {id: 'Press', group: 2}, {id: 'Buyers', group: 2}, {id: 'Guests', group: 2}, {id: 'Members', group: 2}],
  links: [['You', 'TikTok'], ['You', 'Reels'], ['You', 'Shorts'], ['You', 'Email'], ['You', 'Podcast'], ['TikTok', 'Fans'], ['Reels', 'Fans'], ['Reels', 'Brands'], ['Shorts', 'Search'], ['Shorts', 'Peers'],
    ['Email', 'Buyers'], ['Email', 'Members'], ['Podcast', 'Guests'], ['Podcast', 'Press'], ['TikTok', 'Peers'], ['Brands', 'Buyers'], ['Guests', 'Peers']]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame} = card(el, props), nodes = props.nodes.map((n, i) => ({...n, i, degree: 0})), byId = new Map(nodes.map(n => [n.id, n]));
  const links = props.links.map(([a, b]) => ({source: byId.get(a), target: byId.get(b)})).filter(l => l.source && l.target); for (const l of links) { l.source.degree++; l.target.degree++; }
  d3.forceSimulation(nodes).force('link', d3.forceLink(links.map(l => ({source: l.source.i, target: l.target.i}))).distance(70).strength(.7)).force('charge', d3.forceManyBody().strength(-420)).force('collide', d3.forceCollide(46)).force('center', d3.forceCenter(0, 0)).stop().tick(320);
  const ex = d3.extent(nodes, n => n.x), ey = d3.extent(nodes, n => n.y), X = d3.scaleLinear().domain(ex).range([150, 850]), Y = d3.scaleLinear().domain(ey).range([310, 850]);
  for (const n of nodes) { n.px = X(n.x); n.py = Y(n.y); n.depth = Infinity; }
  // Breadth-first from the first node: each node is born from the neighbour that reached it first.
  nodes[0].depth = 0; for (let queue = [nodes[0]]; queue.length;) { const n = queue.shift(); for (const l of links) { const m = l.source === n ? l.target : l.target === n ? l.source : null; if (m && m.depth === Infinity) { m.depth = n.depth + 1; m.parent = n; l.tree = true; queue.push(m); } } }
  for (const n of nodes) { if (n.depth === Infinity) n.depth = 1; n.at = .45 + n.depth * .75 + hash(n.i, 2) * .3; }
  const last = d3.max(nodes, n => n.at) + .7, wires = links.map((l, k) => ({l, k, at: l.tree ? 0 : last + k * .07, path: line(root, '', l.tree ? C.teal : C.dim, l.tree ? 3 : 2).attr('stroke-dasharray', l.tree ? null : '6 8'), packet: root.append('rect').attr('width', 10).attr('height', 10).attr('fill', C.amber)}));
  const marks = nodes.map(n => { const g = root.append('g'), color = series[(n.group ?? 0) % series.length], r = n.depth === 0 ? 30 : 10 + Math.min(4, n.degree) * 3;
    const halo = ring(g, 0, 0, r + 10, color, 2, n.depth === 0 ? '30 10' : null); g.append('rect').attr('x', -r * .7).attr('y', -r * .7).attr('width', r * 1.4).attr('height', r * 1.4).attr('fill', n.depth === 0 ? C.bg : color).attr('stroke', color).attr('stroke-width', 3).attr('transform', 'rotate(45)');
    const label = text(g, 0, r + 38, '', {size: n.depth === 0 ? 30 : n.depth === 1 ? 26 : 22, font: F.text, weight: 700, color: C.white, anchor: 'middle', spacing: '.06em'}).attr('paint-order', 'stroke').attr('stroke', C.bg).attr('stroke-width', 8);
    return {n, g, halo, label, r, name: String(n.label ?? n.id).toUpperCase()}; });
  const ranked = [...marks].sort((a, b) => b.n.degree - a.n.degree).slice(0, 6), reticle = line(root, brackets(-34, -34, 68, 68, 16), C.white, 3), wave = ring(root, 0, 0, 10, C.cyan, 2);
  const count = text(root, 916, 250, '', {size: 22, color: C.dim, anchor: 'end', spacing: '.16em'}), readout = text(root, 84, 928, '', {size: 26, color: C.amber, spacing: '.14em'});
  const at = (n, t) => { const q = spring(span(t, n.at, .8)), o = n.parent ?? n, sway = span(t, n.at + .8, 1);
    return [mix(o.px, n.px, q) + Math.sin(t * .9 + n.i * 1.7) * 7 * sway, mix(o.py, n.py, q) + Math.cos(t * .7 + n.i * 2.3) * 7 * sway]; };
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    const pos = nodes.map(n => at(n, t)); let shown = 0;
    for (const m of marks) { const [x, y] = pos[m.n.i], on = flicker(t, m.n.at); if (t > m.n.at) shown++;
      m.g.attr('transform', `translate(${x} ${y})`).attr('opacity', on); m.halo.attr('transform', `rotate(${t * 30 * (m.n.i % 2 ? 1 : -1)})`).attr('r', m.r + 10 + 3 * Math.sin(t * 2 + m.n.i));
      m.label.text(typed(m.name, span(t, m.n.at + .3, .35))); }
    let wired = 0;
    for (const w of wires) { const [x0, y0] = pos[w.l.source.i], [x1, y1] = pos[w.l.target.i], born = Math.max(w.at, w.l.source.at, w.l.target.at), on = t > born; if (on) wired++;
      w.path.attr('d', `M${x0} ${y0}L${x1} ${y1}`).attr('opacity', on ? (w.l.tree ? .9 : flicker(t, born) * .8) : 0);
      const u = ((t - born) * .55 + hash(w.k, 5)) % 1; w.packet.attr('x', mix(x0, x1, u) - 5).attr('y', mix(y0, y1, u) - 5).attr('opacity', t > born + .6 && w.l.tree ? Math.sin(u * Math.PI) : 0); }
    const [hx, hy] = pos[0], u = (t / 1.8) % 1; wave.attr('cx', hx).attr('cy', hy).attr('r', 34 + u * 90).attr('opacity', (1 - u) * .6 * span(t, .5, .2));
    count.text(`NODES ${pad(shown)} · LINKS ${pad(wired)}`).attr('opacity', flicker(t, .3));
    const slot = (t - last - .4) / 1.1, pick = ranked[Math.floor(Math.max(0, slot)) % ranked.length], [rx, ry] = pos[pick.n.i], snap = 1 + .8 * (1 - spring(span(slot % 1, 0, .4)));
    reticle.attr('transform', `translate(${rx} ${ry}) scale(${snap})`).attr('opacity', slot > 0 ? 1 : 0);
    readout.text(slot > 0 ? typed(`> ${pick.name} · ${pick.n.degree} LINKS`, span(slot % 1, .05, .35)) : '');
  }};
}
