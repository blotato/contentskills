import {C, F, series, line, text, draw, span, easeBack, easeOut, flicker, typed} from '../../hud.js';
import {card} from './_card.js';

// A spider (radar-area) chart: the web builds ring by ring, each shape pushes out from the
// centre one corner at a time with a small overshoot, then the shapes breathe while a sweep
// circles the web and reads out the axis it is crossing.
export const meta = {duration: 7, live: true};
export const defaults = {title: 'Skill profile', unit: 'Illustrative · score out of 10', max: 10, axes: ['Hook', 'Story', 'Editing', 'Voice', 'Design', 'Consistency'], clear: false,
  series: [{label: 'Now', values: [4, 6, 5, 7, 3, 5]}, {label: 'Goal', values: [8, 8, 7, 8, 6, 9]}]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), A = props.axes, n = A.length, cx = 500, cy = 560, R = 236, W = Math.PI * 2, P = (i, r) => [cx + Math.sin(i / n * W) * r, cy - Math.cos(i / n * W) * r];
  const poly = r => d3.range(n).map(i => `${i ? 'L' : 'M'}${P(i, r).join(' ')}`).join('') + 'Z', webs = [1, 2, 3, 4, 5].map(k => line(root, poly(R * k / 5), k === 5 ? C.teal : C.grid, 2)), scale = [1, 3, 5].map(k => text(root, cx + 8, cy - R * k / 5 + 22, props.max * k / 5, {size: 18, color: C.dim, spacing: '0'}));
  const spokes = A.map((a, i) => { const [x, y] = P(i, R), [lx, ly] = P(i, R + 30), side = Math.sin(i / n * W), up = -Math.cos(i / n * W);
    return {i, rule: line(root, `M${cx} ${cy}L${x} ${y}`, C.dim, 2), label: a.toUpperCase(), name: text(root, lx, ly + (up > .5 ? 0 : up < -.5 ? 22 : 9), '', {size: 26, font: F.text, weight: 700, color: C.white, anchor: Math.abs(side) < .2 ? 'middle' : side > 0 ? 'start' : 'end', spacing: '.05em'})}; });
  const grad = defs.append('linearGradient').attr('id', id + '-sweep'); grad.append('stop').attr('offset', 0).attr('stop-color', C.white).attr('stop-opacity', 0); grad.append('stop').attr('offset', 1).attr('stop-color', C.white).attr('stop-opacity', .16);
  const wedge = root.append('path').attr('d', d3.arc().innerRadius(0).outerRadius(R).startAngle(-.5).endAngle(0)()).attr('fill', `url(#${id}-sweep)`), beam = line(root, `M0 0V${-R}`, C.white, 2);
  const shapes = props.series.map((s, k) => { const color = series[k % series.length], area = root.append('path').attr('fill', color).attr('fill-opacity', .2).attr('stroke', color).attr('stroke-width', 4).attr('stroke-linejoin', 'round');
    const dots = s.values.map(() => root.append('rect').attr('width', 14).attr('height', 14).attr('fill', C.bg).attr('stroke', color).attr('stroke-width', 3));
    const key = root.append('g').attr('transform', `translate(${110 + k * 420} 872)`); key.append('rect').attr('width', 22).attr('height', 22).attr('y', 2).attr('fill', color); text(key, 36, 22, String(s.label).toUpperCase(), {size: 28, font: F.text, weight: 700, color: C.white, spacing: '.05em'});
    text(key, 0, 62, 'AVERAGE', {size: 20, color: C.dim, spacing: '.16em'});
    return {s, k, color, area, dots, key, at: 1.5 + k * 1.1, mean: d3.mean(s.values), avg: text(key, 150, 64, '', {size: 40, font: F.display, weight: 800, color, spacing: '0'})}; });
  const built = 1.5 + props.series.length * 1.1 + .6, spot = text(root, 916, 250, '', {size: 24, color: C.amber, anchor: 'end', spacing: '.12em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); webs.forEach((w, k) => draw(w, span(t, .25 + k * .14, .5))); scale.forEach((s, k) => s.attr('opacity', flicker(t, .6 + k * .14)));
    for (const s of spokes) { draw(s.rule, span(t, .7 + s.i * .07, .35)); s.name.text(typed(s.label, span(t, .9 + s.i * .07, .3))); }
    const angle = ((t - built) / 4.5 % 1) * 360, sweeping = t > built, over = Math.round(angle / 360 * n) % n;
    wedge.attr('transform', `translate(${cx} ${cy}) rotate(${angle})`).attr('opacity', sweeping ? 1 : 0); beam.attr('transform', `translate(${cx} ${cy}) rotate(${angle})`).attr('opacity', sweeping ? .7 : 0);
    for (const p of shapes) { const pts = p.s.values.map((v, i) => { const breathe = sweeping ? 1 + .025 * Math.sin(t * 2.2 + i * 1.3 + p.k) : 1; return P(i, R * v / props.max * easeBack(span(t, p.at + i * .09, .6)) * breathe); });
      p.area.attr('d', pts.map((q, i) => `${i ? 'L' : 'M'}${q.join(' ')}`).join('') + 'Z').attr('opacity', t > p.at ? 1 : 0);
      p.dots.forEach((d, i) => { const hit = sweeping && i === over, grow = hit ? 6 : 0; d.attr('x', pts[i][0] - 7 - grow / 2).attr('y', pts[i][1] - 7 - grow / 2).attr('width', 14 + grow).attr('height', 14 + grow).attr('fill', hit ? p.color : C.bg).attr('opacity', t > p.at + i * .09 + .3 ? 1 : 0); });
      p.key.attr('opacity', flicker(t, p.at)); p.avg.text((p.mean * easeOut(span(t, p.at, 1))).toFixed(1)); }
    spokes.forEach(s => s.name.attr('fill', sweeping && s.i === over ? C.amber : C.white));
    spot.text(sweeping ? `> ${spokes[over].label}: ${props.series.map(s => s.values[over]).join(' / ')}` : '');
  }};
}
