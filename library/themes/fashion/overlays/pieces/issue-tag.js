import {stage, capH, glyphs, pose, label, rule, leave, fade, glide, span, easeInOut} from '../../kit.js';

// A masthead mark for the top of the frame: a thin tall numeral between two lines of small print,
// with a short hairline — the issue / look / episode number. (x, y) is the numeral's baseline centre.
export const meta = {duration: 4, live: true};
export const defaults = {number: '04', over: 'Look', under: 'Autumn', x: 540, y: 300, size: 150, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, ink} = st, {x, y} = props, size = props.size, cap = capH(size, {role: 'num'}), g = root.append('g').attr('filter', st.soft).append('g');
  const num = glyphs(g, String(props.number), x, y, size, {by: 'letter', anchor: 'middle', role: 'num'}), over = label(g, x, y - cap - 34, props.over, {size: 21, anchor: 'middle'}), bar = rule(g, x - 40, y + 40, 80, ink.accent, 4), under = label(g, x, y + 88, props.under, {size: 21, anchor: 'middle'});
  return {
    seek(t) {
      const out = leave(t, props.life, .25);
      num.forEach(u => { const q = span(t, .05 + u.i * .08, .4); pose(u, {o: easeInOut(q) * (1 - out), blur: (1 - glide(q)) * size * .14, y: (1 - glide(q)) * cap * .08}); });
      over.attr('opacity', fade(t, 0, .35) * .9 * (1 - out)); bar.set(glide(span(t, .3, .5)) * (1 - out)); under.attr('opacity', fade(t, .4, .35) * .9 * (1 - out));
    },
  };
}
