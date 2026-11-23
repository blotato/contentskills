import {comicStage, C, look, up, fit, capH, measure, glyphs, slam, captionBox, plate, burst, spark, zoomLinesPath, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// Overlay: one shouted word. A burst pops behind it (or a slab, with `solid`), the letters slam
// down one by one, inked and extruded, a few zoom lines flash outward on the hit, and the
// `kicker` pops on in a caption box. `y` is the vertical centre.
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'UNSTOPPABLE', kicker: 'WORD OF THE DAY', y: 330, accent: 'red', solid: false, tilt: -3};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), word = up(props.word), y = props.y;
  const size = fit(word, 900, 250), cap = capH(size), w = measure(word, size), g = root.append('g').attr('transform', `translate(${W / 2} ${y}) rotate(${props.tilt})`);
  const rays = g.append('path').attr('d', zoomLinesPath(0, 0, w * .56, w * .9, {n: 34, seed: 3, thick: 1.4})).attr('fill', C.ink);
  const back = g.append('g'), star = props.solid ? null : burst(back, Math.min(500, w * .58 + 30), {fill: ink.accent, inner: ink.accent === C.yellow ? C.white : C.yellow, points: 16, depth: .78, squash: Math.min(1, (cap * 1.05 + 40) / Math.min(500, w * .58 + 30)), seed: 2});
  const slab = props.solid ? plate(back, {fill: ink.accent, cut: 50, drop: 12}).box(-w / 2 - 50, -cap / 2 - 40, w + 100, cap + 80) : null;
  const letters = glyphs(g, word, 0, cap / 2, size, {anchor: 'middle', color: props.solid ? ink.on === C.ink ? C.white : C.yellow : C.white});
  const ksize = fit(up(props.kicker), 900, 36, {role: 'hand'}), kicker = captionBox(g, -Math.max(Math.min(w / 2, 420), Math.min(480, measure(up(props.kicker), ksize, {role: 'hand'}) / 2 + 20)), -cap / 2 - 118, props.kicker, {size: ksize, tilt: -2});
  const star2 = spark(g, Math.min(w / 2, 440) + 10, -cap / 2 - 30, 36, C.white);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, .05, .45);
      star?.boil(t); scaleTo(back, spring(q) * (1 - x), (1 - easeOut(q)) * -20);
      rays.attr('transform', `scale(${.6 + easeOut(span(t, .15, .4)) * .7}) scale(1 ${Math.min(1, (cap + 120) / w)})`).attr('opacity', t > .15 && t < .5 ? 1 : 0);
      letters.forEach(u => { const p = span(t, .12 + u.i * .04, .45); slam(u, p, x, {drop: 30, live: p >= 1 ? Math.sin(t * 5 - u.i * .7) * .015 : 0}); });
      scaleTo(kicker.g, spring(span(t, .6, .4)) * (1 - x)); scaleTo(star2, spring(span(t, .75, .4)) * (1 - x) * (1 + .18 * Math.sin(t * 6)), t * 60);
    },
  };
}
