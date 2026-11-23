import {card, txt, fit, wrap, capH, fade, glide, span, clamp} from '../../kit.js';
import {pace, hold, fmt} from './_local.js';

// A share counted out in dots: a quiet grid of pin-points, the counted ones filling in one after
// another, the last one in the accent. The figure stands beside it in thin tall numerals.
// times: [count starts, small print appears].
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Bought and never worn', unit: 'Illustrative · out of 100 pieces', clear: false, field: 'bone', accent: 'poppy',
  value: 23, total: 100, cols: 10, decimals: 0, prefix: '', suffix: '', label: 'Still carry\nthe tag', speed: 1, times: null};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, k = pace(props), t0 = props.times?.[0] ?? .3 * k, t1 = props.times?.[1] ?? t0 + .6 * k;
  const total = Math.max(1, Math.round(props.total)), cols = Math.max(1, props.cols), rowsN = Math.ceil(total / cols), cell = Math.min(450 / cols, 560 / rowsN), gx = 910 - cell * cols, gy = 570 - cell * rowsN / 2, count = clamp(Math.round(props.value), 0, total);
  const dots = Array.from({length: total}, (_, i) => {
    const x = gx + cell * (i % cols + .5), y = gy + cell * (Math.floor(i / cols) + .5), on = i < count;
    g.append('circle').attr('cx', x).attr('cy', y).attr('r', Math.max(1.5, cell * .055)).attr('fill', ink.line).attr('opacity', .35);
    return on ? g.append('circle').attr('cx', x).attr('cy', y).attr('fill', i === count - 1 ? ink.accent : ink.line) : null;
  });
  const room = gx - 90 - 50, size = fit(fmt(props.value, props), room, 250, {role: 'num'}), cap = capH(size, {role: 'num'}), base = 520 + cap / 2;
  const figure = txt(g, 84, base, '', {size, role: 'num', color: ink.head});
  const lines = String(props.label ?? '').split('\n').flatMap(s => wrap(s.toUpperCase(), 18, room, {role: 'label'})).slice(0, 4), name = txt(g, 90, base + 58, lines.join('\n'), {size: 18, role: 'label', color: ink.dim, leading: 1.75});
  return {seek(t) {
    hold(st, t);
    const e = glide(span(t, t0, 1.1 * k)); figure.text(fmt(props.value * e, props)).attr('opacity', fade(t, t0, .4 * k));
    dots.forEach((d, i) => d?.attr('r', cell * .21 * glide(span(t, t0 + (i / Math.max(1, count)) * .8 * k, .45 * k))));
    name.attr('opacity', fade(t, t1, .4 * k));
  }};
}
