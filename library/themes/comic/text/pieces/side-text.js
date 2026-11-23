import {comicStage, C, look, up, fit, capH, measure, glyphs, letterOn, plate, captionBox, spark, scaleTo, span, spring, easeOut, leave, vel} from '../../kit.js';

// Overlay: a spine. A tall slab shoots up one edge of the frame like the spine of a comic, its
// words lettered on along it, with a caption box for the `sub` line and a spark at its head.
// `side` is 'left' or 'right'; `top` and `bottom` bound it; `edge` is the gap to the frame edge.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'BEHIND THE SCENES', sub: 'PART 02 / UNCUT', side: 'left', accent: 'blue', top: 300, bottom: 1560, edge: 36};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), room = props.bottom - props.top, left = props.side !== 'right', o = {role: 'head'};
  const text = up(props.text), size = fit(text, room - 150, 92, o), cap = capH(size, o), bw = cap + 56, L = Math.min(room, measure(text, size, o) + 130);
  // Drawn lying down (reading left to right) and turned so it reads bottom-to-top on the left edge, top-to-bottom on the right.
  const g = root.append('g').attr('transform', left ? `translate(${props.edge + bw / 2} ${props.bottom}) rotate(-90)` : `translate(${W - props.edge - bw / 2} ${props.top}) rotate(90)`);
  const slab = plate(g, {fill: ink.accent, cut: 44, drop: 10}), letters = glyphs(g, text, 48, cap / 2, size, {color: ink.on === C.ink ? C.white : C.yellow, outline: size * .08, drop: size * .05});
  const sub = captionBox(g, 60, bw / 2 + 14, props.sub, {size: 30, tilt: -1.5}), star = spark(g, L + 6, -bw / 2, 32, C.white);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .45), e = spring(q) * (1 - x);
      slab.box(0, -bw / 2, L * e, bw); slab.g.attr('transform', `skewX(${-vel(q) * 14})`);
      letters.forEach(u => letterOn(u, span(t, .25 + u.i * .035, .3), x));
      scaleTo(sub.g, spring(span(t, .7, .4)) * (1 - x)); scaleTo(star, spring(span(t, .6, .4)) * (1 - x) * (1 + .18 * Math.sin(t * 6)), t * 60);
    },
  };
}
