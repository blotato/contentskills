import {card, C, up, span, ease, io, light, ring, flash, mono, title, fit, arcPts, along, dot} from './_card.js';

// One number inside a dial. The ring opens from the top, ticks come up round it with optional marks
// (years, steps), an inner arc sweeps to `progress` behind a red head and lands blue, and the
// number lands in the middle: orange, red, then white, its tracking closing in.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'Worth the wait', unit: 'Years in the making', clear: false, value: '13', label: 'Years', progress: .72,
  marks: ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'], note: 'Illustrative'};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, cx = 500, cy = 575, R = 245, marks = props.marks ?? [], m = marks.length;
  const dial = ring(root, cx, cy, R, {from: -90, width: 2.6}), inner = ring(root, cx, cy, R - 46, {from: -90, width: 1, color: C.mute, echo: false, halo: false, opacity: .5});
  const ticks = Array.from({length: 60}, (_, i) => {
    const a = (i * 6 - 90) * Math.PI / 180, major = i % 5 === 0, r0 = R + 10, r1 = R + (major ? 30 : 18);
    return light(root, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], major ? {width: 1.6, opacity: .85} : {width: 1, color: C.mute, echo: false, halo: false, opacity: .7});
  });
  const labels = marks.map((s, i) => { const a = (-90 + 360 * i / m) * Math.PI / 180; return mono(root, cx + Math.cos(a) * (R + 62), cy + Math.sin(a) * (R + 62) + 6, up(s), {size: 15, anchor: 'middle', color: C.dim, track: .1, opacity: 0}); });
  const p = Math.max(.01, Math.min(1, props.progress ?? 1)), sweepPts = arcPts(cx, cy, R - 23, -90, -90 + 360 * p), sweep = light(root, sweepPts, {width: 3});
  const head = dot(root, 0, 0, {color: 'red', r: 8}), endPt = sweepPts.at(-1), blue = flash(root, endPt[0], endPt[1], {color: 'blue', r: 140});
  const str = String(props.value ?? ''), size = Math.min(140, fit(str, 300, 140, {track: .06})), num = title(root, str, cx, cy + size * .36, size, {track: .06});
  const lab = mono(root, cx, cy + size * .36 + 56, up(props.label ?? ''), {size: 20, anchor: 'middle', color: C.dim, track: .3, opacity: 0});
  const SW = [T + 1, 2];
  return {seek(t) {
    c.seek(t); dial.draw(io(span(t, T - .2, 1.8))); inner.draw(ease(span(t, T, 1.6)));
    ticks.forEach((l, i) => l.draw(ease(span(t, T + .2 + (i < 30 ? i : 60 - i) * .025, .4))));
    labels.forEach((l, i) => l.attr('opacity', .85 * ease(span(t, T + .6 + (i < m / 2 ? i : m - i) * .06, .5))));
    const q = io(span(t, SW[0], SW[1])); sweep.draw(q);
    if (q > 0 && q < 1) { const [x, y] = along(sweepPts, q); head.at(x, y).set(1); } else head.set(0);
    const u = t - SW[0] - SW[1]; blue.set(u > 0 ? .3 + .6 * Math.exp(-u * 1.6) : 0, 1 + .3 * ease(u));
    num.show(ease(span(t, T + .7, 1.6))); lab.attr('opacity', .9 * ease(span(t, T + 1.5, .6)));
  }};
}
