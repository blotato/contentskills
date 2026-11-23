import {C, stage, txt, fit, leave, fade, glide, span, swell, mix} from '../../kit.js';
import {inks, plate, small} from './_ui.js';

// Before and after as two cards: the "before" card sits in front; at `swapAt` it slides aside and back while
// the "after" card comes forward and takes the accent rule. Each side: {label, value, note}. Values are
// whatever you pass — real figures or words; nothing is invented here. (x, y) top-left, `w` x `h` the card.
export const meta = {duration: 4, live: true};
export const defaults = {a: {label: 'Before', value: 'Raw clip', note: 'As recorded'}, b: {label: 'After', value: 'Edited reel', note: 'Ready to post'}, swapAt: 1.2, x: 150, y: 1140, w: 700, h: 400, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {x, y, w, h} = props, g = st.root.append('g');
  const make = (d, theme) => { const ink = inks(theme), c = g.append('g'); plate(c, st, 0, 0, w, h, theme); small(c, 44, 66, d.label, ink);
    const size = Math.min(150, fit(String(d.value).toUpperCase(), w - 88, 150, {role: 'tall'})); txt(c, 44, h * .5 + size * .36, String(d.value).toUpperCase(), {size, role: 'tall', color: ink.head});
    if (d.note) small(c, 44, h - 46, d.note, ink, {color: ink.head}); return {c, bar: c.append('rect').attr('x', 44).attr('y', h - 104).attr('height', 6).attr('fill', st.ink.accent)}; };
  const back = make(props.b, props.theme === 'ink' ? 'bone' : 'ink'), front = make(props.a, props.theme);
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26)), q = swell(span(t, props.swapAt, .5)), arc = Math.sin(Math.PI * q);
      g.attr('opacity', fade(t, 0, .1) * (1 - out)).attr('transform', `translate(0 ${(1 - into) * 70})`);
      const pose = (c, k, side) => c.attr('transform', `translate(${x + mix(0, 80, k) + side * arc * 150} ${y + mix(0, -64, k)}) scale(${mix(1, .9, k)})`);
      pose(front.c, q, -1); pose(back.c, 1 - q, 1); if (q > .5) back.c.raise(); else front.c.raise();
      front.bar.attr('width', 0); back.bar.attr('width', 120 * glide(span(t, props.swapAt + .35, .4)));
    },
  };
}
