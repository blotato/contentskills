import {stage, capH, flow, flat, phrase, label, rule, cornerLabels, about, fade, glide, span, drift} from '../../kit.js';

// A quotation set like a film title card: the words fade up out of blur in the middle of the
// field between two short hairlines, with who said it in small print underneath.
export const meta = {duration: 5, live: true};
export const defaults = {
  quote: 'Buy less, choose well, wear it for years.', by: 'Note to self', role: 'pinned inside the wardrobe',
  labels: ['Quoted', 'Words to keep'], field: 'meadow', accent: 'poppy',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, o = {role: 'text'};
  const {size, lines, pitch} = flow('“' + flat(props.quote) + '”', W * .72, H * .36, 88, 32, o, 1.9), cap = capH(size, o), block = lines.length * pitch - (pitch - cap), top = H / 2 - block / 2 - 30;
  const g = root.append('g'), body = phrase(g, lines, W / 2, top, size, pitch, {role: 'text', color: ink.head, step: .05});
  const a = rule(g, W / 2 - 45, top - 60, 90, ink.head, 2), b = rule(g, W / 2 - 45, top + block + 60, 90, ink.accent, 3);
  const by = label(g, W / 2, top + block + 124, props.by, {size: 23, color: ink.head, anchor: 'middle'}), role = label(g, W / 2, top + block + 164, props.role, {size: 18, color: ink.dim, anchor: 'middle'}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); a.set(glide(span(t, 0, .5))); body.set(t, .12); const done = .12 + body.time;
      b.set(glide(span(t, done - .1, .5))); by.attr('opacity', fade(t, done, .4) * .9); role.attr('opacity', fade(t, done + .12, .4)); corners.set(t, .3); about(g, W / 2, H / 2, drift(t));
    },
  };
}
