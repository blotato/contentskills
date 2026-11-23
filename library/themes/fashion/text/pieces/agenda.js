import {stage, capH, fit, up, flat, pad2, word, wordFit, glyphs, pose, txt, label, rule, cornerLabels, fade, glide, span, easeInOut} from '../../kit.js';

// A running order set like film credits: the title typed on at the top, then one row per item —
// a thin numeral, the item in caps, a hairline — arriving `step` seconds apart (or at `times`).
export const meta = {duration: 5, live: true};
export const defaults = {
  title: 'The edit', kicker: 'four looks', items: ['The long coat', 'Wide trousers', 'One good shirt', 'Flat shoes'],
  labels: ['Running order', 'In this order'], step: .45, times: null, field: 'noir', accent: 'poppy',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, m = 110, items = props.items.map(s => up(flat(s))), n = items.length;
  const tsize = wordFit(props.title, W - m * 2, 96), tcap = capH(tsize), rh = Math.min(150, (H * .5) / n), isize = Math.min(rh * .36, fit(items, W - m * 2 - 130, 60, {role: 'bold'})), block = tcap + 90 + rh * n, top = (H - block) / 2 + 10;
  const kicker = label(root, m, top - 46, props.kicker, {size: 21, color: ink.head}), title = word(root, props.title, m, top + tcap, tsize, {anchor: 'start', color: ink.head}), head = rule(root, m, top + tcap + 50, W - m * 2, ink.head, 2);
  const rows = items.map((item, i) => {
    const y = top + tcap + 90 + rh * (i + .62), g = root.append('g');
    const num = glyphs(g, pad2(i + 1), m, y, isize * 1.25, {by: 'all', role: 'num', color: i === 0 ? ink.accent : ink.dim})[0], text = glyphs(g, item, m + 130, y, isize, {by: 'all', role: 'bold', color: ink.head})[0];
    return {num, text, line: rule(g, m, y + rh * .38, W - m * 2, ink.head, 1.5), at: props.times?.[i] ?? .5 + i * props.step};
  });
  const corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); kicker.attr('opacity', fade(t, 0, .4) * .82); title.set(t, .05); head.set(glide(span(t, .2, .6))); head.node.attr('opacity', .9);
      rows.forEach(r => { const q = span(t, r.at, .4), e = glide(q); [r.num, r.text].forEach((u, k) => pose(u, {x: (1 - e) * 26, o: easeInOut(span(t, r.at + k * .06, .35)), blur: (1 - e) * 8})); r.line.set(glide(span(t, r.at + .05, .6))); r.line.node.attr('opacity', .35); });
      corners.set(t, .3);
    },
  };
}
