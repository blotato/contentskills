import {stage, fit, up, flat, pad2, glyphs, pose, label, rule, leave, fade, glide, span, easeInOut} from '../../kit.js';

// A short list set on the footage like film credits: a line of small print, then one row per item
// (a thin numeral, the item in caps, a hairline) arriving as each is named — `times` are seconds
// after the overlay starts. `strike: true` then draws the accent hairline through each item, for
// lists of things that are NOT needed. (x, y) is the top-left corner, `w` the width.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Packing light', items: ['One coat', 'Two shirts', 'Good shoes'], times: null, step: .5, strike: false, x: 90, y: 150, w: 720, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, ink} = st, {x, y, w} = props, items = props.items.map(s => up(flat(s))), size = Math.min(58, fit(items, w - 110, 58, {role: 'bold'})), rh = size * 2.3;
  const g = root.append('g').attr('filter', st.soft).append('g'), title = label(g, x, y, props.title, {size: 21}), head = rule(g, x, y + 26, w, '#fff', 2);
  const rows = items.map((item, i) => {
    const by = y + 26 + rh * (i + .68), num = glyphs(g, pad2(i + 1), x, by, size * 1.2, {by: 'all', role: 'num'})[0], text = glyphs(g, item, x + 92, by, size, {by: 'all', role: 'bold'})[0];
    return {num, text, line: rule(g, x, by + rh * .32, w, '#fff', 1.5), cut: rule(g, x + 84, by - size * .34, text.w + 16, ink.accent, 5), at: props.times?.[i] ?? .3 + i * props.step};
  });
  return {
    seek(t) {
      const out = leave(t, props.life, .25);
      title.attr('opacity', fade(t, 0, .35) * .9 * (1 - out)); head.set(glide(span(t, 0, .5)) * (1 - out)); head.node.attr('x', x).attr('opacity', .9);
      rows.forEach(r => {
        const e = glide(span(t, r.at, .35));
        [r.num, r.text].forEach((u, k) => pose(u, {x: (1 - e) * 22, o: easeInOut(span(t, r.at + k * .05, .3)) * (1 - out) * (k ? 1 : .8), blur: (1 - e) * 8}));
        const lq = glide(span(t, r.at + .05, .5)) * (1 - out); r.line.node.attr('x', x).attr('width', w * lq).attr('opacity', .4);
        const cq = props.strike ? glide(span(t, r.at + .3, .35)) * (1 - out) : 0; r.cut.node.attr('x', x + 84).attr('width', (r.text.w + 16) * cq);
      });
    },
  };
}
