import {card, txt, label, rule, fit, up, fade, glide, span} from '../../kit.js';
import {cues, pace, hold, fmt} from './_local.js';

// Hairline-thin bars rising from one rule; the tallest (or `highlight`) is the single accent bar.
// Values in thin tall numerals above, labels as small print below.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Where the hours go', unit: 'Illustrative · hours per look', clear: false, field: 'bone', accent: 'poppy', highlight: null, max: null, barWidth: 6,
  decimals: 0, prefix: '', suffix: '', speed: 1, times: null,
  items: [{label: 'Sketch', value: 6}, {label: 'Cut', value: 9}, {label: 'Sew', value: 14}, {label: 'Fit', value: 5}, {label: 'Press', value: 3}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, items = props.items, n = items.length, k = pace(props), at = cues(props, n, .3, .1);
  const x0 = 90, w = 820, slot = w / n, base = 800, full = 390, bw = props.barWidth, top = Math.max(...items.map(d => d.value)), max = props.max ?? top, lead = props.highlight ?? items.findIndex(d => d.value === top);
  const ls = Math.max(11, Math.min(17, ...items.map(d => fit(up(d.label), slot - 16, 17, {role: 'label'}))));
  const floor = rule(g, x0, base, w, ink.line, 1.5), size = Math.min(72, slot * .44, ...items.map(d => fit(fmt(d.value, props), slot - 14, 72, {role: 'num'})));
  const bars = items.map((d, i) => {
    const cx = x0 + slot * (i + .5), hot = i === lead;
    return {d, h: Math.max(2, full * d.value / max),
      bar: g.append('rect').attr('x', cx - bw / 2).attr('width', bw).attr('fill', hot ? ink.accent : ink.line),
      name: label(g, cx, base + 48, d.label, {size: ls, color: hot ? ink.head : ink.dim, anchor: 'middle'}),
      value: txt(g, cx, 0, '', {size, role: 'num', color: ink.head, anchor: 'middle'})};
  });
  return {seek(t) {
    hold(st, t); floor.set(glide(span(t, .15 * k, .8 * k))); floor.node.attr('opacity', .5);
    bars.forEach(({d, h, bar, name, value}, i) => {
      const e = glide(span(t, at[i], .9 * k)), hh = h * e;
      bar.attr('y', base - hh).attr('height', hh);
      value.attr('y', base - hh - 20).attr('opacity', fade(t, at[i], .35 * k)).text(fmt(d.value * e, props));
      name.attr('opacity', fade(t, at[i], .4 * k));
    });
  }};
}
