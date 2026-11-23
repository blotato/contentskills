import {C, up, balloon, clipLive, halftonePath, scaleTo, span, spring, easeInOut, mix} from '../../kit.js';
import {card, label} from './_card.js';

// A trend inked across the panel from left to right: thick black line with a colour core, halftone
// under it, a dot popping at every point, and a speech balloon calling out the last value.
export const meta = {duration: 4.2, live: true};
export const defaults = {title: 'Views per video', unit: 'Illustrative · thousands', clear: false, color: C.red, callout: null, suffix: 'K',
  points: [{label: 'Jan', value: 12}, {label: 'Feb', value: 18}, {label: 'Mar', value: 15}, {label: 'Apr', value: 29}, {label: 'May', value: 34}, {label: 'Jun', value: 52}]};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, P = props.points, n = P.length, x0 = 110, x1 = 880, base = 840, top = 400, max = Math.max(...P.map(d => d.value)) * 1.08, color = props.color ?? C.red;
  const X = i => mix(x0, x1, n > 1 ? i / (n - 1) : .5), Y = v => base - (base - top) * v / max, pts = P.map((d, i) => [X(i), Y(d.value)]), line = 'M' + pts.map(p => p.join(' ')).join('L');
  for (let k = 0; k <= 3; k++) root.append('path').attr('d', `M${x0 - 30} ${mix(base, top, k / 3)}H${x1 + 30}`).attr('stroke', C.ink).attr('stroke-width', k ? 3 : 8).attr('stroke-dasharray', k ? '4 14' : null).attr('stroke-linecap', 'round').attr('opacity', k ? .45 : 1);
  const mask = clipLive(stage), drawn = root.append('g').attr('clip-path', mask.url); mask.rect.attr('y', 200).attr('height', 700).attr('x', 0);
  const area = stage.defs.append('clipPath').attr('id', stage.id + '-area'); area.append('path').attr('d', `${line}L${x1} ${base}L${x0} ${base}Z`);
  const under = drawn.append('g').attr('clip-path', `url(#${stage.id}-area)`); under.append('rect').attr('x', x0).attr('y', top - 40).attr('width', x1 - x0).attr('height', base - top + 40).attr('fill', color).attr('opacity', .16);
  under.append('path').attr('d', halftonePath(x0, top - 40, x1 - x0, base - top + 40, {pitch: 24, from: [1, 0], reach: 1})).attr('fill', color).attr('opacity', .75);
  drawn.append('path').attr('d', line).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 20).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round').attr('transform', 'translate(7 7)').attr('opacity', .9);
  drawn.append('path').attr('d', line).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 22).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
  drawn.append('path').attr('d', line).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 10).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
  const nodes = pts.map(([x, y], i) => { const g = root.append('g').attr('transform', `translate(${x} ${y})`).append('g'); g.append('circle').attr('r', 17).attr('fill', i === n - 1 ? C.yellow : C.white).attr('stroke', C.ink).attr('stroke-width', 7); return g; });
  P.forEach((d, i) => label(root, X(i), base + 54, d.label, {size: Math.min(34, 700 / n / Math.max(2, String(d.label).length) * 1.9)}));
  const last = pts[n - 1], say = props.callout ?? `${P[n - 1].value}${props.suffix ?? ''}!`, bx = Math.min(last[0] - 60, 760), by = Math.max(300, last[1] - 150);
  const call = balloon(root, bx, by, say, {size: 56, role: 'head', lines: [up(say)], tx: last[0] - bx - 10, ty: last[1] - by - 26, pad: 30, color: C.red});
  return {seek(t) {
    stage.intro(t);
    const q = easeInOut(span(t, .5, 1.6)); mask.rect.attr('width', x0 - 20 + (x1 - x0 + 60) * q);
    nodes.forEach((g, i) => scaleTo(g, spring(span(t, .5 + 1.6 * (n > 1 ? i / (n - 1) : 0) * .92, .35)) * (i === n - 1 ? 1 + .12 * Math.sin(t * 5) : 1), 0));
    scaleTo(call.g, spring(span(t, 2.2, .45)), Math.sin(t * 2) * 1.5);
  }};
}
