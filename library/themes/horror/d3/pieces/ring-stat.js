import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// One percentage as a thin ring that fills in rose, with the figure in the middle rolling up to it.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Never explained', unit: 'Share of cases · illustrative', value: 68, suffix: '%', label: 'CLOSED WITHOUT AN ANSWER'};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, cx = 500, cy = 530, R = 240, arc = window.d3.arc().innerRadius(R - 16).outerRadius(R).startAngle(0);
  g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R - 8).attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 2).attr('opacity', .3);
  for (let i = 0; i < 50; i++) { const a = i / 50 * Math.PI * 2; hair(g, `M${cx + Math.sin(a) * (R + 16)} ${cy - Math.cos(a) * (R + 16)}L${cx + Math.sin(a) * (R + (i % 5 ? 26 : 38))} ${cy - Math.cos(a) * (R + (i % 5 ? 26 : 38))}`, C.bone, 1.5, .35); }
  const fill = g.append('path').attr('transform', `translate(${cx} ${cy})`).attr('fill', C.rose).attr('mask', c.st.wear), num = letters(g, String(props.value).padStart(2, '0') + (props.suffix ?? ''), cx + 8, cy + 62, 190, {spacing: .04, seed: 3});
  const label = txt(g, cx, BOX.y1 + 4, up(props.label), {size: 30, font: F.head, weight: 400, spacing: .24, anchor: 'middle'});
  return {seek(t) {
    c.head(t); const q = easeInOut(span(t, .8, 1.8)), v = props.value * q, text = String(Math.round(v)).padStart(2, '0') + (props.suffix ?? ''); fill.attr('d', arc({endAngle: Math.PI * 2 * v / 100})).attr('opacity', lamp(t, 5, .4, 2));
    num.show(t, {at: .6, spread: .3}); num.units.forEach(u => u.g.select('text').text(text[u.at] ?? '')); label.attr('opacity', flickerOn(t, 2.8, .3, 3));
  }};
}
