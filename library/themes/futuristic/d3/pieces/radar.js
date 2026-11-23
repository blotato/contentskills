import {C, F, line, ring, text, draw, span} from '../../hud.js';
import {card} from './_card.js';

// A radar sweep that discovers labelled contacts — for "what's out there" moments: competitors, niches, signals.
export const meta = {duration: 5, loop: true};
export const defaults = {title: 'Signal scan', unit: 'Audience radar', clear: false,
  contacts: [{label: 'TikTok', angle: 40, r: .55}, {label: 'Reels', angle: 130, r: .78}, {label: 'Shorts', angle: 215, r: .42}, {label: 'X', angle: 300, r: .7}]};

export function mount(el, props = defaults) {
  const {root, frame, defs, id} = card(el, props), cx = 500, cy = 590, R = 310;
  for (const k of [1, .66, .33]) ring(root, cx, cy, R * k, C.teal, 2, k === 1 ? null : '6 10');
  line(root, `M${cx - R} ${cy}H${cx + R}M${cx} ${cy - R}V${cy + R}`, C.grid, 2);
  const grad = defs.append('linearGradient').attr('id', id + '-sweep'); grad.append('stop').attr('offset', 0).attr('stop-color', C.cyan).attr('stop-opacity', 0); grad.append('stop').attr('offset', 1).attr('stop-color', C.cyan).attr('stop-opacity', .55);
  const wedge = root.append('path').attr('d', window.d3.arc().innerRadius(0).outerRadius(R).startAngle(-.7).endAngle(0)()).attr('fill', `url(#${id}-sweep)`), beam = line(root, `M0 0V${-R}`, C.cyan, 4);
  const spots = props.contacts.map(c => { const a = (c.angle - 90) * Math.PI / 180, x = cx + Math.cos(a) * R * c.r, y = cy + Math.sin(a) * R * c.r, g = root.append('g');
    g.append('rect').attr('x', x - 9).attr('y', y - 9).attr('width', 18).attr('height', 18).attr('fill', C.amber).attr('transform', `rotate(45 ${x} ${y})`);
    const halo = ring(g, x, y, 10, C.amber, 2); text(g, x + 24, y + 9, c.label.toUpperCase(), {size: 24, color: C.white}); return {g, halo, angle: c.angle}; });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    const angle = (t / meta.duration * 720) % 360;
    wedge.attr('transform', `translate(${cx} ${cy}) rotate(${angle})`); beam.attr('transform', `translate(${cx} ${cy}) rotate(${angle})`);
    for (const s of spots) { const since = ((angle - s.angle + 360) % 360) / 360, seen = t / meta.duration * 720 >= s.angle; s.g.attr('opacity', seen ? Math.max(.35, 1 - since) : 0); s.halo.attr('r', 10 + since * 60).attr('opacity', 1 - since); }
  }};
}
