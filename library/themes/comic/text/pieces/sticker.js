import {comicStage, C, look, up, fit, capH, txt, burst, captionBox, spark, halftonePath, burstPath, clipShape, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// Overlay: a cover burst. A jagged star (two-colour, with halftone dots unless `solid`) is
// slapped onto the frame at (x, y), spins to rest and keeps boiling; the word sits in it in
// shouted caps and the `ring` text rides on a caption box across its lower edge. `r` is its radius.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'NEW', ring: 'LIMITED RUN', x: 850, y: 340, r: 160, accent: 'red', solid: false, tilt: -12};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), r = props.r, text = up(props.text);
  const g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`).append('g');
  const star = burst(g, r, {fill: ink.accent, inner: props.solid ? null : ink.accent === C.yellow ? C.white : C.yellow, points: 14, depth: .76, seed: 5, drop: 11});
  if (!props.solid) star.g.append('path').attr('clip-path', clipShape(stage, burstPath(r * .7, {points: 14, depth: .84, seed: 45})).url).attr('d', halftonePath(-r, -r, r * 2, r * 2, {pitch: 16, from: [1, 1], reach: .55})).attr('fill', C.orange).attr('opacity', .8);
  const size = Math.min(fit(text, r * 1.15, r * 1.2 / capH(1))), cap = capH(size);
  txt(g, 0, cap / 2 - r * .06, text, {size, role: 'head', color: props.solid ? ink.on === C.ink ? C.white : C.yellow : C.red, anchor: 'middle', outline: Math.max(5, size * .085), drop: Math.max(4, size * .06)});
  const ring = captionBox(g, 0, r * .52, props.ring, {size: Math.min(34, fit(up(props.ring), r * 1.9, 34, {role: 'hand'})), anchor: 'middle', fill: C.white, tilt: 4});
  const sparks = [spark(g, r * .9, -r * .8, r * .2, C.white), spark(g, -r * .95, r * .5, r * .14, C.white)];
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, .05, .5), s = (q <= 0 ? 0 : 1 + 1.6 * (1 - spring(q))) * (1 - x);
      star.boil(t); scaleTo(g, s, props.tilt + (1 - easeOut(q)) * 60 + Math.sin(t * 2.4) * 2.5);
      scaleTo(ring.g, spring(span(t, .4, .4))); sparks.forEach((sp, i) => scaleTo(sp, spring(span(t, .5 + i * .15, .4)) * (1 + .2 * Math.sin(t * 6 + i * 2)), t * (i ? -50 : 60)));
    },
  };
}
