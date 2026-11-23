import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// The eight phases of the moon in a row, lit one after another; the phase at `phase` (0..7) is
// enlarged above them with its name, and a thin cloud drifts across it.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'That night', unit: 'Moon phase · illustrative', phase: 4, names: ['NEW MOON', 'WAXING CRESCENT', 'FIRST QUARTER', 'WAXING GIBBOUS', 'FULL MOON', 'WANING GIBBOUS', 'LAST QUARTER', 'WANING CRESCENT'], label: 'NO CLOUD. NO WIND. NO REASON.'};

/** Path of the lit part of a moon of radius r at phase 0..8 (0 new, 4 full). */
const lit = (r, p) => { const f = (p % 8) / 8, waxing = f <= .5, k = Math.cos(f * 2 * Math.PI), rx = Math.abs(k) * r, far = waxing ? 1 : 0; return f === 0 ? '' : `M0 ${-r}A${r} ${r} 0 0 ${far} 0 ${r}A${rx} ${r} 0 0 ${k > 0 ? (waxing ? 0 : 1) : (waxing ? 1 : 0)} 0 ${-r}Z`; };
export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, n = 8, y = 800, r = 38, big = g.append('g').attr('transform', 'translate(500 480)'), R = 190;
  big.append('circle').attr('r', R * 1.6).attr('fill', radial(c.st, [[0, '#aab6d6', .28], [1, '#aab6d6', 0]])); big.append('circle').attr('r', R).attr('fill', '#0c1014').attr('stroke', C.fog).attr('stroke-width', 1.5).attr('stroke-opacity', .4);
  const face = big.append('g').attr('mask', c.st.wear); face.append('path').attr('d', lit(R, props.phase)).attr('fill', '#dfe3ea'); [[-50, -60, 40], [60, 30, 54], [-30, 80, 30], [70, -80, 24]].forEach(([x, yy, rr]) => face.append('circle').attr('cx', x).attr('cy', yy).attr('r', rr).attr('fill', '#000').attr('opacity', .12));
  const cloud = big.append('g'), puffs = [0, 1, 2, 3].map(i => cloud.append('ellipse').attr('rx', 230 + i * 30).attr('ry', 44 + i * 8).attr('cy', -70 + i * 50).attr('fill', radial(c.st, [[0, '#07090c', .95], [.6, '#07090c', .8], [1, '#07090c', 0]])));
  const row = Array.from({length: n}, (_, i) => { const x = BOX.x0 + 50 + i * (BOX.w - 100) / (n - 1), m = g.append('g').attr('transform', `translate(${x} ${y})`); m.append('circle').attr('r', r).attr('fill', '#0c1014').attr('stroke', i === props.phase ? C.rose : C.fog).attr('stroke-width', i === props.phase ? 3 : 1.5); m.append('path').attr('d', lit(r - 3, i)).attr('fill', C.bone); return m; });
  const name = letters(g, props.names[props.phase] ?? '', 500, 250 + 28, 44, {seed: 5, spacing: .26}), label = txt(g, 500, BOX.y1 + 4, up(props.label), {size: 24, color: C.fog, spacing: .3, anchor: 'middle'});
  return {seek(t) {
    c.head(t); row.forEach((m, i) => m.attr('opacity', flickerOn(t, .6 + i * .16, .25, i) * (i === props.phase ? 1 : .5))); big.attr('opacity', span(t, 1.6, 1.2) * (.92 + .08 * noise(t * 3, 2)));
    puffs.forEach((p, i) => p.attr('cx', -520 + ((t * (26 + i * 9) + i * 260) % 1100))); name.show(t, {at: 2.2, spread: .6}); label.attr('opacity', flickerOn(t, 3.4, .3, 4) * .9);
  }};
}
