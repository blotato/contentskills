import {stage, capH, word, wordFit, label, rule, cornerLabels, about, fade, glide, span, drift} from '../../kit.js';

// The theme's headline card: one to three short lines in the middle of an out-of-focus field,
// revealed letter by letter out of blur, with a line of small print above, a short accent
// hairline below and tiny labels in the corners. `face`: 'wide' (heavy caps) or 'tall' (condensed).
export const meta = {duration: 4.5, live: true};
export const defaults = {
  lines: ['NEW', 'SEASON'], kicker: 'Introducing', note: 'A film in three parts',
  labels: ['Vol. 01', 'Autumn'], foot: ['', ''], field: 'stone', face: 'wide', accent: 'poppy',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, lines = props.lines, role = props.face === 'tall' ? 'tall' : 'wide';
  const size = Math.min(wordFit(lines, W * .76, 200, props.face), H * .24 / (lines.length * capH(1, {role}) * 1.3)), cap = capH(size, {role}), pitch = cap * 1.34, block = lines.length * pitch - (pitch - cap), top = H / 2 - block / 2;
  const g = root.append('g'), rows = lines.map((line, i) => word(g, line, W / 2, top + cap + i * pitch, size, {face: props.face, color: ink.head, seed: i + 1}));
  const kicker = label(g, W / 2, top - 62, props.kicker, {size: 22, color: ink.head, anchor: 'middle'}), line = rule(g, W / 2 - 55, top + block + 64, 110, ink.accent, 3);
  const note = label(g, W / 2, top + block + 132, props.note, {size: 20, color: ink.head, anchor: 'middle'}), corners = cornerLabels(st, [props.labels?.[0], props.labels?.at(-1), ...(props.foot ?? [])]);
  return {
    seek(t) {
      st.tick(t); let at = .12;
      rows.forEach(row => { row.set(t, at); at += row.time * .6; });
      kicker.attr('opacity', fade(t, 0, .4) * .85); line.set(glide(span(t, at, .5))); note.attr('opacity', fade(t, at + .1, .5) * .8);
      corners.set(t, .25); about(g, W / 2, H / 2, drift(t));
    },
  };
}
