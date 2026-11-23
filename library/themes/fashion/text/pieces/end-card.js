import {stage, capH, word, wordFit, label, ring, dot, draw, credit, cornerLabels, about, fade, glide, span, drift} from '../../kit.js';

// The close: the field dims to near-black, a thin ring draws with one accent dot riding on it,
// the closing lines are typed on in the middle, the call to action and handle sit under them in
// small print and one credit line runs along the bottom.
export const meta = {duration: 5.5, live: true};
export const defaults = {
  lines: ['SEE YOU', 'SOON'], action: 'New film every Sunday', handle: '@yourname', strip: 'Thanks for watching',
  labels: ['The end', 'For now'], field: 'noir', accent: 'poppy',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, lines = props.lines;
  const size = Math.min(wordFit(lines, W * .74, 170), H * .2 / (lines.length * capH(1) * 1.34)), cap = capH(size), pitch = cap * 1.36, block = lines.length * pitch - (pitch - cap), r = Math.min(64, H * .04), top = H / 2 - block / 2 + r * .6;
  const g = root.append('g'), mark = ring(g, W / 2, top - 70 - r, r, ink.head, 2).attr('transform', `rotate(-90 ${W / 2} ${top - 70 - r})`), spot = dot(g, 0, 0, 8, ink.accent);
  const rows = lines.map((line, i) => word(g, line, W / 2, top + cap + i * pitch, size, {color: ink.head}));
  const action = label(g, W / 2, top + block + 84, props.action, {size: Math.min(30, wordFit(props.action, W * .8, 30)), color: ink.head, anchor: 'middle'}), handle = label(g, W / 2, top + block + 146, props.handle, {size: 26, color: ink.dim, anchor: 'middle'});
  const foot = credit(root, st, [props.strip], H - 96, {color: ink.head}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); const q = glide(span(t, 0, 1.1)), a = -Math.PI / 2 + q * Math.PI * 2;
      draw(mark, q); spot.attr('cx', W / 2 + Math.cos(a) * r).attr('cy', top - 70 - r + Math.sin(a) * r).attr('opacity', fade(t, .05, .3));
      let at = .3; rows.forEach(row => { row.set(t, at); at += row.time * .6; });
      action.attr('opacity', fade(t, at + .1, .5) * .9); handle.attr('opacity', fade(t, at + .3, .5)); foot.set(t, at + .4); corners.set(t, .3); about(g, W / 2, H / 2, drift(t));
    },
  };
}
