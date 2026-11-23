import {stage, capH, flow, up, flat, phrase, rule, leave, glide, span} from '../../kit.js';

// Overlay: a short phrase in caps set on the footage, its words fading up out of blur one after
// another; the words in `mark` then get the accent hairline drawn under them. `y` is its middle.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'This is the part worth slowing down for', mark: 'slowing down', y: 330, accent: 'poppy', width: 820, maxSize: 62};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, ink} = st, o = {role: 'bold'}, key = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  const {size, lines, pitch} = flow(up(flat(props.text)), props.width, 400, props.maxSize, 30, o, 1.8), cap = capH(size, o), block = lines.length * pitch - (pitch - cap), top = props.y - block / 2;
  const g = root.append('g').attr('filter', st.soft).append('g'), body = phrase(g, lines, W / 2, top, size, pitch, {step: .05, len: .26}), marks = String(props.mark ?? '').split(/\s+/).map(key).filter(Boolean);
  const hits = body.units.filter(u => marks.includes(key(u.str))), bars = hits.map(u => rule(g, u.cx - u.w / 2, u.y + cap * .42, u.w, ink.accent, 5));
  return {
    seek(t) {
      const x = leave(t, props.life, .25); body.set(t, .02, x);
      bars.forEach((b, i) => { b.set(glide(span(t, .02 + body.time * .7 + i * .08, .4))); b.node.attr('opacity', 1 - x); });
    },
  };
}
