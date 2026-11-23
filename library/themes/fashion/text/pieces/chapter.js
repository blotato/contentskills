import {stage, capH, fit, word, wordFit, label, rule, plate, cornerLabels, about, fade, glide, swell, span, drift} from '../../kit.js';

// A chapter card on the frame device: a clean card opens over the blurred field holding a thin
// tall numeral; the chapter title is typed on in heavy caps under it, small print above.
export const meta = {duration: 4.5, live: true};
export const defaults = {number: '02', kicker: 'Chapter', title: 'The fitting', note: 'where nothing is rushed', labels: ['Section', 'Pt. 02'], field: 'stone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, number = String(props.number), o = {role: 'num'};
  const cw = W * .5, ch = Math.min(H * .36, cw * 1.2), tsize = wordFit(props.title, W * .76, 92), tcap = capH(tsize), block = ch + 96 + tcap, top = (H - block) / 2, cx = W / 2;
  const card = plate(root, st, cx - cw / 2, top, cw, ch), g = root.append('g'), nsize = Math.min(fit(number, cw * .6, 520, o), ch * .52 / capH(1, o)), ncap = capH(nsize, o);
  const num = word(g, number, cx, top + ch / 2 + ncap / 2, nsize, {role: 'num', face: 'tall', color: ink.head, len: .5}), kicker = label(g, cx, top + 60, props.kicker, {size: 20, color: ink.head, anchor: 'middle'});
  const title = word(root, props.title, cx, top + block, tsize, {color: ink.head}), line = rule(root, cx - 50, top + block + 52, 100, ink.accent, 3), note = label(root, cx, top + block + 112, props.note, {size: 20, color: ink.head, anchor: 'middle'}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); card.set(t, swell(span(t, 0, .6))); num.set(t, .25); kicker.attr('opacity', fade(t, .3, .4) * .85); about(g, cx, top + ch / 2, drift(t, .05));
      title.set(t, .5); line.set(glide(span(t, .5 + title.time, .5))); note.attr('opacity', fade(t, .6 + title.time, .5) * .8); corners.set(t, .3);
    },
  };
}
