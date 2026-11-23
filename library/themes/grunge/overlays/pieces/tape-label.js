import {C, stage, fit, capH, measure, txt, tapeStrip, hold, slam, jit, presence, leave} from '../../kit.js';

// A length of masking tape slapped across the footage with a note written on it in marker.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'watch this bit', x: 540, y: 360, tilt: -5, size: 84, width: 0, color: 'tape'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root} = st, o = {role: 'hand'}, size = Math.min(props.size, fit(props.text, 880, props.size, o)), cap = capH(size, o), w = Math.max(props.width, measure(props.text, size, o) + 150), g = root.append('g');
  tapeStrip(g, w, cap + size * .9, {color: C[props.color] ?? props.color, seed: 3, opacity: .93});
  const text = txt(g, 0, cap / 2, props.text, {size, role: 'hand', color: C.soot, anchor: 'middle'});
  return {seek(t) {
    const s = st.tick(t), k = slam(t, .05, {from: 1.8}), x = leave(t, props.life), j = jit(s, 4, 1.5 + k.hit * 7, .4 + k.hit * 2);
    g.attr('transform', `translate(${props.x + j.x} ${props.y + j.y}) rotate(${props.tilt + j.r}) scale(${k.s})`).attr('opacity', k.o * presence(t, props.life) * (x > .5 ? 0 : 1));
    text.attr('opacity', hold(t) >= .2 ? 1 : 0);
  }};
}
