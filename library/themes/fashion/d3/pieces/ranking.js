import {card, txt, dot, fit, measure, capH, up, fade, glide, span, pad2} from '../../kit.js';
import {cues, pace, hold, fmt} from './_local.js';

// A credits-style list: number, name, figure, a hairline under each row. The accent dot follows
// the first row (or `highlight`).
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Most worn this season', unit: 'Illustrative · days worn', clear: false, field: 'bone', accent: 'poppy', highlight: 0, decimals: 0, prefix: '', suffix: '', speed: 1, times: null,
  items: [{label: 'White shirt', value: 41}, {label: 'Black trouser', value: 36}, {label: 'Trench coat', value: 28}, {label: 'Knit vest', value: 19}, {label: 'Silk scarf', value: 12}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, items = props.items, n = items.length, k = pace(props), at = cues(props, n, .3, .1);
  const pitch = Math.min(124, 640 / n), top = 240, vs = Math.min(60, pitch * .5), ns = Math.min(32, pitch * .28), str = d => typeof d.value === 'number' ? fmt(d.value, props) : String(d.value ?? '');
  const rows = items.map((d, i) => {
    const y = top + pitch * (i + 1), base = y - pitch * .3, row = g.append('g'), vw = measure(str(d), vs, {role: 'num'}), size = Math.min(ns, fit(up(d.label), 820 - 86 - vw - 60, ns, {role: 'wide'}));
    txt(row, 90, base, pad2(i + 1), {size: ns * .8, role: 'num', color: ink.dim});
    txt(row, 176, base, up(d.label), {size, role: 'wide', color: ink.head});
    const value = txt(row, 910, base, '', {size: vs, role: 'num', color: ink.head, anchor: 'end'});
    const mark = i === props.highlight ? dot(row, 176 + measure(up(d.label), size, {role: 'wide'}) + 16, base - capH(size) / 2, 6, ink.accent) : null;
    return {d, row, value, mark, hair: g.append('rect').attr('x', 90).attr('y', y - .75).attr('height', 1.5).attr('fill', ink.line).attr('opacity', .3)};
  });
  return {seek(t) {
    hold(st, t);
    rows.forEach(({d, row, value, mark, hair}, i) => {
      const e = glide(span(t, at[i], .9 * k)); row.attr('opacity', fade(t, at[i], .4 * k)); hair.attr('width', 820 * e);
      value.text(typeof d.value === 'number' ? fmt(d.value * e, props) : str(d)); mark?.attr('opacity', fade(t, at[i] + .3 * k, .4 * k));
    });
  }};
}
