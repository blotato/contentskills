import {stage, capH, word, wordFit, label, leave, fade, glide, span} from '../../kit.js';

// Overlay: a name set like a film credit. A short accent hairline stands at the left, the name is
// typed on in heavy caps beside it and the role sits under it in small print. `y` is the name's baseline.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'Maya Lindqvist', role: 'Stylist', x: 70, y: 1500, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, ink} = st, size = wordFit(props.name, 760, 58), cap = capH(size), x = props.x, y = props.y;
  const g = root.append('g').attr('filter', st.soft).append('g'), bar = g.append('rect').attr('x', x).attr('width', 4).attr('fill', ink.accent);
  const name = word(g, props.name, x + 30, y, size, {anchor: 'start'}), role = label(g, x + 30, y + 46, props.role, {size: 21});
  return {
    seek(t) {
      const out = leave(t, props.life, .25), h = (cap + 56) * glide(span(t, 0, .45)) * (1 - out);
      bar.attr('y', y - cap - 4).attr('height', h); name.set(t, .1, out); role.attr('opacity', fade(t, .2 + name.time * .6, .4) * .88 * (1 - out));
    },
  };
}
