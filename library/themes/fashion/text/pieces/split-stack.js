import {stage, capH, word, wordFit, label, rule, plate, cornerLabels, about, fade, glide, swell, span, drift} from '../../kit.js';

// Two words, two voices, on the theme's frame device: a clean card floats over the blurred
// field; the top word arrives tall and condensed with its tracking closing up, a hairline
// draws, and the bottom word is typed on in heavy caps. Small print under the card.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  top: 'GOLDEN', bottom: 'HOUR', caption: 'the best light is free', note: 'go outside',
  labels: ['Part two', 'Light', 'Notes', 'Pg. 04'], field: 'dusk', accent: 'poppy',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st;
  const cw = W * .66, ch = Math.min(H * .5, cw * 1.25), cx = W / 2, cy = H / 2 - 20, card = plate(root, st, cx - cw / 2, cy - ch / 2, cw, ch), g = root.append('g');
  const s1 = Math.min(wordFit(props.top, cw * .8, 210, 'tall'), ch * .3 / capH(1, {role: 'tall'})), c1 = capH(s1, {role: 'tall'}), s2 = Math.min(wordFit(props.bottom, cw * .8, 150), ch * .2 / capH(1)), c2 = capH(s2), gap = 56;
  const y0 = cy - (c1 + gap * 2 + c2) / 2, a = word(g, props.top, cx, y0 + c1, s1, {face: 'tall', color: ink.head}), line = rule(g, cx - 50, y0 + c1 + gap, 100, ink.head, 2), b = word(g, props.bottom, cx, y0 + c1 + gap * 2 + c2, s2, {color: ink.head});
  const caption = label(root, cx, cy + ch / 2 + 70, props.caption, {size: 21, color: ink.head, anchor: 'middle'}), note = label(root, cx, cy - ch / 2 - 44, props.note, {size: 19, color: ink.head, anchor: 'middle'});
  const corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); card.set(t, swell(span(t, 0, .6)));
      a.set(t, .25); line.set(glide(span(t, .55, .5))); b.set(t, .6);
      caption.attr('opacity', fade(t, .9, .5) * .82); note.attr('opacity', fade(t, .2, .5) * .7); corners.set(t, .3);
      about(g, cx, cy, drift(t));
    },
  };
}
