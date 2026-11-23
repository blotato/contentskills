import {C, F, series, line, ring, text, draw, span, easeInOut, flicker} from '../../hud.js';
import {card} from './_card.js';

// A chord diagram: arcs for each member sweep onto a ring, ribbons between them switch on one
// by one, then a highlight keeps stepping from link to link.
export const meta = {duration: 5.5, live: true};
export const defaults = {title: 'Shared audience', unit: 'Illustrative · overlap between channels', clear: false, nodes: ['TikTok', 'Reels', 'Shorts', 'X', 'Email', 'Podcast'],
  links: [[0, 1, 8], [0, 2, 7], [1, 2, 6], [3, 4, 3], [4, 5, 4], [2, 5, 2], [0, 3, 3], [1, 4, 2]]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame} = card(el, props), cx = 500, cy = 580, R = 252, n = props.nodes.length, matrix = Array.from({length: n}, () => Array(n).fill(0));
  for (const [a, b, v] of props.links) { matrix[a][b] = v; matrix[b][a] = v; }
  const layout = d3.chord().padAngle(.07).sortSubgroups(d3.descending)(matrix), arc = d3.arc().innerRadius(R - 18).outerRadius(R), ribbon = d3.ribbon().radius(R - 26);
  const g = root.append('g').attr('transform', `translate(${cx} ${cy})`), outer = ring(root, cx, cy, R + 16, C.dim, 2, '2 9'), inner = ring(root, cx, cy, 44, C.teal, 2, '18 10');
  const ribbons = layout.map((c, i) => ({c, path: g.append('path').attr('d', ribbon(c)).attr('fill', series[c.source.index % series.length]).attr('stroke', series[c.source.index % series.length]).attr('stroke-width', 1.5), at: 1.5 + i * .16}));
  const groups = layout.groups.map((gr, i) => { const color = series[i % series.length], mid = (gr.startAngle + gr.endAngle) / 2, sx = Math.sin(mid), sy = -Math.cos(mid);
    const label = text(root, cx + sx * (R + 40), cy + sy * (R + 40) + 9, props.nodes[i].toUpperCase(), {size: 26, font: F.text, weight: 700, color: C.white, anchor: Math.abs(sx) < .25 ? 'middle' : sx > 0 ? 'start' : 'end', spacing: '.05em'});
    return {gr, i, color, label, path: g.append('path').attr('fill', color), tick: line(g, `M${sx * (R + 6)} ${sy * (R + 6)}L${sx * (R + 26)} ${sy * (R + 26)}`, color, 3)}; });
  return {seek(t) {
    draw(frame, span(t, 0, .5)); outer.attr('opacity', span(t, .2, .3)).attr('transform', `rotate(${t * 8} ${cx} ${cy})`); inner.attr('opacity', span(t, .2, .3)).attr('transform', `rotate(${-t * 30} ${cx} ${cy})`);
    const sweep = easeInOut(span(t, .3, 1.3)) * Math.PI * 2, active = t > 3 ? Math.floor((t - 3) / .7) % ribbons.length : -1, hot = active < 0 ? null : ribbons[active].c;
    for (const p of groups) {
      p.path.attr('d', p.gr.startAngle >= sweep ? null : arc({startAngle: p.gr.startAngle, endAngle: Math.max(p.gr.startAngle + .001, Math.min(p.gr.endAngle, sweep))}));
      const lit = hot && (hot.source.index === p.i || hot.target.index === p.i); p.label.attr('opacity', flicker(t, .5 + p.i * .14)).attr('fill', lit ? p.color : C.white); draw(p.tick, span(t, .45 + p.i * .14, .25));
    }
    ribbons.forEach((r, i) => r.path.attr('opacity', flicker(t, r.at)).attr('fill-opacity', i === active ? .75 : active < 0 ? .3 : .16).attr('stroke-opacity', i === active ? 1 : .6));
  }};
}
