import {C, up, fit, captionBox, inked, scaleTo, span, spring, clamp} from '../../kit.js';
import {card, toned, shout, label, counted} from './_card.js';

// A dial with three inked zones. The needle whips round from zero, overshoots and quivers on the
// reading, which is shouted under the hub; a caption box says which zone it landed in.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Burnout meter', unit: 'Illustrative · posts per week', value: 14, max: 21, suffix: '', clear: false,
  zones: [{to: 7, label: 'Fine', color: C.green}, {to: 14, label: 'Tired', color: C.yellow}, {to: 21, label: 'Toast', color: C.red}], ends: ['0', null]};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, d3 = window.d3, cx = 500, cy = 700, R = 360, r = 230, A = v => (clamp(v / props.max) - .5) * Math.PI, arc = d3.arc().innerRadius(r).outerRadius(R).padAngle(.025);
  const g = root.append('g').attr('transform', `translate(${cx} ${cy})`); let from = 0;
  const zones = props.zones.map((z, i) => {
    const a0 = A(from), a1 = A(z.to), mid = (a0 + a1) / 2; from = z.to;
    const shape = toned(stage, g, {fill: z.color, area: [-R - 20, -R - 20, R * 2 + 40, R + 40], from: [.5, 0], reach: .6, pitch: 20}).set(arc({startAngle: a0, endAngle: a1}));
    const text = up(z.label), size = Math.min(40, fit(text, (a1 - a0) * (r + R) / 2 * .8, 40, {role: 'slab'})), lg = g.append('g').attr('transform', `translate(${Math.sin(mid) * (r + R) / 2} ${-Math.cos(mid) * (r + R) / 2}) rotate(${mid * 180 / Math.PI})`);
    label(lg, 0, size * .36, text, {size, color: z.color === C.yellow ? C.ink : C.white});
    return {z, shape, lg};
  });
  for (let k = 0; k <= 12; k++) { const a = (k / 12 - .5) * Math.PI; g.append('path').attr('d', `M${Math.sin(a) * (r - 14)} ${-Math.cos(a) * (r - 14)}L${Math.sin(a) * (r - (k % 3 ? 34 : 54))} ${-Math.cos(a) * (r - (k % 3 ? 34 : 54))}`).attr('stroke', C.ink).attr('stroke-width', k % 3 ? 5 : 8).attr('stroke-linecap', 'round'); }
  label(g, -R + 60, 56, props.ends?.[0] ?? '0', {size: 34}); label(g, R - 60, 56, props.ends?.[1] ?? String(props.max), {size: 34});
  const needle = g.append('g'); inked(needle, `M-16 10L0 ${-r - 70}L16 10Z`, {fill: C.ink, drop: 0, width: 6}); needle.append('path').attr('d', `M-5 0L0 ${-r - 40}L5 0Z`).attr('fill', C.red);
  g.append('circle').attr('r', 40).attr('cx', 6).attr('cy', 6).attr('fill', C.ink); g.append('circle').attr('r', 40).attr('fill', C.white).attr('stroke', C.ink).attr('stroke-width', 8);
  const zone = props.zones.find(z => props.value <= z.to) ?? props.zones.at(-1), value = shout(root, cx, cy + 170, '', {size: 120, color: C.yellow});
  const verdict = captionBox(root, cx, cy + 190, zone.label + '!', {size: 34, anchor: 'middle', fill: C.white, tilt: -2});
  return {seek(t) {
    stage.intro(t);
    zones.forEach(({shape, lg}, i) => { const s = spring(span(t, .4 + i * .15, .45)); shape.g.attr('transform', `scale(${Math.max(.0001, s)})`).attr('opacity', s > .001 ? 1 : 0); lg.attr('opacity', span(t, .7 + i * .15, .15)); });
    const q = span(t, 1, 1.1), s = spring(q), a = A(props.value * s) * 180 / Math.PI + (q >= 1 ? Math.sin(t * 13) * 1.2 : 0);
    needle.attr('transform', `rotate(${a})`).attr('opacity', span(t, .8, .1));
    value.say(counted(props.value, clamp(s)) + (props.suffix ?? '')).attr('opacity', q > 0 ? 1 : 0); scaleTo(verdict.g, spring(span(t, 2.1, .4)), 0);
  }};
}
