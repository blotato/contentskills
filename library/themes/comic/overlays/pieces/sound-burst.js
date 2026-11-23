import {comicStage, C, look, up, fit, capH, measure, glyphs, pose, burst, burstPath, halftonePath, clipShape, zoomLinesPath, spark, scaleTo, span, spring, easeOut, leave, mix} from '../../kit.js';

// A sound effect. A two-colour burst with Ben-Day dots explodes at (x, y) and the word is thrown
// across it, each letter bigger than the last and riding an arc, with ink zoom lines flashing
// out on the hit. Use a made-up sound word; `r` is the burst's radius.
export const meta = {duration: 3, live: true};
export const defaults = {word: 'KA-THUNK!', x: 540, y: 340, r: 330, accent: 'yellow', tilt: -8};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), r = props.r, word = up(props.word), squash = .62;
  const g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`).append('g');
  const rays = g.append('path').attr('d', zoomLinesPath(0, 0, r * 1.02, r * 1.5, {n: 40, seed: 2, thick: 1.5})).attr('fill', C.ink).attr('transform', `scale(1 ${squash})`);
  const star = burst(g, r, {fill: ink.accent, inner: ink.accent === C.white ? C.yellow : C.white, points: 17, depth: .72, squash, seed: 6, drop: 12});
  star.g.append('path').attr('clip-path', clipShape(stage, burstPath(r * .7, {points: 17, depth: .8, squash, seed: 46})).url).attr('d', halftonePath(-r, -r * squash, r * 2, r * 2 * squash, {pitch: 20, from: [1, 1], reach: .55})).attr('fill', ink.accent === C.red ? C.yellow : C.sky).attr('opacity', .9);
  const size = Math.min(fit(word, r * 1.5, 400), r * squash * .95 / capH(1)), cap = capH(size), letters = glyphs(g, word, 0, cap / 2, size, {anchor: 'middle', color: ink.accent === C.red ? C.yellow : C.red, seed: 9}), n = letters.length;
  const sparks = [spark(g, r * .92, -r * squash * .9, 36, C.white), spark(g, -r * .98, r * squash * .7, 26, C.white)];
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .4);
      star.boil(t); scaleTo(g, (q <= 0 ? 0 : spring(q)) * (1 - x), props.tilt + Math.sin(t * 2.2) * 1.5);
      rays.attr('opacity', t > .08 && t < .42 ? 1 : 0).attr('transform', `scale(${.8 + easeOut(span(t, .08, .34)) * .35}) scale(1 ${squash})`);
      letters.forEach(u => { const k = n > 1 ? u.i / (n - 1) : .5, p = span(t, .1 + u.i * .045, .4), s = spring(p), sc = mix(.82, 1.2, k); pose(u, {y: -Math.sin(k * Math.PI) * cap * .12 + (k - .5) * -cap * .25, x: (k - .5) * size * .1, sx: sc * (1 + 1.6 * (1 - s)), rot: (1 - s) * 30 + Math.sin(t * 5 + u.i) * 1.2, o: p > 0 ? 1 : 0}); });
      sparks.forEach((sp, i) => scaleTo(sp, spring(span(t, .45 + i * .15, .4)) * (1 + .2 * Math.sin(t * 6 + i * 2)), t * (i ? -50 : 60)));
    },
  };
}
