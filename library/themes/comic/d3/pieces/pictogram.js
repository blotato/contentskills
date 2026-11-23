import {C, up, fit, captionBox, scaleTo, span, spring} from '../../kit.js';
import {card, shout} from './_card.js';

// "So many out of so many" as rows of inked figures: they pop on one by one, the counted ones in
// colour and bouncing, the rest left paper white, and the count is shouted underneath.
export const meta = {duration: 4.2, live: true};
export const defaults = {title: 'Who quits early', unit: 'Illustrative · creators in their first year', value: 7, total: 10, perRow: 5, phrase: 'OUT OF', label: 'Stop before video twenty', color: C.red, clear: false};

const figure = 'M-26 60Q-30 6 0 4Q30 6 26 60Z';
export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, n = props.total, per = Math.min(props.perRow, n), rows = Math.ceil(n / per), slotX = Math.min(150, 820 / per), slotY = Math.min(190, 400 / rows), s = Math.min(slotX / 82, slotY / 140), x0 = 500 - (per - 1) * slotX / 2, y0 = 290 + slotY / 2 - 14 * s;
  const people = Array.from({length: n}, (_, i) => {
    const on = i < props.value, g = root.append('g').attr('transform', `translate(${x0 + (i % per) * slotX} ${y0 + Math.floor(i / per) * slotY}) scale(${s})`).append('g'), fill = on ? props.color : C.white;
    [[C.ink, 7], [fill, 0]].forEach(([c, d]) => { const k = g.append('g').attr('transform', `translate(${d} ${d})`); k.append('path').attr('d', figure).attr('fill', c).attr('stroke', C.ink).attr('stroke-width', 7).attr('stroke-linejoin', 'round'); k.append('circle').attr('cy', -26).attr('r', 24).attr('fill', c).attr('stroke', C.ink).attr('stroke-width', 7); });
    return {g, on, i};
  });
  const line = `${props.value} ${up(props.phrase)} ${props.total}`, size = fit(line, 780, 150), total = shout(root.append('g').attr('transform', 'translate(500 818)').append('g'), 0, 0, line, {size, color: C.yellow}), plate = window.d3.select(total.node().parentNode);
  const note = captionBox(root, 500, 858, props.label, {size: Math.min(34, fit(up(props.label), 760, 34, {role: 'hand'})), anchor: 'middle', fill: C.white, tilt: -1});
  return {seek(t) {
    stage.intro(t);
    people.forEach(({g, on, i}) => { const q = span(t, .45 + i * 1.5 / n, .4), live = on && q >= 1 ? Math.abs(Math.sin(t * 3 + i * .7)) * 7 : 0; g.attr('transform', `translate(0 ${-live}) scale(${Math.max(.0001, spring(q))})`).attr('opacity', q > 0 ? 1 : 0); });
    scaleTo(plate, spring(span(t, 2.1, .5)), -2); scaleTo(note.g, spring(span(t, 2.5, .4)), 0);
  }};
}
