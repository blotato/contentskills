import {span, settle, up, land, compass, route, rule, txt, uid, hash} from '../../kit.js';
import {card, ink, INK, SOFT, PAPER, C, F} from './_card.js';

// A paper map of a made-up coast: graticule, hatched shoreline, compass and scale, and a dashed
// crimson route that travels from place to place, each name entered as the route arrives.
// `places` are {label, x, y} with x, y 0..1 of the map area, in travelling order.
export const meta = {duration: 6};
export const defaults = {title: 'The crossing', unit: 'Illustrative map · not a real place', sea: 'The Grey Sea', clear: false,
  places: [{label: 'PORT ELM', x: .16, y: .3}, {label: 'STONEFORD', x: .44, y: .46}, {label: 'HOLLOW BAY', x: .56, y: .78}, {label: 'EASTMARCH', x: .84, y: .56}]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), X = 118, Y = 262, W = 764, H = 612, id = uid('mp');
  body.append('clipPath').attr('id', id).append('rect').attr('x', X).attr('y', Y).attr('width', W).attr('height', H);
  const map = body.append('g').attr('clip-path', `url(#${id})`);
  map.append('rect').attr('x', X).attr('y', Y).attr('width', W).attr('height', H).attr('fill', '#c9c3b0');
  let grat = ''; for (let i = 1; i < 6; i++) grat += `M${X + W * i / 6} ${Y}v${H}`; for (let i = 1; i < 5; i++) grat += `M${X} ${Y + H * i / 5}h${W}`;
  map.append('path').attr('d', grat).attr('stroke', INK).attr('stroke-width', 1).attr('opacity', .22);
  const shapes = [land(X + W * .3, Y + H * .36, W * .34, H * .3, {seed: 3}), land(X + W * .78, Y + H * .62, W * .24, H * .3, {seed: 8, rough: .34}), land(X + W * .5, Y + H * .86, W * .2, H * .1, {seed: 5})];
  for (const d of shapes) { map.append('path').attr('d', d).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 16).attr('opacity', .1); map.append('path').attr('d', d).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 7).attr('stroke-dasharray', '1.5 5').attr('opacity', .4);
    map.append('path').attr('d', d).attr('fill', PAPER).attr('stroke', INK).attr('stroke-width', 2.5); }
  let hills = ''; for (let i = 0; i < 9; i++) { const hx = X + W * (.16 + .26 * hash(i + 3)), hy = Y + H * (.2 + .26 * hash(i + 19)); hills += `M${hx - 14} ${hy}l14 -16l14 16M${hx - 5} ${hy - 6}l5 6`; }
  map.append('path').attr('d', hills).attr('stroke', INK).attr('stroke-width', 1.6).attr('fill', 'none').attr('opacity', .5);
  txt(map, X + W * .76, Y + H * .17, props.sea ?? '', {font: F.italic, weight: 400, size: 32, color: SOFT, spacing: .16, anchor: 'middle'}).attr('transform', `rotate(-6 ${X + W * .76} ${Y + H * .17})`);
  compass(map, 44, {color: INK}).attr('transform', `translate(${X + 78} ${Y + H - 84})`);
  rule(map, X + W - 220, Y + H - 34, X + W - 40, {color: INK, width: 2, tickH: 7, every: 45}); ink(map, X + W - 130, Y + H - 48, 'SCALE · ILLUSTRATIVE', {size: 17, font: F.type, weight: 400, anchor: 'middle', color: SOFT});
  body.append('rect').attr('x', X).attr('y', Y).attr('width', W).attr('height', H).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 3); body.append('rect').attr('x', X - 8).attr('y', Y - 8).attr('width', W + 16).attr('height', H + 16).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 1);
  const pts = props.places.map(p => [X + p.x * W, Y + p.y * H]), rt = route(map, pts, {width: 5, dash: '15 9'});
  const cum = [0]; pts.forEach((p, i) => { if (i) cum.push(cum[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])); }); const total = cum.at(-1) || 1;
  const marks = props.places.map((p, i) => { const [x, y] = pts[i], g = map.append('g'), lab = up(p.label), right = p.x > .7, w = lab.length * 15.5 + 22, above = p.y > .7;
    const dot = g.append('circle').attr('cx', x).attr('cy', y).attr('fill', PAPER).attr('stroke', INK).attr('stroke-width', 4), core = g.append('circle').attr('cx', x).attr('cy', y).attr('r', 4).attr('fill', i === pts.length - 1 ? C.crimson : INK);
    const lg = g.append('g'), lx = right ? x - w - 14 : x + 16, ly = above ? y - 46 : y + 16; lg.append('rect').attr('x', lx).attr('y', ly).attr('width', w).attr('height', 36).attr('fill', PAPER).attr('stroke', INK).attr('stroke-width', 1.5);
    ink(lg, lx + w / 2, ly + 27, lab, {size: 25, anchor: 'middle', spacing: .05}); return {dot, core, lg, at: cum[i] / total}; });
  const rider = map.append('circle').attr('r', 9).attr('fill', C.crimson).attr('stroke', PAPER).attr('stroke-width', 3);
  return {seek(t) {
    intro(t); const q = span(t, .9, meta.duration - 2.2), e = q * q * (3 - 2 * q); rt.set(e); const [rx, ry] = rt.at(e); rider.attr('cx', rx).attr('cy', ry).attr('opacity', span(t, .8, .2));
    map.attr('opacity', span(t, .2, .5));
    marks.forEach(m => { const on = settle(span(e, m.at - .09, .08)) * span(t, .8, .3); m.dot.attr('r', 11 * on); m.core.attr('opacity', on); m.lg.attr('opacity', on).attr('transform', `translate(0 ${6 * (1 - on)})`); });
  }};
}
