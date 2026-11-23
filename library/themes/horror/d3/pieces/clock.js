import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// A clock face whose hands run forward fast and then stop dead on the time that matters; the
// second hand keeps twitching without advancing. The time is repeated below in figures.
export const meta = {duration: 5.5, live: true};
export const defaults = {title: 'Time of the call', unit: 'From the log · illustrative', time: '03:14', label: 'EVERY NIGHT, THE SAME MINUTE', spins: 2};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, cx = 500, cy = 500, R = 230, [hh, mm] = String(props.time).split(':').map(Number), face = g.append('g').attr('mask', c.st.wear);
  face.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R).attr('fill', '#000').attr('fill-opacity', .25).attr('stroke', C.bone).attr('stroke-width', 3).attr('opacity', .8); face.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R - 16).attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 1).attr('opacity', .4);
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, big = i % 5 === 0, r1 = R - 28, r2 = R - (big ? 58 : 40); hair(face, `M${cx + Math.sin(a) * r1} ${cy - Math.cos(a) * r1}L${cx + Math.sin(a) * r2} ${cy - Math.cos(a) * r2}`, C.bone, big ? 4 : 1.5, big ? .9 : .45); }
  const hand = (len, w, color) => g.append('path').attr('d', `M0 24V${-len}`).attr('stroke', color).attr('stroke-width', w).attr('stroke-linecap', 'round'), hour = hand(R * .5, 9, C.bone), minute = hand(R * .78, 6, C.bone), second = hand(R * .84, 2.5, C.rose); g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 9).attr('fill', C.rose);
  const figures = letters(g, String(props.time), cx, 838, 96, {spacing: .08, seed: 6}), label = txt(g, cx, 890, up(props.label), {size: 24, color: C.fog, spacing: .3, anchor: 'middle'});
  return {seek(t) {
    c.head(t); const q = easeInOut(span(t, .6, 2.2)), total = (hh % 12) * 60 + mm + props.spins * 720, mins = total * q, stopped = q >= 1;
    hour.attr('transform', `translate(${cx} ${cy}) rotate(${mins / 720 * 360})`); minute.attr('transform', `translate(${cx} ${cy}) rotate(${mins / 60 * 360})`);
    second.attr('transform', `translate(${cx} ${cy}) rotate(${stopped ? 222 + (hash(step(t, 8), 3) < .35 ? 6 : 0) : t * 360})`); figures.show(t, {at: 2.9, spread: .3}); label.attr('opacity', flickerOn(t, 3.5, .3, 4) * .9);
  }};
}
