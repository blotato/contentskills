import {C, F, line, text, draw, span, easeInOut} from '../../hud.js';
import {card} from './_card.js';

// A trend line traced by a tracking marker, ending on a called-out value.
export const meta = {duration: 3.4};
export const defaults = {title: 'Followers over time', unit: 'Illustrative · thousands', points: [2, 3, 3.5, 5, 6, 9, 11, 18, 26, 41, 58, 84], callout: '84K', clear: false};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), pts = props.points;
  const x = d3.scaleLinear().domain([0, pts.length - 1]).range([110, 860]), y = d3.scaleLinear().domain([0, d3.max(pts) * 1.12]).range([840, 290]);
  for (const v of y.ticks(4)) { line(root, `M110 ${y(v)}H890`, C.grid, 2); text(root, 96, y(v) + 7, v, {size: 20, color: C.dim, anchor: 'end', spacing: '0'}); }
  const grad = defs.append('linearGradient').attr('id', id + '-area').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);
  grad.append('stop').attr('offset', 0).attr('stop-color', C.cyan).attr('stop-opacity', .4); grad.append('stop').attr('offset', 1).attr('stop-color', C.cyan).attr('stop-opacity', 0);
  const clip = defs.append('clipPath').attr('id', id + '-clip').append('rect').attr('y', 0).attr('height', 1000);
  root.append('path').attr('d', d3.area().x((d, i) => x(i)).y0(840).y1(d => y(d))(pts)).attr('fill', `url(#${id}-area)`).attr('clip-path', `url(#${id}-clip)`);
  const path = line(root, d3.line().x((d, i) => x(i)).y(d => y(d))(pts), C.cyan, 5), length = path.node().getTotalLength();
  const dots = pts.map((d, i) => root.append('rect').attr('x', x(i) - 6).attr('y', y(d) - 6).attr('width', 12).attr('height', 12).attr('fill', C.bg).attr('stroke', C.cyan).attr('stroke-width', 2));
  const cursor = line(root, '', C.magenta, 2), label = text(root, 0, 0, props.callout, {size: 64, font: F.display, weight: 800, color: C.amber, anchor: 'end', spacing: '0'});
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    const q = easeInOut(span(t, .3, 2.2)), p = path.node().getPointAtLength(length * q);
    draw(path, q); clip.attr('width', p.x); dots.forEach((d, i) => d.attr('opacity', x(i) <= p.x + 1 ? 1 : 0));
    cursor.attr('d', `M${p.x} 280V850M90 ${p.y}H900`).attr('opacity', q > 0 && q < 1 ? .8 : 0);
    const pop = span(t, 2.5, .3); label.attr('x', 890).attr('y', y(pts.at(-1)) - 34).attr('opacity', pop ? (Math.floor(pop * 6) % 2 && pop < 1 ? .3 : 1) : 0);
  }};
}
