import {C, stage, look, up, fit, capH, measure, txt, sheet, chip, hold, span, jit, easeOut, presence, leave} from '../../kit.js';

// A strip of paper pasted up the side of the frame, reading bottom to top (left) or top to
// bottom (right), with a typed sub-label on a second scrap. It is pushed in from the edge.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'BEHIND THE SCENES', sub: 'PART 02 / UNCUT', side: 'left', accent: 'red', top: 300, bottom: 1560, edge: 36};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, ink = look(props.accent), room = props.bottom - props.top, left = props.side !== 'right', text = up(props.text);
  const size = fit(text, room - 120, 84), cap = capH(size), L = measure(text, size) + 100, bw = cap + 56, pad = (room - L) / 2;
  // Local x runs along the edge (upward on the left, downward on the right); local y runs into the frame.
  const g = root.append('g'), inner = g.append('g');
  sheet(inner, {fill: C.soot, seed: 3, sides: 'rl', amp: 10, rim: C.white}).set(0, 0, L, bw);
  txt(inner, 50, bw / 2 + cap / 2, text, {size, role: 'head', color: ink.accent});
  const sub = inner.append('g'); if (props.sub) chip(sub.append('g'), up(props.sub), {size: 28, role: 'type', fill: C.bone, seedv: 4}); const sw = props.sub ? measure(up(props.sub), 28, {role: 'type'}) / 2 + 30 : 0;
  sub.attr('transform', `translate(${L - sw - 30} ${bw + 26}) rotate(-2)`);
  return {seek(t) {
    const s = st.tick(t), h = hold(t), q = easeOut(span(h, .05, .3)), x = leave(t, props.life), j = jit(s, 2, 2, .3), off = -(1 - q + x) * (bw + 140);
    g.attr('transform', left ? `translate(${props.edge + off + j.x} ${props.bottom - pad + j.y}) rotate(${-90 + j.r})` : `translate(${W - props.edge - off + j.x} ${props.top + pad + j.y}) rotate(${90 + j.r})`).attr('opacity', presence(t, props.life));
    sub.attr('opacity', h >= .5 ? 1 : 0);
  }};
}
