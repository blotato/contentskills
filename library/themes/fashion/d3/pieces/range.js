import {card, txt, label, dot, fit, up, mix, clamp, fade, glide, span} from '../../kit.js';
import {cues, pace, hold, fmt} from './_local.js';

// Scales with a marker: a faint ticked hairline per row, a firmer segment for the usual range,
// and the accent dot gliding to the value, its figure above in thin tall numerals.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Where it sits', unit: 'Illustrative · scale of 100', clear: false, field: 'bone', accent: 'poppy', min: 0, max: 100, ticks: 10, ends: ['Less', 'More'], decimals: 0, prefix: '', suffix: '', speed: 1, times: null,
  rows: [{label: 'Drape', from: 30, to: 80, value: 64}, {label: 'Structure', from: 10, to: 55, value: 28}, {label: 'Weight', from: 40, to: 90, value: 72}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, rowsIn = props.rows.slice(0, 4), n = rowsIn.length, k = pace(props), at = cues(props, n, .3, .14);
  const x0 = 90, w = 820, pitch = Math.min(210, 570 / n), y0 = 280 + (570 - pitch * n) / 2, X = v => x0 + w * clamp((v - props.min) / ((props.max - props.min) || 1)), size = Math.min(66, pitch * .36);
  const rows = rowsIn.map((d, i) => {
    const y = y0 + pitch * (i + .6), back = g.append('g'), track = back.append('rect').attr('x', x0).attr('y', y - .75).attr('height', 1.5).attr('fill', ink.line).attr('opacity', .35);
    const marks = back.append('g').attr('opacity', .35); for (let j = 0; j <= props.ticks; j++) marks.append('rect').attr('x', x0 + w * j / props.ticks - .75).attr('y', y - 7).attr('width', 1.5).attr('height', 14).attr('fill', ink.line);
    const band = d.from != null && d.to != null ? g.append('rect').attr('y', y - 2).attr('height', 4).attr('fill', ink.line) : null;
    const name = label(g, x0, y + 46, d.label, {size: Math.min(17, fit(up(d.label), 500, 17, {role: 'label'})), color: ink.dim});
    const stem = g.append('rect').attr('y', y - 20).attr('width', 1.5).attr('height', 20).attr('fill', ink.accent), mark = dot(g, 0, y, 8, ink.accent);
    const value = txt(g, 0, y - 34, '', {size, role: 'num', color: ink.head, anchor: 'middle'});
    return {d, y, track, marks, band, name, stem, mark, value};
  });
  const ends = (props.ends ?? []).slice(0, 2).map((s, i) => label(g, i ? 910 : 90, 900, s, {size: 14, color: ink.dim, anchor: i ? 'end' : 'start'}));
  return {seek(t) {
    hold(st, t); ends.forEach((e, i) => e.attr('opacity', fade(t, (.5 + i * .1) * k, .5 * k)));
    rows.forEach(({d, track, marks, band, name, stem, mark, value}, i) => {
      const q = glide(span(t, at[i], .8 * k)), e = glide(span(t, at[i] + .15 * k, 1 * k)), v = mix(d.from ?? props.min, d.value, e), x = X(v), show = fade(t, at[i] + .15 * k, .3 * k);
      track.attr('width', w * q); marks.attr('opacity', fade(t, at[i], .5 * k) * .35); name.attr('opacity', fade(t, at[i], .4 * k));
      if (band) { const a = X(d.from), b = X(d.to), m = (a + b) / 2; band.attr('x', m - (m - a) * q).attr('width', (b - a) * q); }
      mark.attr('cx', x).attr('opacity', show); stem.attr('x', x - .75).attr('opacity', show);
      value.attr('x', clamp(x, x0 + 30, x0 + w - 30)).selectAll('tspan').attr('x', clamp(x, x0 + 30, x0 + w - 30)).text(fmt(v, props)); value.attr('opacity', show);
    });
  }};
}
