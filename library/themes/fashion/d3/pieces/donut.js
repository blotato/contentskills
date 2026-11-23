import {card, txt, label, stroke, ring, dot, draw, fit, wrap, capH, clamp, fade, glide, span} from '../../kit.js';
import {pace, hold, fmt} from './_local.js';

// A thin ring: a faint full circle, one hairline arc drawn round to the share, the accent dot on
// its tip, the figure in thin tall numerals in the middle. times: [arc starts, small print appears].
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Worn more than once', unit: 'Illustrative · share of wardrobe', clear: false, field: 'bone', accent: 'poppy',
  value: 62, total: 100, decimals: 0, prefix: '', suffix: '%', label: 'Of the rail', note: 'The rest waits for an occasion', speed: 1, times: null};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, k = pace(props), t0 = props.times?.[0] ?? .3 * k, t1 = props.times?.[1] ?? t0 + .6 * k;
  const cx = 500, cy = 548, r = 232, share = clamp(props.value / (props.total || 1));
  ring(g, cx, cy, r, ink.line, 1.5).attr('opacity', .3);
  const zero = stroke(g, `M${cx} ${cy - r - 14}V${cy - r + 14}`, ink.line, 1.5), arc = stroke(g, `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}`, ink.line, 4), tip = dot(g, 0, 0, 9, ink.accent);
  const size = fit(fmt(props.value, props), r * 1.45, 190, {role: 'num'}), cap = capH(size, {role: 'num'});
  const figure = txt(g, cx, cy + cap / 2 - 14, '', {size, role: 'num', color: ink.head, anchor: 'middle'}), name = label(g, cx, cy + cap / 2 + 36, props.label, {size: Math.min(17, fit(String(props.label || ' ').toUpperCase(), r * 1.5, 17, {role: 'label'})), color: ink.dim, anchor: 'middle'});
  const note = txt(g, cx, 862, wrap(String(props.note ?? '').toUpperCase(), 16, 780, {role: 'label'}).slice(0, 2).join('\n'), {size: 16, role: 'label', color: ink.dim, anchor: 'middle', leading: 1.7});
  return {seek(t) {
    hold(st, t);
    const e = glide(span(t, t0, 1.15 * k)), a = Math.PI * 2 * share * e;
    zero.attr('opacity', fade(t, .2 * k, .4 * k) * .6); draw(arc, share * e);
    tip.attr('cx', cx + r * Math.sin(a)).attr('cy', cy - r * Math.cos(a)).attr('opacity', fade(t, t0, .25 * k));
    figure.text(fmt(props.value * e, props)).attr('opacity', fade(t, t0, .4 * k));
    name.attr('opacity', fade(t, t1, .4 * k)); note.attr('opacity', fade(t, t1 + .15 * k, .4 * k));
  }};
}
