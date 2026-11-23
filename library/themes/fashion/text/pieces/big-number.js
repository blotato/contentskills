import {stage, capH, fit, up, flat, word, wordFit, label, rule, cornerLabels, about, fade, glide, span, drift} from '../../kit.js';

// A figure, said quietly: thin tall numerals in the middle of the field (they count up when the
// value is a whole number), small print above, the unit typed on in heavy caps below, one hairline.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  value: '30', kicker: 'Look', label: 'pieces, one rail', note: 'illustrative',
  labels: ['The count', 'No. 01'], field: 'bone', accent: 'poppy',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, value = String(props.value), o = {role: 'num'}, m = /^(\D*)(\d+)(\D*)$/.exec(value);
  const nsize = Math.min(fit(value, W * .7, 760, o), H * .3 / capH(1, o)), ncap = capH(nsize, o), lsize = wordFit(props.label, W * .7, 54), lcap = capH(lsize), block = ncap + 84 + lcap, top = H / 2 - block / 2;
  const g = root.append('g'), num = word(g, value, W / 2, top + ncap, nsize, {role: 'num', face: 'tall', color: ink.head, len: .5});
  const kicker = label(g, W / 2, top - 56, props.kicker, {size: 22, color: ink.head, anchor: 'middle'}), line = rule(g, W / 2 - 55, top + ncap + 44, 110, ink.accent, 3), unit = word(g, props.label, W / 2, top + block, lsize, {color: ink.head});
  const note = label(g, W / 2, top + block + 70, props.note, {size: 19, color: ink.dim, anchor: 'middle'}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); num.set(t, .1);
      if (m && num.units.length === value.replace(/\s/g, '').length) { const shown = (m[1] + String(Math.round(Number(m[2]) * glide(span(t, .1, .9)))).padStart(m[2].length, '0') + m[3]); num.units.forEach((u, i) => u.text.text(shown[i] ?? u.str)); }
      kicker.attr('opacity', fade(t, 0, .4) * .85); line.set(glide(span(t, .5, .5))); unit.set(t, .6); note.attr('opacity', fade(t, 1.1, .5) * .9); corners.set(t, .3);
      about(g, W / 2, H / 2, drift(t));
    },
  };
}
